import { useEffect, useState, useCallback } from "react";

import { useAuth } from "./useLogin";
import type { PromocodesResponse } from "@/types/promocode";

export interface FetchPromocodesParams {
  page?: number;
  pageSize?: number;
  relations?: string;
  shopId?: number;
  filter?: Record<string, any>;
  skip?: boolean;
}

export const usePromocodes = (initialParams?: FetchPromocodesParams) => {
  const { refreshSession, fetchWithSession } = useAuth();

  const [data, setData] = useState<PromocodesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromocodes = useCallback(
    async (params?: FetchPromocodesParams) => {
      if (params?.skip) return;

      setLoading(true);
      setError(null);

      try {
        const page = params?.page ?? initialParams?.page ?? 1;
        const pageSize = params?.pageSize ?? initialParams?.pageSize ?? 10;
        const shopId = params?.shopId ?? initialParams?.shopId;
        const searchTerm = params?.filter?.searchTerm;

        const queryParams = new URLSearchParams();
        queryParams.set("page", String(page));
        queryParams.set("pageSize", String(pageSize));

        if (shopId) {
          queryParams.set("shopId", String(shopId));
        }

        if (searchTerm) {
          queryParams.set("searchTerm", String(searchTerm));
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode?${queryParams.toString()}`;

        const res = await fetchWithSession(
          url,
          () => localStorage.getItem("access_token"),
          refreshSession,
        );

        if (!res.ok) throw new Error("Ошибка при получении промокодов");

        const response = (await res.json()) as PromocodesResponse;
        setData(response);
      } catch (e: any) {
        setError(e.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [
      fetchWithSession,
      refreshSession,
      initialParams?.page,
      initialParams?.pageSize,
      initialParams?.shopId,
      initialParams?.filter?.searchTerm,
    ],
  );

  useEffect(() => {
    if (initialParams?.skip) return;
    fetchPromocodes(initialParams);
  }, [
    initialParams?.shopId,
    initialParams?.page,
    initialParams?.pageSize,
    initialParams?.skip,
    initialParams?.filter?.searchTerm,
    fetchPromocodes,
  ]);

  return { data, loading, error, refetch: fetchPromocodes };
};
