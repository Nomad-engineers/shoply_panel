"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "@/components/providers/QueryProvider";

export interface AdminShopFilter {
  id: number;
  name: string;
}

interface AdminShopsResponse {
  data: AdminShopFilter[];
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface UseAdminShopsOptions {
  page?: number;
  pageSize?: number;
}

/**
 * React Query hook for fetching admin shops from /v2/admin/shop/list for filter dropdown
 * Supports pagination with page and pageSize query parameters
 * Includes dateFrom and dateTo set to today's date
 */
export function useAdminShops(options: UseAdminShopsOptions = {}) {
  const fetcher = useAuthFetcher();
  const { page = 1, pageSize = 100 } = options;

  return useQuery({
    queryKey: ["admin-shops-filter", page, pageSize],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        dateFrom: today.toISOString(),
        dateTo: endOfDay.toISOString(),
      });

      const response = await fetcher<AdminShopsResponse>(`/v2/admin/shop/list?${params.toString()}`);
      // Handle both direct array and nested data formats
      return Array.isArray(response) ? response : response.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
