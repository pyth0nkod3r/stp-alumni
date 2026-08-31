'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import eventService from '@/lib/services/eventService';
import { toast } from 'sonner';

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, formData }) => eventService.updateEvent(eventId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update event');
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => eventService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete event');
    },
  });
}
