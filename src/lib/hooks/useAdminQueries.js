'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '@/lib/services/adminService';
import { toast } from 'sonner';

export const adminKeys = {
  all: ['admin'],
  reportedPosts: (params) => ['admin', 'posts', 'reported', params],
  support: (params) => ['admin', 'support', params],
  supportUnread: ['admin', 'support', 'unreadCount'],
  dealroomMembers: (roomId) => ['admin', 'dealrooms', roomId, 'members'],
};

// ─── Post Moderation ────────────────────────────────────────────────

export function useReportedPosts(params = {}) {
  return useQuery({
    queryKey: adminKeys.reportedPosts(params),
    queryFn: () => adminService.getReportedPosts(params),
  });
}

export function useHidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => adminService.hidePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post hidden successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to hide post');
    },
  });
}

export function useUnhidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => adminService.unhidePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post unhidden successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to unhide post');
    },
  });
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => adminService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete post');
    },
  });
}

// ─── Support Management ─────────────────────────────────────────────

export function useAdminSupportMessages(params = {}) {
  return useQuery({
    queryKey: adminKeys.support(params),
    queryFn: () => adminService.getSupportMessages(params),
  });
}

export function useAdminUnreadSupportCount() {
  return useQuery({
    queryKey: adminKeys.supportUnread,
    queryFn: () => adminService.getUnreadSupportCount(),
    select: (data) => data?.data?.unreadCount ?? data?.data?.count ?? 0,
    refetchInterval: 60000,
  });
}

export function useAdminUpdateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supportId, status }) => adminService.updateSupportTicket(supportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
      toast.success('Ticket updated');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update ticket');
    },
  });
}

// ─── User Management ────────────────────────────────────────────────

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) => adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    },
  });
}
