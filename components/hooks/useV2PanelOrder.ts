"use client";

import { useCallback } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { baseUrl } from "@/lib/utils";
import type {
  V2PanelOrderDetailDto,
  V2PanelOrderDetailResponse,
  CancelOrderDto,
  AddOrderItemDto,
  UpdateOrderItemDto,
} from "@/types/v2-panel-order.dto";

export function useV2PanelOrder() {
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

  const fetchOrderDetail = useCallback(async (orderId: number): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}`);
    return response.data;
  }, [fetchJson]);

  const acceptOrder = useCallback(async (orderId: number): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/accept`, {
      method: "PATCH",
    });
    return response.data;
  }, [fetchJson]);

  const cancelOrder = useCallback(async (orderId: number, data: CancelOrderDto): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.data;
  }, [fetchJson]);

  const assembleOrder = useCallback(async (orderId: number): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/assemble`, {
      method: "PATCH",
    });
    return response.data;
  }, [fetchJson]);

  const addItem = useCallback(async (orderId: number, data: AddOrderItemDto): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.data;
  }, [fetchJson]);

  const updateItem = useCallback(async (orderId: number, itemId: number, data: UpdateOrderItemDto): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.data;
  }, [fetchJson]);

  const deleteItem = useCallback(async (orderId: number, itemId: number): Promise<V2PanelOrderDetailDto> => {
    const response = await fetchJson<V2PanelOrderDetailResponse>(`/v2/panel/order/${orderId}/items/${itemId}`, {
      method: "DELETE",
    });
    return response.data;
  }, [fetchJson]);

  return {
    fetchOrderDetail,
    acceptOrder,
    cancelOrder,
    assembleOrder,
    addItem,
    updateItem,
    deleteItem,
  };
}
