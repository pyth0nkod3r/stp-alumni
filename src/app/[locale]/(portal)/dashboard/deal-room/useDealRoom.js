'use client';
import { useState, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useMyDealroom,
  useDealroomById,
  useCreateDealroom,
  useAddMembers,
  useRemoveDealroomMember,
  useDealroomMessages,
  useSendDealroomMessage,
  useDeleteDealroomMessage,
  useUploadDealroomFile,
  dealroomKeys,
} from '@/lib/hooks/useDealroomQueries';
import { useDealRoomSocket } from '@/lib/hooks/useDealRoomSocket';
import useAuthStore from '@/lib/store/useAuthStore';

const EMPTY_ARRAY = [];

/** Shape the list-view item from GET /dealrooms */
function normalizeRoomSummary(raw) {
  return {
    id: raw.roomId,
    roomId: raw.roomId,
    roomName: raw.roomName || 'Unnamed Room',
    roomDescription: raw.roomDescription || '',
    isLocked: raw.isLocked || false,
    status: raw.status || 'ACTIVE',
    memberCount: raw.memberCount ?? 1,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    createdBy: `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
    documentUrl: raw.documentUrl || null,
    // enriched after detail fetch
    members: [],
    hasSignedNda: false,
  };
}

/** Shape the full room from GET /dealrooms/:roomId */
function normalizeRoomDetail(raw) {
  return {
    id: raw.roomId,
    roomId: raw.roomId,
    roomName: raw.roomName || 'Unnamed Room',
    roomDescription: raw.roomDescription || '',
    isLocked: raw.isLocked || false,
    status: raw.status || 'ACTIVE',
    memberCount: raw.members?.length ?? 1,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    createdBy: raw.createdBy || null,
    createdByName: `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
    members: (raw.members || []).map((m) => ({
      userId: m.userId,
      id: m.userId,
      name: `${m.firstName || ''} ${m.lastName || ''}`.trim(),
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      title: m.title || '',
      companyName: m.companyName || '',
      avatar: m.profileImagePath || null,
      ndaSigned: m.ndaSigned || false,
      ndaSignedAt: m.ndaSignedAt ? new Date(m.ndaSignedAt) : null,
      joinedAt: m.joinedAt ? new Date(m.joinedAt) : null,
    })),
    hasSignedNda: raw.hasSignedNda || false,
    documentUrl: raw.documentUrl || null,
  };
}

/** Normalize a message from API */
function normalizeMessage(msg, currentUserId) {
  const senderId = msg.senderId || msg.userId;
  const isOwn = senderId === currentUserId;
  return {
    id: msg.messageId || msg.id,
    messageId: msg.messageId || msg.id,
    roomId: msg.roomId || msg.conversationId,
    senderId,
    senderName: msg.senderName || (isOwn ? 'You' : 'Member'),
    senderAvatar: msg.senderAvatar || msg.profileImagePath || null,
    content: msg.content || msg.message || '',
    mediaUrl: msg.mediaUrl || null,
    mediaType: msg.mediaType || null,
    fileId: msg.fileId || null,
    streamUrl: msg.streamUrl || null,
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    isOwn,
    status: msg.status || (isOwn ? 'sent' : 'read'),
    type: msg.messageType || 'text',
  };
}

export function useDealRoom() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [typingUsers, setTypingUsers] = useState([]);
  const typingClearTimers = useRef({});

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || currentUser?.userId;
  const queryClient = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────────
  const { data: rawRooms, isLoading: roomsLoading } = useMyDealroom();
  const { data: rawRoomDetail, isLoading: roomDetailLoading } = useDealroomById(selectedRoomId);
  const {
    data: messagesData,
    isLoading: msgsLoading,
    fetchNextPage,
    hasNextPage,
  } = useDealroomMessages(selectedRoomId);

  // ─── Mutations ─────────────────────────────────────────────────
  const { mutateAsync: createRoomMutation } = useCreateDealroom();
  const { mutate: addMembersMutation } = useAddMembers();
  const { mutate: removeMemberMutation } = useRemoveDealroomMember();
  const { mutate: sendMessageMutation } = useSendDealroomMessage();
  const { mutateAsync: deleteMessageMutation,isPending:isDeletePending } = useDeleteDealroomMessage();
  const { mutateAsync: uploadFileMutation } = useUploadDealroomFile();

  // ─── WebSocket ─────────────────────────────────────────────────
  const handleTyping = useCallback((data) => {
    if (data.userId === currentUserId) return;
    setTypingUsers((prev) => {
      if (prev.find((u) => u.userId === data.userId)) return prev;
      return [...prev, { userId: data.userId, name: data.name }];
    });
    // Auto-clear typing indicator after 3s
    clearTimeout(typingClearTimers.current[data.userId]);
    typingClearTimers.current[data.userId] = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    }, 3000);
  }, [currentUserId]);

  const handleRead = useCallback(() => {
    if (selectedRoomId) {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.messages(selectedRoomId) });
    }
  }, [selectedRoomId, queryClient]);

  const { sendMessage: wsSendMessage, sendTyping, markRead } = useDealRoomSocket(
    selectedRoomId,
    {
      onMessage: () => {}, // invalidation handled inside useDealRoomSocket
      onTyping: handleTyping,
      onRead: handleRead,
    },
  );

  // ─── Derived data ───────────────────────────────────────────────

  const allRooms = useMemo(() => {
    if (!rawRooms) return EMPTY_ARRAY;
    return rawRooms.map(normalizeRoomSummary);
  }, [rawRooms]);

  const selectedRoom = useMemo(() => {
    if (!rawRoomDetail) {
      // Fall back to summary while detail loads
      return allRooms.find((r) => r.id === selectedRoomId) || null;
    }
    return normalizeRoomDetail(rawRoomDetail);
  }, [rawRoomDetail, allRooms, selectedRoomId]);

  const filteredRooms = useMemo(() => {
    let result = [...allRooms];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.roomName.toLowerCase().includes(q) ||
          r.roomDescription.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.roomName.localeCompare(b.roomName);
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return result;
  }, [allRooms, searchQuery, sortBy]);

  const currentMessages = useMemo(() => {
    if (!messagesData) return EMPTY_ARRAY;
    const flat = messagesData.pages.flat();
    return flat
      .map((m) => normalizeMessage(m, currentUserId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messagesData, currentUserId]);

  // ─── Actions ───────────────────────────────────────────────────

  const selectRoom = useCallback((roomId) => {
    setSelectedRoomId(roomId);
    setTypingUsers([]);
    if (roomId) markRead();
  }, [markRead]);

  const sendMessage = useCallback(
    (content) => {
      if (!selectedRoomId || !content.trim()) return;
      // Send via WS for real-time, REST for persistence
      wsSendMessage(content);
      // sendMessageMutation({ roomId: selectedRoomId, content: content.trim() });
    },
    [selectedRoomId, wsSendMessage, sendMessageMutation],
  );

  const deleteMessage = useCallback(
    async (messageId,callback) => {
      if (!selectedRoomId) return;
      try {
        await deleteMessageMutation({ roomId: selectedRoomId, messageId });
        // toast.success('Message deleted');
        callback?.();
      } catch (error) {
        // toast.error(error?.response?.data?.message || 'Failed to delete message');
      }
    },
    [selectedRoomId, deleteMessageMutation],
  );
       

  const addMember = useCallback(
    (roomId, userId) => {
      addMembersMutation({ roomId, userIds: [userId] });
    },
    [addMembersMutation],
  );

  const removeMember = useCallback(
    (roomId, userId) => {
      removeMemberMutation({ roomId, userId });
    },
    [removeMemberMutation],
  );

  const uploadFile = useCallback(
    async (file, onProgress) => {
      if (!selectedRoomId) return null;
      try {
        const result = await uploadFileMutation({
          roomId: selectedRoomId,
          file,
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total);
            onProgress?.(pct);
          },
        });
        return result?.data || null;
      } catch {
        return null;
      }
    },
    [selectedRoomId, uploadFileMutation],
  );

  const createRoom = useCallback(
    async ({ name, description = '' }) => {
      if (!name?.trim()) return null;
      try {
        const result = await createRoomMutation({ name: name.trim(), description });
        const roomId = result?.data?.roomId || result?.data?.conversationId;
        if (!roomId) return null;
        setSelectedRoomId(roomId);
        return { id: roomId };
      } catch {
        return null;
      }
    },
    [createRoomMutation],
  );

  return {
    // State
    rooms: filteredRooms,
    selectedRoom,
    currentMessages,
    searchQuery,
    sortBy,
     roomsLoading,
    isRoomDetailLoading: roomDetailLoading,
    isMessagesLoading: msgsLoading,
    currentUserId,
    currentUser,
    typingUsers,
    hasMoreMessages: hasNextPage,
    isDeletePending,

    // Actions
    setSearchQuery,
    setSortBy,
    selectRoom,
    sendMessage,
    sendTyping,
    deleteMessage,
    addMember,
    removeMember,
    uploadFile,
    createRoom,
    loadMoreMessages: fetchNextPage,
  };
}