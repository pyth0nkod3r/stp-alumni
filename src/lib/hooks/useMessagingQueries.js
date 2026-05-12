import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import messagingService from '../services/messagingService';
import useMessagingStore from '../store/useMessagingStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


// ─── Constants ───────────────────────────────────────────────────
const CONVERSATIONS_POLL_INTERVAL = 20 * 1000; // 20s — background poll for new conversations
const MESSAGES_POLL_INTERVAL = 8 * 1000;       // 8s — active chat poll for new messages

// ─── Query Keys ──────────────────────────────────────────────────
export const messagingKeys = {
  conversations: ['messaging', 'conversations'],
  messages: (conversationId) => ['messaging', 'messages', conversationId],
  messagesInfinite: (conversationId) => ['messaging', 'messagesInfinite', conversationId],
  invitations: ['messaging', 'invitations'],
  publicGroups: (params) => ['messaging', 'publicGroups', params],
  joinRequests: (groupId) => ['messaging', 'joinRequests', groupId],
};

// ─── Conversations ───────────────────────────────────────────────

/**
 * Fetch all conversations and sync to Zustand store.
 */
export function useConversations() {
  const setConversations = useMessagingStore((s) => s.setConversations);

  return useQuery({
    queryKey: messagingKeys.conversations,
    queryFn: async () => {
      const data = await messagingService.getConversations();
      const conversations = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setConversations(conversations);
      return conversations;
    },
    staleTime: 15 * 1000,
    refetchInterval: CONVERSATIONS_POLL_INTERVAL,
    refetchIntervalInBackground: false, // Only poll when tab is visible
    onError: () => {
      // Silent on poll failures — only toast on first load
    },
  });
}

/**
 * Fetch full details of a single conversation.
 */
export function useConversationDetails(conversationId) {
  return useQuery({
    queryKey: ['messaging', 'conversationDetails', conversationId],
    queryFn: () => messagingService.getConversationDetails(conversationId),
    enabled: !!conversationId,
    staleTime: 60 * 1000,
  });
}

// ─── Messages ────────────────────────────────────────────────────

/**
 * Fetch paginated messages for a conversation and sync to store.
 * @param {string|null} conversationId
 * @param {Object} params - { page, limit }
 */
export function useMessages(conversationId, params = { page: 1, limit: 30 }) {
  const setMessages = useMessagingStore((s) => s.setMessages);

  return useQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: async () => {
      const data = await messagingService.getMessages(conversationId, params);
      const messages = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setMessages(conversationId, messages);
      return data; // Return full response for meta (pagination info)
    },
    enabled: !!conversationId,
    staleTime: 8 * 1000,
    refetchInterval: MESSAGES_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    onError: () => {
      // Silent on poll failures
    },
  });
}

/**
 * Infinite query for paginated message history (load older messages on scroll up).
 * @param {string|null} conversationId
 * @param {number} limit - messages per page
 */
export function useInfiniteMessages(conversationId, limit = 30) {
  return useInfiniteQuery({
    queryKey: messagingKeys.messagesInfinite(conversationId),
    queryFn: async ({ pageParam = 1 }) => {
      const data = await messagingService.getMessages(conversationId, {
        page: pageParam,
        limit,
      });
      return data;
    },
    enabled: !!conversationId,
    getNextPageParam: (lastPage) => {
      // Determine if there are more pages from the meta response
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      const currentPage = meta.page || meta.currentPage || 1;
      const totalPages = meta.totalPages || meta.lastPage || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 10 * 1000,
    refetchInterval: MESSAGES_POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

// ─── Send Media & Messages ───────────────────────────────────────

/**
 * Send a plain text message.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const appendMessage = useMessagingStore((s) => s.appendMessage);
  const updateConversation = useMessagingStore((s) => s.updateConversation);

  return useMutation({
    mutationFn: ({ conversationId, content }) =>
      messagingService.sendMessage(conversationId, content),

    onMutate: async ({ conversationId, optimisticMessage }) => {
      await queryClient.cancelQueries(messagingKeys.messages(conversationId));

      if (optimisticMessage) {
        appendMessage(conversationId, optimisticMessage);
        updateConversation(conversationId, {
          lastMessage: optimisticMessage.content,
          lastMessageAt: optimisticMessage.createdAt,
        });
      }
      return { conversationId };
    },

    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries(messagingKeys.messages(conversationId));
      queryClient.invalidateQueries(messagingKeys.conversations);
    },

    onError: (error, { conversationId, optimisticMessage }) => {
      if (optimisticMessage) {
        const updateMessage = useMessagingStore.getState().updateMessage;
        updateMessage(conversationId, optimisticMessage.id, { status: 'failed' });
      }
      toast.error('Failed to send message');
    },
  });
}

/**
 * Mark a conversation as read.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const updateConversation = useMessagingStore((s) => s.updateConversation);

  return useMutation({
    mutationFn: ({ conversationId }) => messagingService.markAsRead(conversationId),
    onMutate: async ({ conversationId }) => {
      updateConversation(conversationId, { unreadCount: 0, unread: false });
      return { conversationId };
    },
    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      queryClient.invalidateQueries(messagingKeys.messages(conversationId));
    },
  });
}

// ─── Send Media (File Upload) ────────────────────────────────────

/**
 * Upload media (or send a text message via the media endpoint).
 * Supports optimistic updates.
 */
export function useSendMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, formData }) =>
      messagingService.uploadMedia(conversationId, formData),

    onMutate: async ({ conversationId, optimisticMessage }) => {
      // ✅ Use the SAME key as useMessages
      const queryKey = messagingKeys.messages(conversationId);

      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData(queryKey);

      if (optimisticMessage) {
        // ✅ Update the correct cache entry
        queryClient.setQueryData(queryKey, (old) => {
          const existing = old?.data ?? [];
          return { ...old, data: [...existing, optimisticMessage] };
        });

        // ✅ Also fix conversations key if needed
        queryClient.setQueryData(messagingKeys.conversations, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map(conv =>
              conv.conversationId === conversationId
                ? {
                  ...conv,
                  lastMessage: optimisticMessage.content || "Sent an attachment",
                  lastMessageAt: optimisticMessage.createdAt,
                }
                : conv
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
          };
        });
      }

      return { conversationId, previousMessages };
    },

    onSuccess: (response, { conversationId, optimisticMessage }) => {
      const realMessage = response?.data;
      const queryKey = messagingKeys.messages(conversationId);

      // ✅ Replace optimistic message with real server data
      queryClient.setQueryData(queryKey, (old) => {
        return {
          ...old,
          data: (old?.data ?? []).map(msg =>
            // Match by the temp ID we set in optimisticMessage.id
            msg.id === optimisticMessage.id
              ? {
                ...optimisticMessage,
                id: realMessage.messageId,
                messageId: realMessage.messageId,
                mediaUrl: realMessage.mediaPath || realMessage.mediaUrl, // Server might return mediaPath
                mediaType: realMessage.type || realMessage.mediaType,
                type: realMessage.type,
                status: "delivered",
              }
              : msg
          )
        };
      });
      // In useSendMedia onSuccess
      console.log("Cache after update:", queryClient.getQueryData(messagingKeys.messages(conversationId)));
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations });
    },

    onError: (error, { conversationId, optimisticMessage }) => {
      const queryKey = messagingKeys.messages(conversationId);

      if (optimisticMessage) {
        queryClient.setQueryData(queryKey, (old) => {
          return {
            ...old,
            data: (old?.data ?? []).map(msg =>
              msg.id === optimisticMessage.id ? { ...msg, status: "failed" } : msg
            )
          };
        });
      }
      toast.error("Failed to send attachment");
      console.error("Send media error:", error);
    },
  });
}
// ─── Delete Message & Conversation ───────────────────────────────

/**
 * Delete or exit an entire conversation / deal room.
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const removeConversation = useMessagingStore((s) => s.removeConversation);

  return useMutation({
    mutationFn: ({ conversationId }) => messagingService.deleteConversation(conversationId),
    onMutate: async ({ conversationId }) => {
      removeConversation(conversationId);
      return { conversationId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Conversation removed');
    },
    onError: () => {
      toast.error('Failed to remove conversation');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const removeMessage = useMessagingStore((s) => s.removeMessage);

  return useMutation({
    mutationFn: ({ messageId }) => messagingService.deleteMessage(messageId),

    onMutate: async ({ conversationId, messageId }) => {
      await queryClient.cancelQueries(messagingKeys.messages(conversationId));
      // Optimistic removal
      removeMessage(conversationId, messageId);
      return { conversationId, messageId };
    },

    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries(messagingKeys.messages(conversationId));
    },

    onError: (error, _vars, context) => {
      // Refetch to restore state on failure
      if (context?.conversationId) {
        queryClient.invalidateQueries(messagingKeys.messages(context.conversationId));
      }
      toast.error('Failed to delete message');
    },
  });
}

// ─── Direct Chat Invitations ─────────────────────────────────────

/**
 * Fetch pending invitations for the current user.
 */
export function usePendingInvitations() {
  const setInvitations = useMessagingStore((s) => s.setInvitations);

  return useQuery({
    queryKey: messagingKeys.invitations,
    queryFn: async () => {
      const data = await messagingService.getPendingInvitations();
      const invitations = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setInvitations(invitations);
      return invitations;
    },
    staleTime: 30 * 1000,
    refetchInterval: CONVERSATIONS_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    onError: () => {
      // Silent on poll failures
    },
  });
}

/**
 * Send a direct chat invitation.
 */
export function useSendInvitation() {
  const queryClient = useQueryClient();
  const router = useRouter()


  return useMutation({
    mutationFn: ({ recipientId, shortMessage = "Hi, I'd like to connect with you!" }) =>
      messagingService.sendInvitation(recipientId, shortMessage),

    onSuccess: (data) => {
      // If the backend returns an existing conversationId (re-invite case),
      // refresh conversations
      if (data?.data?.conversationId) {
        console.log(data, "data")
        queryClient.invalidateQueries(messagingKeys.conversations);
        router.push(`/dashboard/messaging?conversationId=${data?.data.conversationId}`);
        // toast.success('Conversation already exists');
      } else {
        toast.success('Invitation sent');
        queryClient.invalidateQueries(messagingKeys.invitations);
      }
    },

    onError: (error) => {
      const status = error?.response?.status;
      if (status === 400) {
        toast.error('Cannot send invitation to yourself');
      } else if (status === 409) {
        toast.error('User is already invited or connected');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to send invitation');
      }
    },
  });
}

/**
 * Respond to a direct chat invitation (accept/decline).
 */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, action }) =>
      messagingService.respondToInvitation(invitationId, action),

    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries(messagingKeys.invitations);
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success(action === 'accept' ? 'Invitation accepted' : 'Invitation declined');
    },

    onError: () => {
      toast.error('Failed to respond to invitation');
    },
  });
}

// ─── Public Groups ───────────────────────────────────────────────

/**
 * Search / list public groups.
 * @param {Object} params - { search?, page?, limit? }
 */
export function usePublicGroups(params = {}) {
  return useQuery({
    queryKey: messagingKeys.publicGroups(params),
    queryFn: () => messagingService.searchPublicGroups(params),
    staleTime: 30 * 1000,
    onError: () => {
      toast.error('Failed to load groups');
    },
  });
}

/**
 * Create a public group.
 */
export function useCreatePublicGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => messagingService.createPublicGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Group created');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create group');
    },
  });
}

/**
 * Join a public group.
 */
export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId }) => messagingService.joinGroup(groupId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      // If instant join (open group), the response has conversationId
      if (data?.data?.conversationId) {
        toast.success('Joined group');
      } else {
        toast.success('Join request submitted');
      }
    },
    onError: () => {
      toast.error('Failed to join group');
    },
  });
}

/**
 * Get join requests for a group (admin).
 */
export function useJoinRequests(groupId) {
  return useQuery({
    queryKey: messagingKeys.joinRequests(groupId),
    queryFn: () => messagingService.getJoinRequests(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
}

/**
 * Respond to a join request (admin).
 */
export function useRespondToJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, requestId, action }) =>
      messagingService.respondToJoinRequest(groupId, requestId, action),
    onSuccess: (_data, { groupId, action }) => {
      queryClient.invalidateQueries(messagingKeys.joinRequests(groupId));
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
    },
    onError: () => {
      toast.error('Failed to respond to request');
    },
  });
}

/**
 * Update group settings (admin).
 */
export function useUpdateGroupSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }) =>
      messagingService.updateGroupSettings(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Group settings updated');
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('Only group admins can update settings');
      } else {
        toast.error('Failed to update settings');
      }
    },
  });
}

/**
 * Leave a group.
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const removeConversation = useMessagingStore((s) => s.removeConversation);

  return useMutation({
    mutationFn: ({ groupId }) => messagingService.leaveGroup(groupId),
    onSuccess: (_data, { groupId }) => {
      removeConversation(groupId);
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Left group');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to leave group');
    },
  });
}

// ─── Private Groups (Deal Room) ──────────────────────────────────

/**
 * Create a private group (deal room).
 */
export function useCreatePrivateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => messagingService.createPrivateGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Deal room created');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create deal room');
    },
  });
}

/**
 * Invite a user to a private group.
 */
export function useInviteToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) =>
      messagingService.inviteToGroup(groupId, userId),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Member invited');
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error('User is already a member');
      } else if (status === 403) {
        toast.error('Only admins can invite members');
      } else {
        toast.error('Failed to invite member');
      }
    },
  });
}

/**
 * Remove a member from a private group.
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) =>
      messagingService.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Member removed');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });
}

/**
 * Update private group (deal room) settings.
 */
export function useUpdatePrivateGroupSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }) =>
      messagingService.updatePrivateGroupSettings(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(messagingKeys.conversations);
      toast.success('Deal room settings updated');
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 403) {
        toast.error('Only admins can update settings');
      } else {
        toast.error('Failed to update settings');
      }
    },
  });
}
