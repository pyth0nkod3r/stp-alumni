'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import supportService from '@/lib/services/supportService';
import { toast } from 'sonner';

export function useSubmitSupportTicket() {
  return useMutation({
    mutationFn: (data) => supportService.submitTicket(data),
    onSuccess: (data) => {
      toast.success(data?.message || 'Support request submitted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to submit support request');
    },
  });
}

export function useUnreadSupportCount() {
  return useQuery({
    queryKey: ['support', 'unreadCount'],
    queryFn: () => supportService.getUnreadCount(),
    select: (data) => data?.data?.unreadCount ?? data?.data?.count ?? 0,
    refetchInterval: 60000,
  });
}

export function useSupportMessages(params = {}) {
  return useQuery({
    queryKey: ['support', 'messages', params],
    queryFn: () => supportService.getSupportMessages(params),
  });
}

export function useUpdateSupportTicket() {
  return useMutation({
    mutationFn: ({ supportId, status }) => supportService.updateTicketStatus(supportId, status),
  });
}

