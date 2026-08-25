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
      const response = await fetcher<{ data: PanelRegion[] } | PanelRegion[]>("/v2/panel/regions");
      return Array.isArray(response) ? response : (response && 'data' in response ? response.data : []);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
