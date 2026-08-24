"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "@/components/providers/QueryProvider";

export interface PanelRegion {
  id: number;
  name: string;
}

/**
 * React Query hook for fetching regions from /panel/regions
 * Cached for 30 minutes with extended garbage collection
 */
export function usePanelRegions() {
  const fetcher = useAuthFetcher();

  return useQuery({
    queryKey: ["panel-regions"],
    queryFn: async () => {
      const response = await fetcher<{ data: PanelRegion[] } | PanelRegion[]>("/panel/regions");
      // Handle both direct array and nested data formats
      return Array.isArray(response) ? response : (response && 'data' in response ? response.data : []);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - data won't be refetched if younger
    gcTime: 60 * 60 * 1000, // 60 minutes - cache retention time
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}
