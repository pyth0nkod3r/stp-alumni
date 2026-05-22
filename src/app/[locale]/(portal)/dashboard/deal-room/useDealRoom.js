import { useState, useCallback, useMemo } from "react";
import {
  useConversations,
  useMessages,
  useSendMedia,
  useSendMessage,
  useDeleteMessage,
  useDeleteConversation,
  useCreatePrivateGroup,
  useInviteToGroup,
  useRemoveMember,
  useUpdatePrivateGroupSettings,
  useMarkAsRead,
} from "@/lib/hooks/useMessagingQueries";
import useMessagingStore from "@/lib/store/useMessagingStore";
import useAuthStore from "@/lib/store/useAuthStore";

/** Stable empty array to avoid infinite re-render loops in Zustand selectors */
const EMPTY_ARRAY = [];

export function generateId() {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize a PRIVATE_GROUP conversation from the API to the shape the Deal Room UI expects.
 */
function normalizeRoom(conv) {
  const id = conv.conversationId || conv.id;
  return {
    id,
    conversationId: id,
    name: conv.name || conv.title || "Unnamed Room",
    avatar: conv.avatar || conv.thumbnail || null,
    description: conv.description || "",
    lastMessage: conv.lastMessage || conv.lastMessageContent || "",
    lastMessageAt: conv.lastMessageAt || conv.updatedAt
      ? new Date(conv.lastMessageAt || conv.updatedAt)
      : new Date(),
    unread: !!conv.unreadCount || conv.unread || false,
    unreadCount: parseInt(conv.unreadCount, 10) || 0,
    online: false,
    onlineCount: 0,
    members: conv.participants || conv.members || [],
    memberLimit: conv.memberLimit || null,
    type: "PRIVATE_GROUP",
  };
}

/**
 * Normalize a message from the API to the shape the Deal Room UI expects.
 */
function normalizeMessage(msg, currentUserId) {
  const senderId = msg.senderId || msg.userId;
  const isOwn = senderId === currentUserId;

  return {
    id: msg.messageId || msg.id,
    messageId: msg.messageId || msg.id,
    roomId: msg.conversationId,
    senderId,
    senderName: msg.senderName || msg.name || (isOwn ? "You" : "User"),
    senderAvatar: msg.senderAvatar || msg.profileImagePath || null,
    content: msg.content || msg.message || "",
    mediaUrl: msg.mediaUrl || null,
    mediaType: msg.mediaType || null,
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    isOwn,
    status: msg.status || (isOwn ? "sent" : "read"),
  };
}

/**
 * Main Deal Room hook — replaces the old mock-based hook.
 * Fetches real data from the API via React Query, filtering for PRIVATE_GROUP conversations.
 */
export function useDealRoom() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || currentUser?.userId;

  // ─── API Queries ─────────────────────────────────────────────
  const { data: rawConversations, isLoading: convsLoading } = useConversations();
  const { data: rawMessagesData, isLoading: msgsLoading } = useMessages(selectedRoomId);

  // ─── API Mutations ───────────────────────────────────────────
  const { mutateAsync: createPrivateGroupMutation } = useCreatePrivateGroup();
  const { mutate: inviteToGroupMutation } = useInviteToGroup();
  const { mutate: removeMemberMutation } = useRemoveMember();
  const { mutate: updateSettingsMutation } = useUpdatePrivateGroupSettings();
  const { mutate: sendMediaMutation } = useSendMedia();
  const { mutate: sendMessageMutation } = useSendMessage();
  const { mutate: deleteMessageMutation } = useDeleteMessage();
  const { mutate: deleteConversationMutation } = useDeleteConversation();
  const { mutate: markAsReadMutation } = useMarkAsRead();

  // ─── Normalize rooms (PRIVATE_GROUP only) ────────────────────
  const allRooms = useMemo(() => {
    if (!rawConversations) return EMPTY_ARRAY;
    const list = Array.isArray(rawConversations) ? rawConversations : [];
    return list
      .filter((c) => c.type === "PRIVATE_GROUP")
      .map(normalizeRoom);
  }, [rawConversations]);

  // console.log(rawConversations,"rawConversations")

  // ─── Sort & filter ───────────────────────────────────────────
  const filteredRooms = useMemo(() => {
    let result = [...allRooms];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          (room.lastMessage && room.lastMessage.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "unread":
          if (a.unread !== b.unread) return a.unread ? -1 : 1;
          return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      }
    });

    return result;
  }, [allRooms, searchQuery, sortBy]);

  // ─── Selected room ──────────────────────────────────────────
  const selectedRoom = useMemo(
    () => allRooms.find((r) => r.id === selectedRoomId) || null,
    [allRooms, selectedRoomId]
  );

  // ─── Normalize messages ─────────────────────────────────────
  const apiMessages = useMemo(() => {
    if (!selectedRoomId || !rawMessagesData) return EMPTY_ARRAY;
    const raw = Array.isArray(rawMessagesData?.data)
      ? rawMessagesData.data
      : Array.isArray(rawMessagesData)
        ? rawMessagesData
        : [];
    return raw
      .map((m) => normalizeMessage(m, currentUserId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [rawMessagesData, selectedRoomId, currentUserId]);

  // Merge with optimistic store messages
  const allStoreMessages = useMessagingStore((s) => s.messages);
  const storeMessages = selectedRoomId
    ? allStoreMessages[selectedRoomId] || EMPTY_ARRAY
    : EMPTY_ARRAY;

  const currentMessages = useMemo(() => {
    const apiIds = new Set(apiMessages.map((m) => m.id));
    const optimistic = storeMessages.filter((m) => !apiIds.has(m.id));
    return [...apiMessages, ...optimistic].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [apiMessages, storeMessages]);

  // ─── Actions ─────────────────────────────────────────────────

  const selectRoom = useCallback((roomId) => {
    setSelectedRoomId(roomId);
    if (roomId) {
      useMessagingStore.getState().setActiveConversation(roomId);
    }
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (!selectedRoomId || !content.trim()) return;

      const tempId = generateId();
      const now = new Date();

      const optimisticMessage = {
        id: tempId,
        messageId: tempId,
        roomId: selectedRoomId,
        conversationId: selectedRoomId,
        senderId: currentUserId,
        senderName: currentUser?.name || "You",
        content: content.trim(),
        createdAt: now,
        isOwn: true,
        status: "sending",
      };

      sendMessageMutation({
        conversationId: selectedRoomId,
        content: content.trim(),
        optimisticMessage,
      });
    },
    [selectedRoomId, currentUserId, currentUser, sendMessageMutation]
  );

  const retryMessage = useCallback(
    (messageId) => {
      if (!selectedRoomId) return;
      const msgs = useMessagingStore.getState().messages[selectedRoomId] || [];
      const failedMsg = msgs.find((m) => m.id === messageId);
      if (!failedMsg) return;

      useMessagingStore.getState().updateMessage(selectedRoomId, messageId, {
        status: "sending",
      });

      sendMessageMutation({
        conversationId: selectedRoomId,
        content: failedMsg.content,
        optimisticMessage: null,
      });
    },
    [selectedRoomId, sendMessageMutation]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      if (!selectedRoomId) return;
      deleteMessageMutation({
        conversationId: selectedRoomId,
        messageId,
      });
    },
    [selectedRoomId, deleteMessageMutation]
  );

  const updateRoomName = useCallback(
    (roomId, newName) => {
      if (!newName?.trim()) return;
      updateSettingsMutation({
        groupId: roomId,
        data: { name: newName.trim() },
      });
    },
    [updateSettingsMutation]
  );

  const deleteRoom = useCallback(
    (roomId) => {
      if (!roomId) return;
      deleteConversationMutation({ conversationId: roomId });
      if (selectedRoomId === roomId) setSelectedRoomId(null);
    },
    [selectedRoomId, deleteConversationMutation]
  );

  const markAsRead = useCallback(
    (roomId) => {
      if (roomId) markAsReadMutation({ conversationId: roomId });
    },
    [markAsReadMutation]
  );

  const addMember = useCallback(
    (roomId, userId) => {
      inviteToGroupMutation({ groupId: roomId, userId });
    },
    [inviteToGroupMutation]
  );

  const removeMember = useCallback(
    (roomId, userId) => {
      removeMemberMutation({ groupId: roomId, userId });
    },
    [removeMemberMutation]
  );

  /**
   * Create a new deal room.
   * Returns a promise that resolves with the new room's conversationId.
   */
  const createRoom = useCallback(
    async ({ name, description = "", memberLimit, members = [] }) => {
      if (!name?.trim()) return null;

      try {
        const result = await createPrivateGroupMutation({
          name: name.trim(),
          description,
          memberLimit,
        });

        const conversationId = result?.data?.conversationId;
        if (!conversationId) return null;

        // Invite members sequentially
        for (const member of members) {
          const userId = member.userId || member.id;
          if (userId) {
            inviteToGroupMutation({ groupId: conversationId, userId });
          }
        }

        setSelectedRoomId(conversationId);
        return { id: conversationId };
      } catch {
        return null;
      }
    },
    [createPrivateGroupMutation, inviteToGroupMutation]
  );

  return {
    // State
    rooms: filteredRooms,
    selectedRoom,
    currentMessages,
    searchQuery,
    sortBy,
    isLoading: convsLoading,
    isMessagesLoading: msgsLoading,
    currentUserId,

    // Actions
    setSearchQuery,
    setSortBy,
    selectRoom,
    sendMessage,
    retryMessage,
    deleteMessage,
    updateRoomName,
    deleteRoom,
    addMember,
    removeMember,
    createRoom,
    markAsRead,
  };
}
