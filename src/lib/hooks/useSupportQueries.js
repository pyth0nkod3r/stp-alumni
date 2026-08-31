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
    select: (data) => data?.data?.count || 0,
    refetchInterval: 60000,
  });
}
