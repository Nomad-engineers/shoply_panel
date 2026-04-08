import { useMemo } from "react";
import useSWR from "swr";
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
  const url = useMemo(() => {
    if (initialParams?.skip) return null;

    const page = initialParams?.page ?? 1;
    const pageSize = initialParams?.pageSize ?? 10;
    const shopId = initialParams?.shopId;
    const search = initialParams?.filter?.search;

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", String(pageSize));

    if (shopId) {
      queryParams.set("shopId", String(shopId));
    }

    if (search) {
      queryParams.set("search", String(search));
    }


    return `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode?${queryParams.toString()}`;
  }, [
    initialParams?.skip,
    initialParams?.page,
    initialParams?.pageSize,
    initialParams?.shopId,
    initialParams?.filter?.search,
  ]);

  const { data, error, isLoading, mutate } = useSWR<PromocodesResponse>(url);

  return { 
    data: data || null, 
    loading: isLoading, 
    error: error?.message || null, 
    refetch: () => mutate() 
  };
};
