import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";
import { useApiMutation } from "./useApiMutation";
import type { Banner, BannersResponse } from "@/types/banner";

export interface FetchBannersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | "active" | "archived";
  skip?: boolean;
}

export interface ReorderBannerItem {
  id: number;
  customOrderId: number;
}

export const useBanners = (initialParams?: FetchBannersParams) => {
  const url = useMemo(() => {
    if (initialParams?.skip) return null;

    const page = initialParams?.page ?? 1;
    const pageSize = initialParams?.pageSize ?? 30;
    const search = initialParams?.search?.trim();
    const status = initialParams?.status ?? "all";

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", String(pageSize));
    if (search) queryParams.set("search", search);
    if (status !== "all") queryParams.set("status", status);

    return `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/banner?${queryParams.toString()}`;
  }, [
    initialParams?.skip,
    initialParams?.page,
    initialParams?.pageSize,
    initialParams?.search,
    initialParams?.status,
  ]);

  const fetcher = useAuthFetcher();
  const { mutate, isLoading: isReordering } = useApiMutation();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["banners", url],
    queryFn: () => fetcher<BannersResponse>(url!),
    enabled: !!url,
  });

  const reorderBanners = (items: ReorderBannerItem[]) =>
    mutate("v2/admin/banner/reorder", { method: "PATCH", body: { items } });

  return {
    data: (data?.data ?? []) as Banner[],
    total: data?.meta?.total ?? 0,
    loading: isLoading,
    error: (error as Error | null)?.message || null,
    refetch: () => refetch(),
    reorderBanners,
    isReordering,
  };
};
