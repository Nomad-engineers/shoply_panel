import { useMemo } from "react";
import { useApiData } from "@/components/hooks/useApiData";
import { useAuthContext } from "@/components/providers/AuthProvider";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import { FlattenedProduct, SubCategoryWithFlattened } from "../types";

interface UseProductDataParams {
  categoryId: string | undefined;
  searchQuery: string;
  tab: "active" | "archived";
}

export function useProductData({
  categoryId,
  searchQuery,
  tab,
}: UseProductDataParams) {
  const role = Cookies.get("user_role");
  const { currentShopId } = useAuthContext();
  const shopId = currentShopId ? String(currentShopId) : undefined;

  const params = useMemo(() => {
    const filters: any = {};

    if (role === ROLES.SHOP_OWNER && shopId) {
      filters["shop.id"] = shopId;
    }

    return {
      search: JSON.stringify(filters),
    };
  }, [role, categoryId, shopId]);

  const {
    data: subCategoriesData,
    loading,
    refetch,
  } = useApiData<any>(`subCategory/archived/${categoryId}`, {
    searchParams: params,
  });

  const subCategories = useMemo((): SubCategoryWithFlattened[] => {
    const responseData = subCategoriesData[0];
    const actualRecords = responseData?.records || [];

    if (!actualRecords.length) return [];

    const query = searchQuery.toLowerCase().trim();

    return actualRecords
      .map((sub: any) => {
        const flattened: FlattenedProduct[] = [];

        sub.products?.forEach((p: any) => {
          p.shopProduct?.forEach((sp: any) => {
            const matchesSearch =
              p.name.toLowerCase().includes(query) ||
              p.article?.toLowerCase().includes(query) ||
              sp.shop?.name?.toLowerCase().includes(query);

            if (query && !matchesSearch) return;

            flattened.push({
              ...p,
              activeShopProduct: sp,
              subCategoryId: sub.id,
              uniqueKey: String(sp.id),
            });
          });
        });

        return {
          ...sub,
          isArchived: sub.isArchived ?? false,
          subCategoryId: sub.id,
          products: flattened,
          displayCount: flattened.length,
        } as SubCategoryWithFlattened;
      })
      .filter((sub: any) => sub.products.length > 0 || !query);
  }, [subCategoriesData, searchQuery]);

  return {
    subCategories,
    loading,
    refetch,
  };
}
