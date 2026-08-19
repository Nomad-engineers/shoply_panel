"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";

export type ReviewFilter = "latest" | "positive" | "negative";
export type SellersSort = "id" | "revenue" | "products";
export type CouriersSort = "onShift" | "orders";

export interface DashboardReview {
  id: number;
  createdAt: string;
  rate: number;
  text: string;
  shopId: number;
  shopName: string;
}

export interface DashboardSellerRow {
  id: number;
  name: string;
  orderCount: number;
  revenue: number;
  rating: number;
  productCount: number;
}

export interface DashboardCourierRow {
  id: number;
  name: string;
  orderCount: number;
  income: number;
  onShift: boolean;
}

interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; pageCount: number };
}

export const useDashboardLists = (options: { skip?: boolean } = {}) => {
  const fetcher = useAuthFetcher();
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("latest");
  const [sellersSort, setSellersSort] = useState<SellersSort>("id");
  const [couriersSort, setCouriersSort] = useState<CouriersSort>("orders");

  const reviews = useQuery({
    queryKey: ["dashboard-reviews", reviewFilter],
    queryFn: () =>
      fetcher<Paginated<DashboardReview>>(
        `/v2/admin/statistic/dashboard/reviews?filter=${reviewFilter}&page=1&pageSize=6`,
      ),
    enabled: !options.skip,
  });

  const sellers = useQuery({
    queryKey: ["dashboard-sellers", sellersSort],
    queryFn: () =>
      fetcher<Paginated<DashboardSellerRow>>(`/v2/admin/statistic/dashboard/sellers?sort=${sellersSort}`),
    enabled: !options.skip,
  });

  const couriers = useQuery({
    queryKey: ["dashboard-couriers", couriersSort],
    queryFn: () =>
      fetcher<Paginated<DashboardCourierRow>>(`/v2/admin/statistic/dashboard/couriers?sort=${couriersSort}`),
    enabled: !options.skip,
  });

  return {
    reviews: {
      data: Array.isArray(reviews.data?.data) ? reviews.data.data : [],
      loading: reviews.isLoading,
      error: (reviews.error as Error | null)?.message ?? null,
    },
    sellers: {
      data: Array.isArray(sellers.data?.data) ? sellers.data.data : [],
      loading: sellers.isLoading,
      error: (sellers.error as Error | null)?.message ?? null,
    },
    couriers: {
      data: Array.isArray(couriers.data?.data) ? couriers.data.data : [],
      loading: couriers.isLoading,
      error: (couriers.error as Error | null)?.message ?? null,
    },
    fetchReviews: setReviewFilter,
    fetchSellers: setSellersSort,
    fetchCouriers: setCouriersSort,
  };
};
