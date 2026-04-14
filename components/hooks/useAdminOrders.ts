"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useLogin";
import type { AdminOrder, AdminOrdersMeta, AdminOrdersResponse } from "@/types/admin-order";

interface UseAdminOrdersParams {
  page?: number;
  pageSize?: number;
  skip?: boolean;
}

const EMPTY_META: AdminOrdersMeta = {
  total: 0,
  pageCount: 1,
  page: 1,
};

export const useAdminOrders = (params: UseAdminOrdersParams = {}) => {
  const { refreshSession, fetchWithSession } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState<AdminOrdersMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (params.skip) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(params.page ?? 1));
      queryParams.set("pageSize", String(params.pageSize ?? 20));

      const url = `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/order/active?${queryParams.toString()}`;
      const res = await fetchWithSession(
        url,
        () => localStorage.getItem("access_token"),
        refreshSession,
      );

      if (!res.ok) {
        throw new Error("Ошибка при получении активных заказов");
      }

      const json = (await res.json()) as AdminOrdersResponse;
      setOrders(json.data ?? []);
      setMeta(json.meta ?? EMPTY_META);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при получении активных заказов");
      setOrders([]);
      setMeta(EMPTY_META);
    } finally {
      setLoading(false);
    }
  }, [fetchWithSession, params.page, params.pageSize, params.skip, refreshSession]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    meta,
    loading,
    error,
    refetch: fetchOrders,
  };
};
