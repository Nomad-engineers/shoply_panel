"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "@/components/providers/QueryProvider";
import type {
  PanelOrderPaginatedResponseDto,
  V2PanelOrdersQueryDto,
} from "@/types/panel-orders.dto";

interface UsePanelOrdersOptions {
  /** Filter parameters */
  filters?: V2PanelOrdersQueryDto;
  /** Disable automatic fetching */
  enabled?: boolean;
}

export function usePanelOrders(options: UsePanelOrdersOptions = {}) {
  const { filters = {}, enabled = true } = options;
  const fetcher = useAuthFetcher();

  const queryString = buildQueryString(filters);

  const queryKey = ["panel-orders", queryString];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetcher<PanelOrderPaginatedResponseDto>(
        `/panel/orders${queryString ? `?${queryString}` : ""}`
      ),
    enabled,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    // Provide typed data accessors
    orders: query.data?.data ?? [],
    meta: query.data?.meta,
    totalCount: query.data?.meta?.totalItems ?? 0,
    pageCount: query.data?.meta?.totalPages ?? 0,
    currentPage: query.data?.meta?.currentPage ?? 1,
    itemsPerPage: query.data?.meta?.itemsPerPage ?? 20,
  };
}

/**
 * Build query string from filter object
 */
function buildQueryString(filters: V2PanelOrdersQueryDto): string {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.regionId) params.set("regionId", String(filters.regionId));
  if (filters.shopId) params.set("shopId", String(filters.shopId));
  if (filters.from) params.set("from", String(filters.from));
  if (filters.to) params.set("to", String(filters.to));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  return params.toString();
}
