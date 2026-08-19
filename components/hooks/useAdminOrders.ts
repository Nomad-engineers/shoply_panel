"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useLogin";
import type {
  AdminOrder,
  AdminOrderResponse,
  AdminOrdersMeta,
  AdminOrdersResponse,
} from "@/types/admin-order";

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

/** Active statuses shown on the board. Completed/cancelled leave the active list. */
const ACTIVE_STATUSES = new Set<AdminOrder["status"]>([
  "pending",
  "assembling",
  "ready",
  "delivery",
  "completing",
]);

const FINISHED_LIMIT = 30;

export const useAdminOrders = (params: UseAdminOrdersParams = {}) => {
  const { refreshSession, fetchWithSession } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  // Synchronous mirror of `orders` so single-order patches can read the current
  // list outside of React's deferred render phase (for reliable meta delta).
  const ordersRef = useRef<AdminOrder[]>([]);
  // Completed/cancelled orders that left the active board, kept for the
  // "Завершенные" column (the /active endpoint does not return them).
  const [finishedOrders, setFinishedOrders] = useState<AdminOrder[]>([]);
  const finishedRef = useRef<AdminOrder[]>([]);
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
      const next = json.data ?? [];
      ordersRef.current = next;
      setOrders(next);
      setMeta(json.meta ?? EMPTY_META);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при получении активных заказов");
      ordersRef.current = [];
      setOrders([]);
      setMeta(EMPTY_META);
    } finally {
      setLoading(false);
    }
  }, [fetchWithSession, params.page, params.pageSize, params.skip, refreshSession]);

  /**
   * Seamless single-order refresh: fetch one order by id and patch it into the
   * list in place. No loading spinner — board stays interactive.
   *
   * - 404: order deleted on server → drop from board.
   * - order left active statuses (completed/cancelled) → drop from board.
   * - new active order → prepend.
   * - otherwise → patch in place, keep position.
   *
   * meta.total is adjusted by the net delta (+1 new / -1 removed) so the
   * "Активные" counter stays in sync without a full refetch.
   */
  const fetchOrder = useCallback(
    async (orderId: number) => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/order/${orderId}`;
        const res = await fetchWithSession(
          url,
          () => localStorage.getItem("access_token"),
          refreshSession,
        );

        // Order deleted on server — drop from board if present.
        if (res.status === 404) {
          const idx = ordersRef.current.findIndex((o) => o.id === orderId);
          if (idx !== -1) {
            const next = ordersRef.current.slice();
            next.splice(idx, 1);
            ordersRef.current = next;
            setOrders(next);
            setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
          }
          return;
        }

        if (!res.ok) return;

        const json = (await res.json()) as AdminOrderResponse;
        const order = json.data;

        // Compute delta + next array synchronously against the ref snapshot so
        // the meta counter reflects the actual change (setState updaters run
        // during render, not now — reading a delta out of them would race).
        const prev = ordersRef.current;
        const isActive = order && !order.isCancelled && ACTIVE_STATUSES.has(order.status);
        const idx = prev.findIndex((o) => o.id === orderId);

        let next = prev;
        let delta = 0;

        if (!isActive) {
          // Order left the active board — drop it, but keep it in the
          // finished list (completed/cancelled) so it can be shown in the
          // "Завершенные" column.
          if (idx === -1) return;
          next = prev.slice();
          next.splice(idx, 1);
          delta = -1;

          const finishedNext = [order, ...finishedRef.current.filter((o) => o.id !== order.id)].slice(
            0,
            FINISHED_LIMIT,
          );
          finishedRef.current = finishedNext;
          setFinishedOrders(finishedNext);
        } else if (idx === -1) {
          // New active order not yet on the board — prepend.
          next = [order, ...prev];
          delta = 1;
        } else {
          // Patch in place, keep position.
          next = prev.slice();
          next[idx] = order;
        }

        ordersRef.current = next;
        setOrders(next);
        if (delta !== 0) {
          setMeta((m) => ({ ...m, total: Math.max(0, m.total + delta) }));
        }
      } catch {
        // Silent: socket-driven refresh must never throw into the UI.
      }
    },
    [fetchWithSession, refreshSession],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    finishedOrders,
    meta,
    loading,
    error,
    refetch: fetchOrders,
    fetchOrder,
  };
};
