"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { V2PanelOrdersQueryDto, OrderStatus } from "@/types/panel-orders.dto";

interface UseOrderFiltersOptions {
  /** Default page size if not in URL */
  defaultPageSize?: number;
}

/**
 * Hook for managing order filter state via URL search params
 * Provides bidirectional sync between URL and filter state
 */
export function useOrderFilters(options: UseOrderFiltersOptions = {}) {
  const { defaultPageSize = 20 } = options;
  const searchParams = useSearchParams();

  /**
   * Parse filters from URL search params
   */
  const filters = useMemo((): V2PanelOrdersQueryDto => {
    return {
      status: searchParams.get("status") as OrderStatus | undefined,
      regionId: searchParams.get("regionId")
        ? Number(searchParams.get("regionId"))
        : undefined,
      shopId: searchParams.get("shopId")
        ? Number(searchParams.get("shopId"))
        : undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || defaultPageSize,
    };
  }, [searchParams, defaultPageSize]);

  /**
   * Check if any filters are active (excluding pagination)
   */
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.status ||
        filters.regionId ||
        filters.shopId ||
        filters.from ||
        filters.to
    );
  }, [filters]);

  /**
   * Generate query string from filters
   */
  const getQueryString = useCallback(
    (updates?: Partial<V2PanelOrdersQueryDto>): string => {
      const merged = { ...filters, ...updates };

      const params = new URLSearchParams();

      // Only add params that have values
      if (merged.status) params.set("status", merged.status);
      if (merged.regionId) params.set("regionId", String(merged.regionId));
      if (merged.shopId) params.set("shopId", String(merged.shopId));
      if (merged.from) params.set("from", merged.from instanceof Date ? merged.from.toISOString() : merged.from);
      if (merged.to) params.set("to", merged.to instanceof Date ? merged.to.toISOString() : merged.to);
      if (merged.page && merged.page > 1) params.set("page", String(merged.page));
      if (merged.pageSize && merged.pageSize !== defaultPageSize)
        params.set("pageSize", String(merged.pageSize));

      return params.toString();
    },
    [filters, defaultPageSize]
  );

  /**
   * Update a single filter parameter
   */
  const updateFilter = useCallback(
    (key: keyof V2PanelOrdersQueryDto, value: V2PanelOrdersQueryDto[keyof V2PanelOrdersQueryDto]) => {
      const updated = { ...filters, [key]: value };

      // Reset page when changing filters (except pageSize)
      if (key !== "page" && key !== "pageSize") {
        updated.page = 1;
      }

      return getQueryString(updated);
    },
    [filters, getQueryString]
  );

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback(
    (updates: Partial<V2PanelOrdersQueryDto>) => {
      const updated = { ...filters, ...updates };

      // Reset page when changing filters (except pagination)
      const hasNonPaginationUpdate = Object.keys(updates).some(
        (key) => key !== "page" && key !== "pageSize"
      );
      if (hasNonPaginationUpdate) {
        updated.page = 1;
      }

      return getQueryString(updated);
    },
    [filters, getQueryString]
  );

  /**
   * Clear all filters (except pagination)
   */
  const clearFilters = useCallback(() => {
    return getQueryString({
      page: 1,
      pageSize: filters.pageSize,
    });
  }, [getQueryString, filters.pageSize]);

  return {
    filters,
    hasActiveFilters,
    getQueryString,
    updateFilter,
    updateFilters,
    clearFilters,
  };
}
