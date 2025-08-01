import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/stores/app-store'
import type { ScrapingJob } from '@/types'

const socket = io('http://localhost:8000');

export function useRealtime() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();

  useEffect(() => {
    socket.on('job-update', (job: ScrapingJob) => {
      queryClient.setQueryData(['job', job.job_id], job);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

      addNotification({
        type: job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info',
        title: 'Cập nhật trạng thái Job',
        message: `Job ${job.job_id.slice(0, 8)}... đã được cập nhật thành ${job.status}`,
      });
    });

    return () => {
      socket.off('job-update');
    };
  }, [queryClient, addNotification]);
}

export default useRealtime;