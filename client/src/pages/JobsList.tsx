
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateJobModal from '@/components/features/CreateJobModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { io } from 'socket.io-client';

const fetchJobs = async () => {
    const response = await apiClient.get('/jobs');
    return response.data;
};

export const JobsList = () => {
    const queryClient = useQueryClient();
    const { data: jobs, isLoading, error } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const socket = io('http://localhost:8000');

        socket.on('job-update', (updatedJob) => {
            queryClient.setQueryData(['jobs'], (oldData: any) => {
                if (!oldData) return [updatedJob];
                const newData = oldData.map((job: any) => (job.job_id === updatedJob.job_id ? updatedJob : job));
                return newData;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500">Error loading jobs.</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button>Tạo Công việc Mới</Button>
                    </DialogTrigger>
                    <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Completed At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs?.map((job: any) => (
                        <TableRow key={job.job_id}>
                            <TableCell>{job.job_id}</TableCell>
                            <TableCell>{job.job_type}</TableCell>
                            <TableCell><Badge>{job.status}</Badge></TableCell>
                            <TableCell>{job.progress}%</TableCell>
                            <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                            <TableCell>{job.completed_at ? new Date(job.completed_at).toLocaleString() : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
