"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../providers/AuthProvider";
import { useAuthFetcher } from "../providers/QueryProvider";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface UseApiOptions {
  relations?: string[];
  searchParams?: Record<string, string>;
}

export const useApiData = <T>(
  path: string | null,
  options: UseApiOptions = {}
) => {
  const router = useRouter();
  const { loading: authLoading } = useAuthContext();

  const url = useMemo(() => {
    if (!path) return null;

    const queryParams = new URLSearchParams();

    if (options.relations?.length) {
      queryParams.set("relations", options.relations.join(","));
    }

    if (options.searchParams) {
      Object.entries(options.searchParams).forEach(([key, value]) => {
        queryParams.set(key, value);
      });
    }

    return `${process.env.NEXT_PUBLIC_API_URL}/${path}?${queryParams.toString()}`;
  }, [path, options.relations, options.searchParams]);

  const fetcher = useAuthFetcher();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["api-data", url],
    queryFn: () => fetcher<any>(url!),
    enabled: !!url,
  });

  useEffect(() => {
    if (data?.statusCode === 403 || data?.statusCode === 404) {
      router.push("/not-found");
    }
  }, [data, router]);

  const resultData = useMemo(() => {
    const rawData = data?.data ?? data;
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : [rawData];
  }, [data]);

  return {
    data: resultData as T[],
    dataCount: data?.meta?.total,
    singleItem: (data?.data ?? data) as T,
    loading: isLoading || authLoading,
    error: (error as Error | null)?.message || null,
    refetch,
  };
};

