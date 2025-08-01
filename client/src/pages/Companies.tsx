
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const fetchCompanies = async ({ queryKey }: any) => {
    const [_key, { page, pageSize, filters }] = queryKey;
    const response = await apiClient.get('/companies', {
        params: { page, pageSize, filters: JSON.stringify(filters) },
    });
    return response.data;
};

export const Companies = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState({});

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['companies', { page, pageSize, filters }],
        queryFn: fetchCompanies,
        keepPreviousData: true,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500">Error loading companies.</div>;
    }

    return (
        <div>
            <div className="flex justify-between mb-4">
                <Input placeholder="Filter by province..." name="province" onChange={handleFilterChange} className="max-w-xs" />
                <Input placeholder="Filter by industry..." name="industryCode" onChange={handleFilterChange} className="max-w-xs" />
                <Input placeholder="Search by name or tax code..." name="keyword" onChange={handleFilterChange} className="max-w-xs" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tax Code</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Province</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.companies.map((company: any) => (
                        <TableRow key={company.tax_code}>
                            <TableCell>{company.tax_code}</TableCell>
                            <TableCell>{company.company_name}</TableCell>
                            <TableCell>{company.address}</TableCell>
                            <TableCell>{company.province}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end items-center space-x-2 mt-4">
                <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                <span>Page {page} of {data?.totalPages}</span>
                <Button onClick={() => setPage(page + 1)} disabled={page === data?.totalPages}>Next</Button>
            </div>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
    );
};
