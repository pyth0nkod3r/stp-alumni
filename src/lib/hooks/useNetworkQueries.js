'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import networkService from '@/lib/services/networkService';
import { toast } from 'sonner';

export const networkKeys = {
  all: ['network'],
  list: (params) => ['network', 'list', params],
  connections: ['network', 'connections'],
  requests: ['network', 'requests'],
  suggested: (limit) => ['network', 'suggested', limit],
};

export function useSuggestedConnections(limit = 10) {
  return useQuery({
    queryKey: networkKeys.suggested(limit),
    queryFn: () => networkService.getSuggestedConnections(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNetworkList(params = {}) {
  return useQuery({
    queryKey: networkKeys.list(params),
    queryFn: () => networkService.getNetwork(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyConnections() {
  return useQuery({
    queryKey: networkKeys.connections,
    queryFn: () => networkService.getConnections(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIncomingRequests(params = {}) {
  return useQuery({
    queryKey: networkKeys.requests,
    queryFn: () => networkService.getIncomingRequests(params),
  });
}

export function useConnectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => networkService.connectToUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
      toast.success('Connection request sent');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to send connection request');
    },
  });
}

export function useAcceptConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId) => networkService.acceptConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
      toast.success('Connection accepted');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to accept connection');
    },
  });
}

export function useIgnoreConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId) => networkService.ignoreConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
      toast.success('Connection request ignored');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to ignore connection');
    },
  });
}

export function useDisconnectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId) => networkService.disconnectUser(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.all });
      toast.success('Connection removed');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove connection');
    },
  });
}
