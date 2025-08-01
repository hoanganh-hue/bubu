import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { ScrapingJob, JobParameters } from '@/types'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Get all jobs
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs');
      return data as ScrapingJob[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  })
}

// Get single job
export function useJob(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${jobId}`);
      return data as ScrapingJob | null;
    },
    enabled: !!jobId,
    refetchInterval: 2000, // Faster refresh for individual job
  })
}

// Create new scraping job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { jobType: string; parameters: JobParameters; userId?: string }) => {
      const { data } = await apiClient.post('/jobs', params);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  });
}

// Update job status
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: Partial<ScrapingJob> }) => {
      const { data } = await apiClient.put(`/jobs/${jobId}`, updates);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] })
    },
  });
}

// Cancel job
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await apiClient.post(`/jobs/${jobId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  });
}

// Get job statistics
export function useJobStats() {
  return useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/stats');
      return data;
    },
    refetchInterval: 10000,
  })
}