
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const fetchDashboardStats = async () => {
    const [companyStats, jobStats, proxyStats] = await Promise.all([
        apiClient.get('/companies/stats'),
        apiClient.get('/jobs/stats'),
        apiClient.get('/proxies/stats'),
    ]);
    return { companyStats: companyStats.data, jobStats: jobStats.data, proxyStats: proxyStats.data };
};

const fetchRecentJobs = async () => {
    const response = await apiClient.get('/jobs?pageSize=5');
    return response.data;
};

export const Dashboard = () => {
    const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardStats,
    });

    const { data: recentJobs, isLoading: isLoadingJobs, error: jobsError } = useQuery({
        queryKey: ['recentJobs'],
        queryFn: fetchRecentJobs,
    });

    if (isLoadingStats || isLoadingJobs) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (statsError || jobsError) {
        return <div className="text-red-500">Error loading dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats?.companyStats.totalCompanies}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around">
                        <div>
                            <p className="text-2xl font-bold">{stats?.jobStats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">{stats?.jobStats.completed || 0}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{stats?.jobStats.failed || 0}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Proxy Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around">
                        <div>
                            <p className="text-2xl font-bold">{stats?.proxyStats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">{stats?.proxyStats.active}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{stats?.proxyStats.blocked}</p>
                            <p className="text-sm text-muted-foreground">Blocked</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Scraping Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentJobs?.map((job: any) => (
                                <TableRow key={job.job_id}>
                                    <TableCell>{job.job_id}</TableCell>
                                    <TableCell>{job.job_type}</TableCell>
                                    <TableCell><Badge>{job.status}</Badge></TableCell>
                                    <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
