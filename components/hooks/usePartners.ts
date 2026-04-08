"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "./useLogin";

export type PartnerApiType = "shop" | "restaurant" | "service";

export interface V2CategorySearchSubCategoryDto {
  id: number;
  name: string;
  productsCount: number;
  photoId?: string | null;
}

export interface V2CategorySummaryDto {
  id: number;
  name: string;
  customOrderId?: number;
  productsCount: number;
  photoId?: string | null;
  subCategories?: V2CategorySearchSubCategoryDto[];
}

export interface V2ShopWithCategoriesDto {
  id: number;
  name: string;
  description: string;
  type: PartnerApiType;
  supportPhone: string;
  deliveryCost: number;
  deliveryTime: number;
  serviceFee: number;
  freeDeliveryThreshold: number;
  workTimeStart: string;
  workTimeEnd: string;
  tempClosedFrom?: string | null;
  tempClosedUntil?: string | null;
  photoId?: string | null;
  categories: V2CategorySummaryDto[];
}

interface V2ShopWithCategoriesListResponseDto {
  timestamp: string;
  data: V2ShopWithCategoriesDto[];
}

export const usePartners = () => {
  const { loading: authLoading } = useAuth();

  const url = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return null;
    }

    return `${process.env.NEXT_PUBLIC_API_URL}/v2/shop`;
  }, []);

  const { data, error, isLoading, mutate } =
    useSWR<V2ShopWithCategoriesListResponseDto>(url);

  return {
    partners: data?.data ?? [],
    loading: isLoading || authLoading,
    error: error?.message ?? null,
    refetch: mutate,
  };
};
