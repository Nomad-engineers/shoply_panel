//Хук предназначен для общего получения данных с передачей url,relations
import useSWR from 'swr';
import { useAuthContext } from '../providers/AuthProvider';
import { useMemo } from 'react';

interface UseApiOptions {
  relations?: string[];
  searchParams?: Record<string, string>;
}
export const useApiData = <T,>(path: string | null, options: UseApiOptions = {}) => {
  const { adminData } = useAuthContext();

  const url = useMemo(() => {
    if (!adminData || !path) return null;

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
  }, [adminData, path, JSON.stringify(options.relations), JSON.stringify(options.searchParams)]);

  const { data, error, isLoading, mutate } = useSWR(url);

  const resultData = useMemo(() => {
    const rawData = data?.data ?? data;
    return Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
  }, [data]);

  return {
    data: resultData as T[],
    singleItem: (data?.data ?? data) as T,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
};