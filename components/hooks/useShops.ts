"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "./useLogin";
import { Shop, ShopStats } from "@/types/shop";
import useSWR from "swr";

interface FetchShopsParams {
  periodType?: "day" | "week" | "month" | "halfYear" | "year" | "period";
  dateFrom?: string;
  dateTo?: string;
  isPublic?: string;
  skip?: boolean;
  isAdmin?: boolean;
}

export const useShops = (initialParams?: FetchShopsParams) => {
  const { refreshSession, fetchWithSession } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL
  );
  const [params, setParams] = useState<FetchShopsParams | undefined>(
    initialParams
  );
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsStats, setShopsStats] = useState<ShopStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  const url = useMemo(() => {
    if (params?.skip) return null;

    const isAdmin = params?.isAdmin;
    let baseUrl = `${process.env.NEXT_PUBLIC_API_URL}${isAdmin ? "/admin" : ""}/shops`;

    const queryParams = new URLSearchParams();
    if (params?.periodType) queryParams.append("periodType", params.periodType);
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params?.isPublic) queryParams.append("isPublic", params.isPublic);

    queryParams.append("relations", "photo,orders");

    return `${baseUrl}?${queryParams.toString()}`;
  }, [params]);

  const { data, error: swrError, isLoading, mutate } = useSWR(url);

  const calculateShopStats = (shopsData: Shop[]): ShopStats[] => {
    return shopsData.map((shop) => {
      const orders = shop.orders || [];
      const validOrders = orders.filter(
        (order) => order.status === "completed" && !order.isCancelled
      );

      const orderCount = validOrders.length;
      const revenue = validOrders.reduce(
        (sum, order) => sum + (Number(order.subtotalPrice) || 0),
        0
      );
      const serviceIncome = validOrders.reduce(
        (sum, order) => sum + (Number(order.commissionService) || 0),
        0
      );

      return {
        id: shop.id,
        name: shop.name,
        orderCount,
        revenue,
        serviceIncome,
        photoUrl: shop.photo?.url || null,
        photo: shop.photo,
      };
    });
  };

  useEffect(() => {
    if (data) {
      const rawData = data.data || data;
      const shopsData = Array.isArray(rawData) ? rawData : [];
      const stats = calculateShopStats(shopsData);

      setShops(shopsData);
      setShopsStats(stats);
    }
    if (swrError) {
      setError(swrError.message);
    }
  }, [data, swrError]);

  const fetchShopsData = (newParams?: FetchShopsParams) => {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }));
    } else {
      mutate();
    }
  };

  return {
    shops,
    shopsStats,
    loading: isLoading,
    error,
    refetch: fetchShopsData,
  };
};