import { useMemo } from "react";
import { useApiData } from "@/components/hooks/useApiData";
import { SubCategory, Product } from "@/types/category.types";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import { FlattenedProduct, SubCategoryWithFlattened } from "../types";

interface UseProductDataParams {
  categoryId: string | undefined;
  searchQuery: string;
}

interface UseProductDataReturn {
  subCategories: SubCategoryWithFlattened[];
  loading: boolean;
}

export function useProductData({
  categoryId,
  searchQuery,
}: UseProductDataParams): UseProductDataReturn {
  const role = Cookies.get("user_role");
  const shopId = Cookies.get("user_shop_id");

  const { data: productsData } = useApiData<Product>("products", {
    relations: ["photos.file", "shopProduct.shop", "subCategory"],
    searchParams: {
      search: JSON.stringify({
        subCategory: { category: { id: categoryId } },
      }),
    },
  });

  const { data: subCategoriesData, loading } = useApiData<SubCategory>(
    "subCategory",
    {
      searchParams: {
        search: JSON.stringify({
          category: { id: categoryId },
        }),
      },
    }
  );

  const subCategories = useMemo((): SubCategoryWithFlattened[] => {
    if (!subCategoriesData) return [];
    const query = searchQuery.toLowerCase().trim();

    return subCategoriesData
      .map((sub) => {
        const flattened: FlattenedProduct[] = [];

        productsData?.forEach((p) => {
          if (p.subCategory?.id !== sub.id) return;

          if (role === ROLES.ADMIN) {
            p.shopProduct?.forEach((sp) => {
              const matchesSearch =
                p.name.toLowerCase().includes(query) ||
                p.article?.toLowerCase().includes(query) ||
                sp.shop?.name.toLowerCase().includes(query);

              if (query && !matchesSearch) return;

              flattened.push({
                ...p,
                activeShopProduct: sp,
                uniqueKey: String(sp.id),
              });
            });
          } else {
            const sp = p.shopProduct?.find(
              (item) => String(item.shop?.id) === String(shopId)
            );
            if (sp) {
              const matchesSearch =
                p.name.toLowerCase().includes(query) ||
                p.article?.toLowerCase().includes(query);

              if (query && !matchesSearch) return;

              flattened.push({
                ...p,
                activeShopProduct: sp,
                uniqueKey: String(sp.id),
              });
            }
          }
        });

        return {
          ...sub,
          products: flattened,
          displayCount: flattened.length,
        };
      })
      .filter((sub) => sub.products.length > 0 || !query);
  }, [subCategoriesData, productsData, role, shopId, searchQuery]);

  return {
    subCategories,
    loading,
  };
}
