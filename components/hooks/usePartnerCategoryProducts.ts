"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "./useLogin";

export interface V2PartnerCategoryProductDto {
  productId: number;
  name: string;
  price: number;
  inStock: boolean;
  archivedAt?: string | null;
  article?: string | null;
  weight: number;
  measure: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  shopId: number;
  photoId?: string | null;
  barcodes: string[];
}

export interface V2PartnerCategoryDto {
  id: number;
  name: string;
  customOrderId: number;
  productsCount: number;
  photoId?: string | null;
}

export interface V2PartnerSubCategoryDto {
  id: number;
  name: string;
  customOrderId: number;
  productsCount: number;
  photoId?: string | null;
  products: V2PartnerCategoryProductDto[];
}

interface V2PaginationDto {
  total: number;
  page: number;
  pageCount: number;
}

interface V2CategoryProductsDataDto {
  category: V2PartnerCategoryDto;
  subCategories: V2PartnerSubCategoryDto[];
  meta: V2PaginationDto;
}

interface V2CategoryProductsResponseDto {
  timestamp: string;
  data: V2CategoryProductsDataDto;
}

export function usePartnerCategoryProducts(
  shopId?: number,
  categoryId?: number,
) {
  const { loading: authLoading } = useAuth();

  const url = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_API_URL || !shopId || !categoryId) {
      return null;
    }

    return `${process.env.NEXT_PUBLIC_API_URL}/v2/shop/${shopId}/categories/${categoryId}/products`;
  }, [categoryId, shopId]);

  const { data, error, isLoading, mutate } =
    useSWR<V2CategoryProductsResponseDto>(url);

  return {
    categoryData: data?.data ?? null,
    loading: isLoading || authLoading,
    error: error?.message ?? null,
    refetch: mutate,
  };
}
