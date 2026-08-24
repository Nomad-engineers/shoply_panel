"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "@/components/providers/QueryProvider";

export interface AdminShopFilter {
  id: number;
  name: string;
}

/**
 * React Query hook for fetching admin shops from /admin/shops for filter dropdown
 * Simplified response with only id and name
 */
export function useAdminShops() {
  const fetcher = useAuthFetcher();

  return useQuery({
    queryKey: ["admin-shops-filter"],
    queryFn: async () => {
      const response = await fetcher<{ data: AdminShopFilter[] }>("/v2/admin/shops");
      // Handle both direct array and nested data formats
      return Array.isArray(response) ? response : response.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
