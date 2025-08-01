import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { Company, SearchFilters, PaginationParams } from '@/types'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // URL của backend server mới
});

interface CompaniesQueryParams extends PaginationParams {
  filters?: SearchFilters
}

// Helper để loại bỏ các giá trị null/undefined khỏi object
const cleanObject = (obj: any) => {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== '')
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

// Get companies with pagination and filters
export function useCompanies({ page = 1, pageSize = 20, filters }: CompaniesQueryParams = {}) {
  return useQuery({
    queryKey: ['companies', page, pageSize, filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/companies', {
        params: {
          page,
          pageSize,
          filters: JSON.stringify(cleanObject(filters || {})),
        },
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  })
}

// Get a single company by tax code
export function useCompany(taxCode: string | null) {
  return useQuery({
    queryKey: ['company', taxCode],
    queryFn: async () => {
      const { data } = await apiClient.get(`/companies/${taxCode}`);
      return data as Company | null;
    },
    enabled: !!taxCode,
  })
}

// Get company statistics
export function useCompaniesStats() {
  return useQuery({
    queryKey: ['companies-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/companies/stats');
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

// Hook for exporting data
export function useExportCompanies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ format, fields, filters }: {
      format: 'csv' | 'excel' | 'json',
      fields: string[],
      filters?: SearchFilters
    }) => {
      const { data } = await apiClient.post('/export', {
        table: 'companies',
        filters,
        format,
        fields
      }, { responseType: 'blob' }); // Handle file download
      // Logic to trigger file download in browser
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch
    },
  });
}

// Hook for deleting companies
export function useDeleteCompanies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taxCodes: string[]) => {
      const { data } = await apiClient.delete('/companies', { data: { taxCodes } });
      return data;
    },
    onSuccess: (_, taxCodes) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  });
}