import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useAuthFetcher } from "../providers/QueryProvider";
import type {
  CreatePushPayload,
  PushNotification,
  PushNotificationsResponse,
} from "@/types/push-notification";

export interface FetchPushesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  skip?: boolean;
}

export interface RecipientsParams {
  regionId?: number | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createPush = async (payload: CreatePushPayload): Promise<PushNotification> => {
  const token = Cookies.get("auth_token");
  const response = await fetch(`${API_URL}/v2/admin/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export const usePushNotifications = (initialParams?: FetchPushesParams) => {
  const url = useMemo(() => {
    if (initialParams?.skip) return null;

    const page = initialParams?.page ?? 1;
    const pageSize = initialParams?.pageSize ?? 30;
    const search = initialParams?.search?.trim();

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("pageSize", String(pageSize));
    if (search) queryParams.set("search", search);

    return `${API_URL}/v2/admin/push?${queryParams.toString()}`;
  }, [initialParams?.skip, initialParams?.page, initialParams?.pageSize, initialParams?.search]);

  const fetcher = useAuthFetcher();

  // Живое обновление, пока есть пуши в статусе отправки/планирования
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["push-notifications", url],
    queryFn: () => fetcher<PushNotificationsResponse>(url!),
    enabled: !!url,
    refetchInterval: (query) => {
      const records = query.state.data?.data ?? [];
      const inFlight = records.some(
        (p: PushNotification) => p.status === "sending" || p.status === "scheduled"
      );
      return inFlight ? 5000 : false;
    },
  });

  return {
    data: (data?.data ?? []) as PushNotification[],
    total: data?.meta?.total ?? 0,
    loading: isLoading,
    error: (error as Error | null)?.message || null,
    refetch: () => refetch(),
  };
};

/** Живой подсчет аудитории с учетом региона и выбранных пользователей */
export const usePushRecipients = (params: RecipientsParams) => {
  const fetcher = useAuthFetcher();

  const url = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (params.regionId) queryParams.set("regionId", String(params.regionId));
    return `${API_URL}/v2/admin/push/recipients?${queryParams.toString()}`;
  }, [params.regionId]);

  const { data, isLoading } = useQuery({
    queryKey: ["push-recipients", url],
    queryFn: () => fetcher<{ total: number }>(url),
    staleTime: 30_000,
    select: (response) => {
      // SuccessInterceptor оборачивает ответ: { data: { total } }
      const payload = (response as any)?.data ?? response;
      return typeof payload?.total === "number" ? payload.total : null;
    },
  });

  return { total: data ?? null, loading: isLoading };
};
