import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";
import type { PromocodesResponse } from "@/types/promocode";

export interface FetchPromocodesParams {
  page?: number;
  pageSize?: number;
  relations?: string;
  shopId?: number;
  filter?: Record<string, any>;
  skip?: boolean;
  isAdmin?: boolean;
}

export const usePromocodes = (initialParams?: FetchPromocodesParams) => {
  const url = useMemo(() => {
    if (initialParams?.skip) return null;

    const page = initialParams?.page ?? 1;
    const pageSize = initialParams?.pageSize ?? 10;
    const shopId = initialParams?.shopId;
    const search = initialParams?.filter?.search;
    const isAdmin = initialParams?.isAdmin;

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", String(pageSize));

    if (isAdmin && shopId) {
      queryParams.set("shopId", String(shopId));
    }

    if (search) {
      queryParams.set("search", String(search));
    }

    const baseUrl = isAdmin
      ? `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode`
      : `${process.env.NEXT_PUBLIC_API_URL}/v2/shop/${shopId}/promocode`;

    return `${baseUrl}?${queryParams.toString()}`;
  }, [
    initialParams?.skip,
    initialParams?.page,
    initialParams?.pageSize,
    initialParams?.shopId,
    initialParams?.filter?.search,
    initialParams?.isAdmin,
  ]);

  const fetcher = useAuthFetcher();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["promocodes", url],
    queryFn: () => fetcher<PromocodesResponse>(url!),
    enabled: !!url,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: (error as Error | null)?.message || null,
    refetch: () => refetch(),
  };
};
