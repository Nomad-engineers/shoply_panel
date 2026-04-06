import { useMemo } from "react";
import { useApiData } from "@/components/hooks/useApiData";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { FlattenedProduct, SubCategoryWithFlattened } from "../types";
import { getImageUrl } from "@/lib/utils";

interface UseProductDataParams {
  categoryId: string | undefined;
  searchQuery: string;
  tab: "active" | "archived";
}

export function useProductData({
  categoryId,
  searchQuery,
  tab: _tab,
}: UseProductDataParams) {
  const { currentShopId } = useAuthContext();
  const shopId = currentShopId ? String(currentShopId) : undefined;

  const params = useMemo(() => {
    return {
      ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
    };
  }, [searchQuery]);

  const {
    data: subCategoriesData,
    loading,
  } = useApiData<any>(
    shopId && categoryId ? `v2/shop/${shopId}/categories/${categoryId}/products` : null,
    {
      searchParams: params,
    },
  );

  const subCategories = useMemo((): SubCategoryWithFlattened[] => {
    const responseData = subCategoriesData[0];
    const actualRecords = responseData?.subCategories || [];

    if (!actualRecords.length) return [];

    return actualRecords
      .map((sub: any) => {
        const flattened: FlattenedProduct[] =
          sub.products?.map((product: any) => ({
            uniqueKey: String(product.productId),
            name: product.name,
            barcodes: product.barcodes || [],
            weight: product.weight,
            measure: product.measure,
            photos: product.photoId
              ? [{ file: { url: getImageUrl({ id: product.photoId }, { width: 120, height: 120, fit: "cover" }) } }]
              : [],
            subCategoryId: sub.id,
            activeShopProduct: {
              id: product.productId,
              price: product.price,
              inStock: product.inStock,
              archivedAt: product.archivedAt || "",
              shop: {
                id: product.shopId,
                name: "",
              },
            },
          })) || [];

        return {
          id: sub.id,
          name: sub.name,
          isArchived: sub.isArchived ?? false,
          subCategoryId: sub.id,
          products: flattened,
          displayCount: flattened.length,
        } as SubCategoryWithFlattened;
      })
      .filter((sub: any) => sub.products.length > 0);
  }, [subCategoriesData]);

  return {
    subCategories,
    loading,
  };
}
