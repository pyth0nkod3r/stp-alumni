import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import dealroomService from '../services/dealroomService';

export const dealroomKeys = {
  myrooms: ['dealrooms'],
  room: (id) => ['dealrooms', id],
  messages: (id) => ['dealrooms', id, 'messages'],
  auditLog: (id) => ['dealrooms', id, 'audit-log'],
};

// ─── Rooms ─────────────────────────────────────────────────────────────────

export function useMyDealroom() {
  return useQuery({
    queryKey: dealroomKeys.myrooms,
    queryFn: async () => {
      const data = await dealroomService.getDealrooms();
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 15 * 1000,
    refetchIntervalInBackground: false,
  });
}

export function useDealroomById(roomId) {
  return useQuery({
    queryKey: dealroomKeys.room(roomId),
    queryFn: async () => {
      const data = await dealroomService.getDealroomById(roomId);
      return data?.data || null;
    },
    enabled: !!roomId,
    staleTime: 10 * 1000,
  });
}

export function useCreateDealroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => dealroomService.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.myrooms });
      toast.success('Deal room created');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create deal room');
    },
  });
}

// ─── Members ───────────────────────────────────────────────────────────────

export function useAddMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userIds }) => dealroomService.addMembers(roomId, userIds),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.room(roomId) });
      queryClient.invalidateQueries({ queryKey: dealroomKeys.myrooms });
      toast.success('Member added');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add member');
      console.error('Add member error:', error);
    },
  });
}

export function useRemoveDealroomMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userId }) => dealroomService.removeMember(roomId, userId),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.room(roomId) });
      toast.success('Member removed');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove member');
    },
  });
}

// ─── Messages ──────────────────────────────────────────────────────────────

export function useDealroomMessages(roomId) {
  return useInfiniteQuery({
    queryKey: dealroomKeys.messages(roomId),
    queryFn: async ({ pageParam = 1 }) => {
      const data = await dealroomService.getMessages(roomId, pageParam, 30);
      return data?.data || [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 30 ? allPages.length + 1 : undefined,
    enabled: !!roomId,
    staleTime: 5 * 1000,
  });
}

export function useSendDealroomMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, content }) => dealroomService.sendMessage(roomId, content),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.messages(roomId) });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });
}

export function useDeleteDealroomMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, messageId }) => dealroomService.deleteMessage(roomId, messageId),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.messages(roomId) });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete message');
    },
  });
}

// ─── Files ─────────────────────────────────────────────────────────────────

export function useUploadDealroomFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, file, onUploadProgress }) =>
      dealroomService.uploadFile(roomId, file, onUploadProgress),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: dealroomKeys.messages(roomId) });
      toast.success('File uploaded');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to upload file');
    },
  });
}


export function useSignNda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId }) => dealroomService.signNda(roomId),
    onSuccess: (_, { roomId }) => {
      // Refetch room detail so hasSignedNda flips to true
      queryClient.invalidateQueries({ queryKey: dealroomKeys.room(roomId) });
      toast.success('NDA signed — welcome to the deal room.');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to sign NDA');
    },
  });
}

// ─── Audit Log ─────────────────────────────────────────────────────────────

export function useAuditLog(roomId) {
  return useQuery({
    queryKey: dealroomKeys.auditLog(roomId),
    queryFn: async () => {
      const data = await dealroomService.getAuditLog(roomId);
      return data?.data || [];
    },
    enabled: !!roomId,
    staleTime: 30 * 1000,
  });
}