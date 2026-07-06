// lib/hooks/useMessaging.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [typingUsers, setTypingUsers] = useState({});
  const selectedConversationId = selectedConversation?.conversationId ?? null;

  // Map conversation from backend format
  const mapConversation = (conv) => ({
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
  });
  // Queries
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations", searchQuery, sortBy],
    queryFn: () => messagingService.getConversations({ search: searchQuery, sort: sortBy }),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: messagingKeys.messages(selectedConversation?.conversationId),
    queryFn: () => messagingService.getMessages(selectedConversation?.conversationId),
    enabled: !!selectedConversation?.conversationId && !!token,
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

  // Send message mutation with optimistic update
  // const sendMessageMutation = useMutation({
  //   mutationFn: ({ conversationId, content }) => 
  //     messagingService.sendMessage(conversationId, content),

  //   onMutate: async ({ conversationId, content }) => {
  //     // Cancel ongoing refetches
  //     await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });

  //     // Snapshot previous messages
  //     const previousMessages = queryClient.getQueryData(["messages", conversationId]);

  //     // Create optimistic message
  //     const tempId = `temp-${Date.now()}-${Math.random()}`;
  //     const optimisticMessage = {
  //       id: tempId,
  //       messageId: tempId,
  //       content,
  //       type: "text",
  //       createdAt: new Date().toISOString(),
  //       senderId: currentUserId,
  //       senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "You",
  //       senderAvatar: user?.profileImagePath,
  //       conversationId: conversationId,
  //       isOwn: true,
  //       status: "sending"
  //     };

  //     // Update cache with optimistic message - wrap in { data: [...] }
  //     queryClient.setQueryData(["messages", conversationId], (old) => {
  //       const existing = old?.data ?? [];
  //       return { ...old, data: [...existing, optimisticMessage] };
  //     });

  //     // Update conversation list (move to top, update last message)
  //     queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
  //       if (!old?.data || !Array.isArray(old.data)) return old;
  //       return {
  //         ...old,
  //         data: [
  //           {
  //             ...old.data.find(c => c.conversationId === conversationId),
  //             lastMessage: content,
  //             lastMessageAt: new Date().toISOString(),
  //           },
  //           ...old.data.filter(c => c.conversationId !== conversationId)
  //         ].filter(Boolean)
  //       };
  //     });

  //     return { tempId, conversationId, previousMessages };
  //   },

  //   onSuccess: (response, variables, context) => {
  //     // Replace optimistic message with real one from REST
  //     const realMessage = response?.data;
  //     if (realMessage && context?.conversationId) {
  //       queryClient.setQueryData(["messages", context.conversationId], (old) => {
  //         return {
  //           ...old,
  //           data: (old?.data ?? []).map(msg =>
  //             msg.id === context.tempId
  //               ? { ...realMessage, id: realMessage.messageId, isOwn: true, status: "delivered" }
  //               : msg
  //           )
  //         };
  //       });
  //     }

  //     // Invalidate conversations to update last message
  //     queryClient.invalidateQueries({ queryKey: ["conversations"] });
  //   },

  //   onError: (error, variables, context) => {
  //     // Mark message as failed
  //     if (context?.conversationId) {
  //       queryClient.setQueryData(["messages", context.conversationId], (old) => {
  //         return {
  //           ...old,
  //           data: (old?.data ?? []).map(msg =>
  //             msg.id === context.tempId ? { ...msg, status: "failed" } : msg
  //           )
  //         };
  //       });
  //     }
  //     toast.error("Failed to send message");
  //   },
  // });

  const sendMediaFile = useCallback((file, caption = "") => {
    if (!selectedConversationId || !file) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();

    const optimisticMessage = {
      id: tempId,
      messageId: tempId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      senderName: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "You",
      senderAvatar: user?.profileImagePath,
      content: caption,
      mediaUrl: URL.createObjectURL(file),
      mediaType: file.type.startsWith("image/") ? "image" : "document",
      createdAt: now,
      isOwn: true,
      status: "sending",
    };
    //  console.log(file, "useMessaging", optimisticMessage)
    const formData = new FormData();
    formData.append("mediaFile", file);
    if (caption) formData.append("content", caption);

    pendingMessagesRef.current[tempId] = {
      content: caption,
      conversationId: selectedConversationId,
      createdAt: now,
      mediaType: file.type.startsWith("image/") ? "image" : "document",
      tempMediaUrl: optimisticMessage.mediaUrl
    };
    // console.log("calling sendMediaMutation with", { conversationId: selectedConversationId, optimisticMessage });
    sendMediaMutation({
      conversationId: selectedConversationId,
      formData,
      optimisticMessage,
    });
  }, [selectedConversationId, currentUserId, user, sendMediaMutation]);
  // WebSocket handlers

  const handleNewMessage = useCallback((wsMessage) => {
    const conversationId = wsMessage.conversationId;
    const queryKey = messagingKeys.messages(conversationId);

    const newMessage = {
      id: wsMessage.messageId,
      messageId: wsMessage.messageId,
      content: wsMessage.content || "",
      type: wsMessage.messageType || "text",
      createdAt: wsMessage.createdAt,
      senderId: wsMessage.senderId,
      senderName: wsMessage.senderName,
      senderAvatar: wsMessage.senderAvatar,
      mediaUrl: wsMessage.mediaPath || null, // Add media URL
      mediaType: wsMessage.mediaType || null, // Add media type
      conversationId,
      isOwn: wsMessage.senderId === currentUserId,
      status: "delivered"
    };

    queryClient.setQueryData(queryKey, (old) => {
      const existing = old?.data;
      if (!existing || !Array.isArray(existing)) return { data: [newMessage] };

      // Check for duplicate by real messageId
      if (existing.some(m => m.messageId === wsMessage.messageId)) return old;

      // Find matching optimistic message (for own messages)
      if (wsMessage.senderId === currentUserId) {
        // Look for a matching pending message
        let matchedKey = null;
        let matchedIndex = -1;

        for (const [key, pending] of Object.entries(pendingMessagesRef.current)) {
          // Match by content and conversationId
          if (pending.conversationId === conversationId) {
            // For text messages
            if (wsMessage.content && pending.content === wsMessage.content && !pending.mediaType) {
              matchedKey = key;
              break;
            }
            // For media messages (file without caption or with caption)
            if (pending.mediaType && wsMessage.mediaPath) {
              matchedKey = key;
              break;
            }
          }
        }

        if (matchedKey) {
          // Find the optimistic message in the array
          for (let i = 0; i < existing.length; i++) {
            if (existing[i].id === matchedKey || existing[i].messageId === matchedKey) {
              matchedIndex = i;
              break;
            }
          }

          if (matchedIndex !== -1) {
            // Clean up blob URL to prevent memory leaks
            const pendingMsg = pendingMessagesRef.current[matchedKey];
            if (pendingMsg.tempMediaUrl && pendingMsg.tempMediaUrl.startsWith('blob:')) {
              URL.revokeObjectURL(pendingMsg.tempMediaUrl);
            }
            delete pendingMessagesRef.current[matchedKey];

            // Replace the optimistic message
            const updatedMessages = [...existing];
            updatedMessages[matchedIndex] = newMessage;
            return { ...old, data: updatedMessages };
          }
        }
      }

      // New message from someone else
      return { ...old, data: [...existing, newMessage] };
    });

    // Update conversation list
    queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
      if (!old?.data || !Array.isArray(old.data)) return old;
      return {
        ...old,
        data: old.data.map(conv =>
          conv.conversationId === conversationId
            ? {
              ...conv,
              lastMessage: wsMessage.content || (wsMessage.mediaType === 'image' || wsMessage.mediaType === 'file' ? "Sent an attachment" : ""),
              lastMessageAt: wsMessage.createdAt
            }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      };
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
    if (data.conversationId === selectedConversation?.conversationId && data.userId !== currentUserId) {
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
  }, [selectedConversation?.conversationId, currentUserId, typingUsers]);

  const handleReadReceipt = useCallback((data) => {

    if (data.conversationId === selectedConversation?.conversationId) {
      const queryKey = messagingKeys.messages(data.conversationId);
      queryClient.setQueryData(queryKey, (old) => {
        return {
          ...old,
          data: (old?.data ?? []).map(msg =>
            msg.senderId === data.userId && msg.status !== "read"
              ? { ...msg, status: "read" }
              : msg
          )
        };
      });
    }
  }, [selectedConversation?.conversationId, queryClient]);

  // Update handlePresence to write to the ref instead
  const handlePresence = useCallback((data) => {
    presenceMapRef.current[data.userId] = data.status;

    // Still update cache so ConversationList re-renders
    queryClient.setQueryData(["conversations", searchQuery, sortBy], (old) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map(conv =>
          conv.userId === data.userId
            ? { ...conv, online: data.status === "online" }
            : conv
        )
      };
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
  const conversations = (conversationsData?.data || []).map(mapConversation);
  // const conversations = (conversationsData?.data || []).map((conv) => {
  //   const cached = queryClient.getQueryData(["conversations", searchQuery, sortBy]);
  //   const cachedConv = cached?.data?.find(c => c.conversationId === conv.conversationId);

  //   return {
  //     ...mapConversation(conv),
  //     online: cachedConv?.online ?? false, // preserve presence from cache
  //   };
  // });

  const invitations = invitationsData?.data || [];

  // console.log("messagesData", messagesData?.data?.length);
  // console.log("cache", queryClient.getQueryData(["messages", selectedConversation?.conversationId])?.data?.length);
  // Fix: Extract data array from messagesData
  const currentMessages = (messagesData?.data || []).map(msg => {
    const mediaUrl = msg.mediaUrl || msg.mediaPath;
    const mediaType = msg.mediaType || msg.type;

    // Debug: log if media exists but URL is missing
    if (mediaType === "image" && !mediaUrl) {
      console.warn("⚠️ Image message has no mediaUrl:", {
        id: msg.messageId || msg.id,
        mediaPath: msg.mediaPath,
        mediaUrl: msg.mediaUrl
      });
    }

    return {
      id: msg.messageId || msg.id,
      messageId: msg.messageId || msg.id,
      content: msg.content,
      type: msg.type,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatar,
      isOwn: msg.senderId === currentUserId,
      status: msg.status || "delivered",
      mediaUrl,   // ✅ Use the computed value
      mediaType,  // ✅ Use the computed value
    };
  });

  // Actions
  const selectConversation = useCallback((conversationId) => {
    const conversation = conversations.find(c => c.conversationId === conversationId);
    setSelectedConversation(conversation || null);
    if (conversationId) {
      sendReadReceipt(conversationId);
    }
  }, [conversations, sendReadReceipt]);

  // const sendMessage = useCallback((content) => {
  //   if (!selectedConversation?.conversationId) {
  //     toast.error("No conversation selected");
  //     return;
  //   }

  //   if (!content.trim()) return;

  //   // Send via REST (with optimistic update)
  //   sendMessageMutation.mutate({ 
  //     conversationId: selectedConversation.conversationId, 
  //     content 
  //   });

  //   // Also send via WebSocket for real-time to others
  //   // wsSendMessage(selectedConversation.conversationId, content);
  // }, [selectedConversation, sendMessageMutation, wsSendMessage]);

  const sendMessage = useCallback((content) => {
    if (!selectedConversation?.conversationId) {
      toast.error("No conversation selected");
      return;
    }
    if (!content.trim()) return;

    const conversationId = selectedConversation.conversationId;
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const createdAt = new Date().toISOString();
    const queryKey = messagingKeys.messages(conversationId);

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

    // Add to UI immediately
    queryClient.setQueryData(queryKey, (old) => {
      const existing = old?.data ?? [];
      return { ...old, data: [...existing, optimisticMessage] };
    });

    // WS only — backend saves + broadcasts
    wsSendMessage(conversationId, content);
  }, [selectedConversation, currentUserId, user, queryClient, wsSendMessage]);


  const retryMessage = useCallback(
    (messageId) => {

      // console.log("Retrying message", messageId, "in conversation", selectedConversationId);
      if (!selectedConversationId) return;

      const queryKey = messagingKeys.messages(selectedConversationId);
      const cached = queryClient.getQueryData(queryKey);
      const failedMsg = cached?.data?.find((m) => m.id === messageId || m.messageId === messageId);

      // console.log(failedMsg)
      if (!failedMsg?.content || failedMsg?.mediaType.length !== 0) return;
      // Mark as sending again in cache
      console.log("✅")
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        data: (old?.data ?? []).map((m) =>
          m.id === messageId ? { ...m, status: "sending" } : m
        ),
      }));

      // Re-register in pendingMessagesRef so handleNewMessage can dedup it
      pendingMessagesRef.current[messageId] = {
        content: failedMsg.content,
        conversationId: selectedConversationId,
        createdAt: failedMsg.createdAt,
      };

      // WS only — same as sendMessage
      wsSendMessage(selectedConversationId, failedMsg.content);
    },
    [selectedConversationId, queryClient, wsSendMessage],
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