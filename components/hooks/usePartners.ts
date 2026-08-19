"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useLogin";
import { useAuthFetcher } from "../providers/QueryProvider";

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

  const fetcher = useAuthFetcher();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["partners"],
    queryFn: () => fetcher<V2ShopWithCategoriesListResponseDto>(url!),
    enabled: !!url,
  });

  return {
    partners: data?.data ?? [],
    loading: isLoading || authLoading,
    error: (error as Error | null)?.message || null,
    refetch,
  };
};
