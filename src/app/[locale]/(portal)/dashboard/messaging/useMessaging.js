// lib/hooks/useMessaging.js
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import messagingService from "@/lib/services/messagingService";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";
import useAuthStore from "@/lib/store/useAuthStore";
import { messagingKeys, useDeleteConversation, useDeleteMessage, useLeaveGroup, useMarkAsRead, useRespondToInvitation, useSendInvitation, useSendMedia } from "@/lib/hooks/useMessagingQueries";
import { useAuth } from "@/lib/hooks/useUser";


export function useMessaging() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { data } = useAuth();

  // console.log(data,"user in useMessaging")
  const user = data?.data || {}
  const currentUserId = user?.userId || user?.id;
  const unreadDebounceRef = useRef(null);
  const lastUnreadInvalidationRef = useRef(0);
  // Helper to get temp ID for retry
  const getTempId = () => `temp-${Date.now()}-${Math.random()}`;
  const pendingMessagesRef = useRef({}); // { tempId: { content, conversationId, createdAt } }
  const presenceMapRef = useRef({});

  // State
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [typingUsers, setTypingUsers] = useState({});

  // Map conversation from backend format
  const mapConversation = useCallback((conv) => ({
    id: conv.conversationId,
    conversationId: conv.conversationId,
    type: conv.type,
    name: conv.type === "DIRECT"
      ? `${conv.otherUser?.firstName || ""} ${conv.otherUser?.lastName || ""}`.trim() || conv.name
      : conv.name,
    avatar: conv.avatarPath,
    description: conv.description,
    lastMessage: conv.lastMessage ? {
      content: conv.lastMessage.content || null,
      text: conv.lastMessage.text || null,
      type: conv.lastMessage.type || "text",
      mediaUrl: conv.lastMessage.mediaUrl || null,
      senderId: conv.lastMessage.senderId,
      createdAt: conv.lastMessage.createdAt,
    } : null,
    lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
    unreadCount: conv.unreadCount,
    memberCount: conv.memberCount,
    userId: conv.otherUser?.userId,
    online: presenceMapRef.current[conv.otherUser?.userId] === "online",
  }), []);

  // Queries
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations", searchQuery, sortBy],
    queryFn: () => messagingService.getConversations({ search: searchQuery, sort: sortBy }),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: messagingKeys.messages(selectedConversationId),
    queryFn: () => messagingService.getMessages(selectedConversationId),
    enabled: !!selectedConversationId && !!token,
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => messagingService.getPendingInvitations(),
    enabled: !!token,
  });

  // ─── API Mutations ───────────────────────────────────────────
  const { mutate: sendMediaMutation } = useSendMedia();
  const { mutate: deleteMessageMutation } = useDeleteMessage();
  const { mutate: deleteConversationMutation } = useDeleteConversation();
  const { mutate: leaveGroupMutation } = useLeaveGroup();
  const { mutate: markAsReadMutation } = useMarkAsRead();
  const { mutate: respondToInvitationMutation } = useRespondToInvitation();
  const { mutate: sendInvitationMutation } = useSendInvitation();

  // Send message mutation with optimistic update and REST persistence
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }) => 
      messagingService.sendMessage(conversationId, content),

    onMutate: async ({ conversationId, content, optimisticMessage, tempId }) => {
      const queryKey = messagingKeys.messages(conversationId);
      // Cancel ongoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData(queryKey);

      // Update cache with optimistic message
      queryClient.setQueryData(queryKey, (old) => {
        const existing = Array.isArray(old?.data)
          ? old.data
          : Array.isArray(old)
          ? old
          : [];
        if (existing.some(m => m.id === tempId || m.messageId === tempId)) return old;
        const updated = [...existing, optimisticMessage];
        return Array.isArray(old) ? updated : { ...old, data: updated };
      });

      // Update conversation list (move to top, update last message)
      queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
        const list = Array.isArray(old?.data) ? old.data : Array.isArray(old) ? old : [];
        if (!list.length) return old;
        const found = list.find(c => c.conversationId === conversationId);
        const updated = [
          {
            ...found,
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
          },
          ...list.filter(c => c.conversationId !== conversationId)
        ].filter(Boolean);
        return Array.isArray(old) ? updated : { ...old, data: updated };
      });

      return { tempId, conversationId, previousMessages };
    },

    onSuccess: (response, variables, context) => {
      // Replace optimistic message with real one from REST
      const realMessage = response?.data || response;
      if (realMessage && context?.conversationId) {
        const realId = realMessage.messageId || realMessage.id || context.tempId;
        queryClient.setQueryData(messagingKeys.messages(context.conversationId), (old) => {
          const existing = Array.isArray(old?.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const updated = existing.map(msg =>
            msg.id === context.tempId || msg.messageId === context.tempId
              ? {
                  ...msg,
                  ...realMessage,
                  id: realId,
                  messageId: realId,
                  isOwn: true,
                  status: "delivered"
                }
              : msg
          );
          return Array.isArray(old) ? updated : { ...old, data: updated };
        });
      }

      if (context?.tempId) {
        delete pendingMessagesRef.current[context.tempId];
      }

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations });
    },

    onError: (error, variables, context) => {
      // Mark message as failed
      if (context?.conversationId) {
        queryClient.setQueryData(messagingKeys.messages(context.conversationId), (old) => {
          const existing = Array.isArray(old?.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const updated = existing.map(msg =>
            msg.id === context.tempId || msg.messageId === context.tempId
              ? { ...msg, status: "failed" }
              : msg
          );
          return Array.isArray(old) ? updated : { ...old, data: updated };
        });
      }
      toast.error(error?.response?.data?.message || "Failed to send message");
    },
  });

  const sendMediaFile = useCallback((file, caption = "") => {
    if (!selectedConversationId || !file) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";
    const mediaType = isImage ? "image" : isVideo ? "video" : isPdf ? "pdf" : "document";

    const optimisticMessage = {
      id: tempId,
      messageId: tempId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      senderName: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "You",
      senderAvatar: user?.profileImagePath,
      content: caption || "",
      mediaUrl: URL.createObjectURL(file),
      mediaType,
      type: mediaType,
      createdAt: now,
      isOwn: true,
      status: "sending",
    };

    const formData = new FormData();
    formData.append("mediaFile", file);
    if (caption) formData.append("content", caption);

    pendingMessagesRef.current[tempId] = {
      content: caption,
      conversationId: selectedConversationId,
      createdAt: now,
      mediaType,
      tempMediaUrl: optimisticMessage.mediaUrl
    };

    sendMediaMutation({
      conversationId: selectedConversationId,
      formData,
      optimisticMessage,
    });
  }, [selectedConversationId, currentUserId, user, sendMediaMutation]);

  // WebSocket handlers
  const handleNewMessage = useCallback((wsMessage) => {
    const msgData = wsMessage?.data || wsMessage;
    const conversationId = msgData.conversationId;
    if (!conversationId) return;

    const queryKey = messagingKeys.messages(conversationId);
    const msgId = msgData.messageId || msgData.id;
    const mediaUrl =
      msgData.mediaPath ||
      msgData.mediaUrl ||
      msgData.fileUrl ||
      msgData.filePath ||
      msgData.attachmentUrl ||
      msgData.attachmentPath ||
      msgData.attachment ||
      msgData.url;

    const mediaType =
      msgData.mediaType ||
      msgData.type ||
      (mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl) ? "image" : null) ||
      (mediaUrl && /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl) ? "video" : null) ||
      (mediaUrl && /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl) ? "document" : null);

    const newMessage = {
      ...msgData,
      id: msgId,
      messageId: msgId,
      content: msgData.content || "",
      type: msgData.messageType || msgData.type || (mediaType ? mediaType : "text"),
      createdAt: msgData.createdAt || new Date().toISOString(),
      senderId: msgData.senderId,
      senderName: msgData.senderName,
      senderAvatar: msgData.senderAvatar,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      conversationId,
      isOwn: msgData.senderId === currentUserId,
      status: "delivered"
    };

    queryClient.setQueryData(queryKey, (old) => {
      const existing = Array.isArray(old?.data)
        ? old.data
        : Array.isArray(old)
        ? old
        : [];
      if (!existing.length) {
        const res = [newMessage];
        return Array.isArray(old) ? res : { ...old, data: res };
      }

      // Check for duplicate by real messageId
      if (existing.some(m => m.messageId === msgId || (msgId && m.id === msgId))) return old;

      // Find matching optimistic message (for own messages)
      if (msgData.senderId === currentUserId) {
        let matchedKey = null;
        let matchedIndex = -1;

        for (const [key, pending] of Object.entries(pendingMessagesRef.current)) {
          if (pending.conversationId === conversationId) {
            if (msgData.content && pending.content === msgData.content && !pending.mediaType) {
              matchedKey = key;
              break;
            }
            if (pending.mediaType && mediaUrl) {
              matchedKey = key;
              break;
            }
          }
        }

        if (matchedKey) {
          for (let i = 0; i < existing.length; i++) {
            if (existing[i].id === matchedKey || existing[i].messageId === matchedKey) {
              matchedIndex = i;
              break;
            }
          }

          if (matchedIndex !== -1) {
            delete pendingMessagesRef.current[matchedKey];
            const updatedMessages = [...existing];
            updatedMessages[matchedIndex] = newMessage;
            return Array.isArray(old) ? updatedMessages : { ...old, data: updatedMessages };
          }
        }
      }

      const updated = [...existing, newMessage];
      return Array.isArray(old) ? updated : { ...old, data: updated };
    });

    // Update conversation list
    queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
      const list = Array.isArray(old?.data) ? old.data : Array.isArray(old) ? old : [];
      if (!list.length) return old;
      const updated = list.map(conv =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              lastMessage: msgData.content || (mediaType ? "Sent an attachment" : ""),
              lastMessageAt: msgData.createdAt || new Date().toISOString()
            }
          : conv
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      return Array.isArray(old) ? updated : { ...old, data: updated };
    });

    // Debounced unread invalidation
    const now = Date.now();
    if (now - lastUnreadInvalidationRef.current > 5000) {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      lastUnreadInvalidationRef.current = now;
    } else {
      if (unreadDebounceRef.current) clearTimeout(unreadDebounceRef.current);
      unreadDebounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      }, 2000);
    }
  }, [currentUserId, queryClient, searchQuery, sortBy]);

  const handleTyping = useCallback((data) => {
    if (data.conversationId === selectedConversationId && data.userId !== currentUserId) {
      if (typingUsers[data.userId]?.timeout) {
        clearTimeout(typingUsers[data.userId].timeout);
      }

      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[data.userId];
          return newState;
        });
      }, 3000);

      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: { name: data.name, timeout }
      }));
    }
  }, [selectedConversationId, currentUserId, typingUsers]);

  const handleReadReceipt = useCallback((data) => {
    if (data.conversationId === selectedConversationId) {
      const queryKey = messagingKeys.messages(data.conversationId);
      queryClient.setQueryData(queryKey, (old) => {
        const existing = Array.isArray(old?.data)
          ? old.data
          : Array.isArray(old)
          ? old
          : [];
        const updated = existing.map(msg =>
          msg.senderId === data.userId && msg.status !== "read"
            ? { ...msg, status: "read" }
            : msg
        );
        return Array.isArray(old) ? updated : { ...old, data: updated };
      });
    }
  }, [selectedConversationId, queryClient]);

  // Update handlePresence to write to the ref instead
  const handlePresence = useCallback((data) => {
    presenceMapRef.current[data.userId] = data.status;

    // Still update cache so ConversationList re-renders
    queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
      const list = Array.isArray(old?.data) ? old.data : Array.isArray(old) ? old : [];
      if (!list.length) return old;
      const updated = list.map(conv =>
        conv.userId === data.userId
          ? { ...conv, online: data.status === "online" }
          : conv
      );
      return Array.isArray(old) ? updated : { ...old, data: updated };
    });
  }, [queryClient, searchQuery, sortBy]);

  // Initialize WebSocket
  const { isConnected, sendMessage: wsSendMessage, sendTyping, sendReadReceipt } = useWebSocket({
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onReadReceipt: handleReadReceipt,
    onPresence: handlePresence
  });

  // Data transformations
  const rawConversations = Array.isArray(conversationsData?.data)
    ? conversationsData.data
    : Array.isArray(conversationsData)
    ? conversationsData
    : [];
  const conversations = useMemo(() => rawConversations.map(mapConversation), [rawConversations, mapConversation]);

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    const found = conversations.find(c => c.conversationId === selectedConversationId);
    return found || { conversationId: selectedConversationId, id: selectedConversationId, name: "Chat", type: "DIRECT" };
  }, [conversations, selectedConversationId]);

  const invitations = invitationsData?.data || [];

  const rawMessages = Array.isArray(messagesData?.data)
    ? messagesData.data
    : Array.isArray(messagesData?.messages)
    ? messagesData.messages
    : Array.isArray(messagesData)
    ? messagesData
    : [];

  const currentMessages = useMemo(() => {
    return rawMessages.map(msg => {
      const mediaUrl =
        msg.mediaUrl ||
        msg.mediaPath ||
        msg.fileUrl ||
        msg.filePath ||
        msg.attachmentUrl ||
        msg.attachmentPath ||
        msg.attachment ||
        msg.url ||
        msg.path ||
        (typeof msg.media === "string" ? msg.media : msg.media?.url || msg.media?.path) ||
        null;

      const rawType = msg.mediaType || msg.type;
      const computedType =
        rawType ||
        (mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl) ? "image" : null) ||
        (mediaUrl && /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl) ? "video" : null) ||
        (mediaUrl && /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(mediaUrl) ? "document" : null) ||
        (msg.content ? "text" : (mediaUrl ? "image" : "text"));

      return {
        ...msg,
        id: msg.messageId || msg.id,
        messageId: msg.messageId || msg.id,
        content: msg.content,
        type: rawType || computedType,
        createdAt: msg.createdAt,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        isOwn: msg.senderId === currentUserId || msg.isOwn === true,
        status: msg.status || "delivered",
        mediaUrl,
        mediaType: computedType,
      };
    });
  }, [rawMessages, currentUserId]);

  // Actions
  const selectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId || null);
    if (conversationId) {
      sendReadReceipt(conversationId);
    }
  }, [sendReadReceipt]);

  const sendMessage = useCallback((content) => {
    if (!selectedConversationId) {
      toast.error("No conversation selected");
      return;
    }
    if (!content.trim()) return;

    const conversationId = selectedConversationId;
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const createdAt = new Date().toISOString();

    const optimisticMessage = {
      id: tempId,
      messageId: tempId,
      content,
      type: "text",
      createdAt,
      senderId: currentUserId,
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "You",
      senderAvatar: user?.profileImagePath,
      conversationId,
      isOwn: true,
      status: "sending"
    };

    // Track this pending message for dedup in handleNewMessage
    pendingMessagesRef.current[tempId] = { content, conversationId, createdAt };

    // Send via REST API mutation (with optimistic update)
    sendMessageMutation.mutate({
      conversationId,
      content,
      optimisticMessage,
      tempId,
    });

    // Also broadcast via WebSocket if open
    if (isConnected) {
      wsSendMessage(conversationId, content);
    }
  }, [selectedConversationId, currentUserId, user, sendMessageMutation, isConnected, wsSendMessage]);

  const retryMessage = useCallback(
    (messageId) => {
      if (!selectedConversationId) return;

      const queryKey = messagingKeys.messages(selectedConversationId);
      const cached = queryClient.getQueryData(queryKey);
      const list = Array.isArray(cached?.data) ? cached.data : Array.isArray(cached) ? cached : [];
      const failedMsg = list.find((m) => m.id === messageId || m.messageId === messageId);

      if (!failedMsg?.content) return;

      // Mark as sending again in cache
      queryClient.setQueryData(queryKey, (old) => {
        const existing = Array.isArray(old?.data) ? old.data : Array.isArray(old) ? old : [];
        const updated = existing.map((m) =>
          m.id === messageId || m.messageId === messageId ? { ...m, status: "sending" } : m
        );
        return Array.isArray(old) ? updated : { ...old, data: updated };
      });

      // Re-register in pendingMessagesRef so handleNewMessage can dedup it
      pendingMessagesRef.current[messageId] = {
        content: failedMsg.content,
        conversationId: selectedConversationId,
        createdAt: failedMsg.createdAt,
      };

      // Resend via REST
      sendMessageMutation.mutate({
        conversationId: selectedConversationId,
        content: failedMsg.content,
        optimisticMessage: failedMsg,
        tempId: messageId,
      });

      if (isConnected) {
        wsSendMessage(selectedConversationId, failedMsg.content);
      }
    },
    [selectedConversationId, queryClient, sendMessageMutation, isConnected, wsSendMessage],
  );

  const acceptInvitation = useCallback(
    (invitationId) => {
      respondToInvitationMutation({ invitationId, action: "accept" });
    },
    [respondToInvitationMutation]
  );

  const declineInvitation = useCallback(
    (invitationId) => {
      respondToInvitationMutation({ invitationId, action: "decline" });
    },
    [respondToInvitationMutation]
  );

  const inviteUser = useCallback(
    (recipientId, shortMessage = "Hi, I'd like to connect with you!") => {
      sendInvitationMutation({ recipientId, shortMessage });
    },
    [sendInvitationMutation]
  );
  const deleteMessage = useCallback(
    (messageId) => {
      if (!selectedConversationId) return;
      deleteMessageMutation({
        conversationId: selectedConversationId,
        messageId,
      });
    },
    [selectedConversationId, deleteMessageMutation]
  );

  const markAsRead = useCallback(
    (conversationId) => {
      if (conversationId) markAsReadMutation({ conversationId });
    },
    [markAsReadMutation]
  );

  const leaveGroup = useCallback(
    (groupId) => {
      if (groupId) leaveGroupMutation({ groupId });
    },
    [leaveGroupMutation]
  );

  const deleteConversationAction = useCallback(
    (conversationId) => {
      if (conversationId) deleteConversationMutation({ conversationId });
    },
    [deleteConversationMutation]
  );

  const handleTypingIndicator = useCallback(() => {
    if (selectedConversation?.conversationId) {
      sendTyping(selectedConversation.conversationId);
    }
  }, [selectedConversation, sendTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (unreadDebounceRef.current) clearTimeout(unreadDebounceRef.current);
      Object.values(typingUsers).forEach(({ timeout }) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [typingUsers]);

  return {
    conversations,
    selectedConversation,
    currentMessages,
    searchQuery,
    sortBy,
    isLoading: isLoadingConversations,
    isMessagesLoading: isLoadingMessages,
    invitations,
    typingUsers,
    isConnected,
    setSearchQuery,
    setSortBy,
    selectConversation,
    sendMessage,
    sendMediaFile,
    retryMessage,
    deleteMessage,
    acceptInvitation,
    declineInvitation,
    sendTyping: handleTypingIndicator,
  };
}