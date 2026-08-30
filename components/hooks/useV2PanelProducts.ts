"use client";

import { useCallback } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { baseUrl } from "@/lib/utils";
import type {
  V2PanelProductDto,
  V2PanelProductsQueryDto,
  V2PanelProductsResponseDto,
} from "@/types/v2-panel-product.dto";

export interface PanelProductsPageDto {
  items: V2PanelProductDto[];
  meta?: V2PanelProductsResponseDto["meta"];
}

export function useV2PanelProducts() {
  const { refreshSession, fetchWithSession } = useAuthContext();

  const fetchJson = useCallback(async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const getAccessToken = () => localStorage.getItem("access_token");
    const res = await fetchWithSession(url, getAccessToken, refreshSession, options);

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    return res.json() as T;
  }, [fetchWithSession, refreshSession]);

  const fetchPanelProducts = useCallback(
    async (params: V2PanelProductsQueryDto = {}): Promise<PanelProductsPageDto> => {
      const search = new URLSearchParams();
      if (params.page) search.set("page", String(params.page));
      if (params.pageSize) search.set("pageSize", String(params.pageSize));
      if (params.shopId) search.set("shopId", String(params.shopId));

      const qs = search.toString();
      const response = await fetchJson<V2PanelProductsResponseDto>(
        `/v2/panel/products${qs ? `?${qs}` : ""}`,
      );

      return { items: response.data ?? [], meta: response.meta };
    },
    [fetchJson],
  );

  return {
    fetchPanelProducts,
  };
}
