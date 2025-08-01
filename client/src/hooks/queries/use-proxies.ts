import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { ProxyServer, ProxyTestResult } from '@/types'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Get all proxies
export function useProxies() {
  return useQuery({
    queryKey: ['proxies'],
    queryFn: async () => {
      const { data } = await apiClient.get('/proxies');
      return data as ProxyServer[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

// Add new proxy
export function useAddProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proxyData: Partial<ProxyServer>) => {
      const { data } = await apiClient.post('/proxies', proxyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    },
  });
}

// Test proxy
export function useTestProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proxyId: string) => {
      const { data } = await apiClient.post(`/proxies/${proxyId}/test`);
      return data as ProxyTestResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    },
  });
}

// Update proxy
export function useUpdateProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proxy_id, ...updates }: Partial<ProxyServer> & { proxy_id: string }) => {
      const { data } = await apiClient.put(`/proxies/${proxy_id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    },
  });
}

// Delete proxy
export function useDeleteProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proxy_id: string) => {
      const { data } = await apiClient.delete(`/proxies/${proxy_id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    },
  });
}

// Perform health check on all proxies
export function useProxyHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/proxies/health-check');
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['proxies'] })
    },
  });
}

// Get proxy statistics
export function useProxyStats() {
  return useQuery({
    queryKey: ['proxy-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/proxies/stats');
      return data;
    },
    refetchInterval: 30000,
  })
}