"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";
import { Shop, ShopStats } from "@/types/shop";

interface FetchShopsParams {
  periodType?: "day" | "week" | "month" | "halfYear" | "year" | "period";
  dateFrom?: string;
  dateTo?: string;
  isPublic?: string;
  skip?: boolean;
  isAdmin?: boolean;
}

interface ShopsResponse {
  data?: Shop[] | { data: Shop[] };
}

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

export const useShops = (initialParams?: FetchShopsParams) => {
  const fetcher = useAuthFetcher();
  const [params, setParams] = useState<FetchShopsParams | undefined>(initialParams);

  useEffect(() => {
    setParams(initialParams);
  }, [
    initialParams?.isAdmin,
    initialParams?.periodType,
    initialParams?.dateFrom,
    initialParams?.dateTo,
    initialParams?.skip,
    initialParams?.isPublic,
  ]);

  const url = useMemo(() => {
    if (params?.skip) return null;

    const isAdmin = params?.isAdmin;
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}${isAdmin ? "/admin" : ""}/shops`;

    const queryParams = new URLSearchParams();
    if (params?.periodType) queryParams.append("periodType", params.periodType);
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params?.isPublic) queryParams.append("isPublic", params.isPublic);

    queryParams.append("relations", "photo,orders");

    return `${baseUrl}?${queryParams.toString()}`;
  }, [params]);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["shops", url],
    queryFn: () => fetcher<ShopsResponse | Shop[]>(url!),
    enabled: !!url,
  });

  const shops = useMemo<Shop[]>(() => {
    if (!data) return [];
    const rawData = (data as ShopsResponse).data || data;
    return Array.isArray(rawData) ? rawData : [];
  }, [data]);

  const shopsStats = useMemo(() => calculateShopStats(shops), [shops]);

  const fetchShopsData = (newParams?: FetchShopsParams) => {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }));
    } else {
      refetch();
    }
  };

  return {
    shops,
    shopsStats,
    loading: isLoading,
    error: (error as Error | null)?.message || null,
    refetch: fetchShopsData,
  };
};
