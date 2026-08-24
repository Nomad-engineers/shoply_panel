"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "@/components/providers/QueryProvider";

export interface PanelRegion {
  id: number;
  name: string;
}

/**
 * React Query hook for fetching regions from /panel/regions
 */
export function usePanelRegions() {
  const fetcher = useAuthFetcher();

  return useQuery({
    queryKey: ["panel-regions"],
    queryFn: () => fetcher<PanelRegion[]>("/v2/panel/regions"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
