"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/theme";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { MainSection } from "@/components/layout";
import { EditMenu } from "@/components/category/editMenu";
import { SearchFilter } from "@/components/category/search";
import { SelectionButtons } from "@/components/category/selectionButtons";
import Cookies from "js-cookie";
import { useProductData } from "./components/products/hooks/useProductData";
import { useProductSelection } from "./components/products/hooks/useProductSelection";
import { useSubCategoryExpansion } from "./components/products/hooks/useSubCategoryExpansion";
import { SubCategorySection } from "./components/products/SubCategorySection";
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { ROLES } from "@/middleware";
import { useViewMode } from "@/hooks/use-view-mode";
import { ViewModeToggle } from "../components/category/ViewModeToggle";
import { FlattenedProduct } from "./components/products/types";
import { toast } from "sonner";
import { EditableProductData } from "@/components/hooks/category/useEditProduct";
import { measureLabels, ProductMeasure } from "@/types/category.types";
import * as XLSX from "xlsx";

export default function SubCategoryPage() {
  const router = useRouter();
  const { categoryId } = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const categoryName = searchParams.get("name");
  const shopId = Cookies.get("current_shop_id");
  const userRole = Cookies.get("user_role");

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useViewMode("SUBCATEGORIES", "list");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [productArchiveOverrides, setProductArchiveOverrides] = useState<
    Record<string, boolean>
  >({});
  const [productInlineOverrides, setProductInlineOverrides] = useState<
    Record<string, FlattenedProduct>
  >({});
  const [subCategoryArchiveOverrides, setSubCategoryArchiveOverrides] =
    useState<Record<number, boolean>>({});

  const { mutate } = useApiMutation();

  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const { category, subCategories, loading } = useProductData({
    categoryId: categoryId as string,
    searchQuery,
    tab: activeTab,
  });

  const filteredSubCategories = useMemo(() => {
    return subCategories
      .map((sub) => {
        const isSubCategoryArchived =
          subCategoryArchiveOverrides[sub.id] ?? sub.isArchived;

        const products =
          sub.products?.map((product: any) => {
            const resolvedProduct =
              productInlineOverrides[product.uniqueKey] ?? product;
            const isArchived =
              productArchiveOverrides[resolvedProduct.uniqueKey] ??
              isSubCategoryArchived ??
              Boolean(resolvedProduct.activeShopProduct?.archivedAt);

            return {
              ...resolvedProduct,
              activeShopProduct: {
                ...resolvedProduct.activeShopProduct,
                archivedAt: isArchived
                  ? resolvedProduct.activeShopProduct?.archivedAt ||
                    new Date().toISOString()
                  : "",
              },
            };
          }) || [];

        const filteredProducts = products.filter((product: any) => {
          const isArchived = Boolean(product.activeShopProduct?.archivedAt);
          return activeTab === "archived" ? isArchived : !isArchived;
        });

        return {
          ...sub,
          isArchived: isSubCategoryArchived,
          products: filteredProducts,
          hasMatchProducts: filteredProducts.length > 0,
        };
      })
      .filter((sub) => {
        if (activeTab === "archived") {
          return sub.hasMatchProducts || sub.isArchived;
        }

        return !sub.isArchived;
      });
  }, [
    activeTab,
    productArchiveOverrides,
    productInlineOverrides,
    subCategories,
    subCategoryArchiveOverrides,
  ]);

  const {
    selectedUniqueKeys,
    isAllSelected,
    selectedProducts,
    toggleProduct,
    toggleSubCategoryProducts,
    toggleAll,
    clearSelection,
  } = useProductSelection({ subCategories: filteredSubCategories });

  const { openSubCategoryIds, toggleSubCategory } = useSubCategoryExpansion({
    subCategories: filteredSubCategories,
    searchQuery,
  });

  useEffect(() => {
    clearSelection();
  }, [activeTab, clearSelection]);

  const copyToClipboard = (
    text: string | null | undefined,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Штрихкод скопирован");
  };

  const handleProductClick = (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => {
    const selectedProduct = filteredSubCategories
      .flatMap((sub) => sub.products)
      .find((product) => product.activeShopProduct.id === shopProductId);

    if (selectedProduct && typeof window !== "undefined") {
      const seed: EditableProductData = {
        productId: selectedProduct.activeShopProduct.id,
        createdAt: selectedProduct.createdAt,
        shopId: selectedProduct.activeShopProduct.shop.id,
        categoryId: Number(categoryId),
        subCategoryId: subId,
        subCategoryName: selectedProduct.subCategoryName.trim(),
        name: selectedProduct.name,
        purchasePrice: 0,
        price: selectedProduct.activeShopProduct.price,
        inStock: selectedProduct.activeShopProduct.inStock,
        archivedAt: selectedProduct.activeShopProduct.archivedAt || null,
        weight: selectedProduct.weight,
        measure: (selectedProduct.measure || "pc") as ProductMeasure,
        article: "",
        barcodes: selectedProduct.barcodes,
        shop: {
          id: selectedProduct.activeShopProduct.shop.id,
          name: selectedProduct.activeShopProduct.shop.name,
        },
        product: {
          id: selectedProduct.activeShopProduct.id,
          name: selectedProduct.name,
          weight: selectedProduct.weight,
          measure: (selectedProduct.measure || "pc") as ProductMeasure,
          article: "",
          barcodes: selectedProduct.barcodes,
          subCategory: {
            id: subId,
            name: "",
            category: {
              id: Number(categoryId),
              name: categoryName || "",
            },
          },
          photos:
            selectedProduct.photos?.map((photo: any, index: number) => ({
              id: photo.id ?? index,
              file: {
                url: photo.file?.url || "",
              },
            })) ?? [],
        },
      };

      window.sessionStorage.setItem(
        `shoply:edit-product:${shopProductId}`,
        JSON.stringify(seed)
      );
    }

    router.push(`${pathname}/subCategory/${subId}/product/${shopProductId}`);
  };

  const handleExportSelected = () => {
    if (selectedProducts.length === 0) {
      toast.error("Выберите хотя бы один товар для экспорта");
      return;
    }

    const rows = selectedProducts.map((product) => ({
      Название: product.name,
      Остаток: product.activeShopProduct.inStock ? 1 : 0,
      "Единица измерения": product.measure ? measureLabels[product.measure] : "шт",
      "Цена продажи": product.activeShopProduct.price || 0,
      Артикул: product.uniqueKey,
      Штрихкод: product.barcodes.join(", "),
      "Цена закупки": 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Экспорт");
    XLSX.writeFile(
      workbook,
      `export_products_${new Date().toLocaleDateString()}.xlsx`
    );
  };

  const handleArchiveSelected = async () => {
    if (selectedUniqueKeys.length === 0) return;

    const subCategoryIdsToArchive: number[] = [];
    const individualProductsToArchive: Array<{
      uniqueKey: string;
      shopProductId: number;
    }> = [];

    filteredSubCategories.forEach((sub) => {
      const allProducts = sub.products || [];
      const allKeys = allProducts.map((product) => product.uniqueKey);
      const selectedInSub = allProducts.filter((product) =>
        selectedUniqueKeys.includes(product.uniqueKey)
      );

      if (allKeys.length > 0 && allKeys.length === selectedInSub.length) {
        subCategoryIdsToArchive.push(sub.id);
      } else {
        individualProductsToArchive.push(
          ...selectedInSub.map((product) => ({
            uniqueKey: product.uniqueKey,
            shopProductId: product.activeShopProduct.id,
          }))
        );
      }
    });

    try {
      const promises = [
        ...subCategoryIdsToArchive.map((id) =>
          mutate(`subCategory/archive/${id}`, {
            method: "PATCH",
            body: { shopId },
          })
        ),
        ...individualProductsToArchive.map((product) =>
          mutate(`v2/shop/${shopId}/product/${product.shopProductId}/archive`, {
            method: "POST",
          })
        ),
      ];

      await Promise.all(promises);
      setSubCategoryArchiveOverrides((current) => {
        const next = { ...current };
        subCategoryIdsToArchive.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
      setProductArchiveOverrides((current) => {
        const next = { ...current };
        subCategoryIdsToArchive.forEach((subId) => {
          const subCategory = filteredSubCategories.find((sub) => sub.id === subId);
          subCategory?.products.forEach((product) => {
            next[product.uniqueKey] = true;
          });
        });
        individualProductsToArchive.forEach((product) => {
          next[product.uniqueKey] = true;
        });
        return next;
      });
      clearSelection();
    } catch (e: any) {
      toast.error("Ошибка при архивации: " + e.message);
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedUniqueKeys.length === 0) return;

    const subCategoryIdsToUnarchive: number[] = [];
    const individualProductsToUnarchive: Array<{
      uniqueKey: string;
      shopProductId: number;
    }> = [];

    filteredSubCategories.forEach((sub) => {
      const allProducts = sub.products || [];
      const allKeys = allProducts.map((product) => product.uniqueKey);
      const selectedInSub = allProducts.filter((product) =>
        selectedUniqueKeys.includes(product.uniqueKey)
      );

      if (allKeys.length > 0 && allKeys.length === selectedInSub.length) {
        subCategoryIdsToUnarchive.push(sub.id);
      } else {
        individualProductsToUnarchive.push(
          ...selectedInSub.map((product) => ({
            uniqueKey: product.uniqueKey,
            shopProductId: product.activeShopProduct.id,
          }))
        );
      }
    });

    try {
      const promises = [
        ...subCategoryIdsToUnarchive.map((id) =>
          mutate(`subCategory/unarchive/${id}`, {
            method: "PATCH",
            body: { shopId },
          })
        ),
        ...individualProductsToUnarchive.map((product) =>
          mutate(`v2/shop/${shopId}/product/${product.shopProductId}/unarchive`, {
            method: "POST",
          })
        ),
      ];

      await Promise.all(promises);
      setSubCategoryArchiveOverrides((current) => {
        const next = { ...current };
        subCategoryIdsToUnarchive.forEach((id) => {
          next[id] = false;
        });
        return next;
      });
      setProductArchiveOverrides((current) => {
        const next = { ...current };
        subCategoryIdsToUnarchive.forEach((subId) => {
          const subCategory = filteredSubCategories.find((sub) => sub.id === subId);
          subCategory?.products.forEach((product) => {
            next[product.uniqueKey] = false;
          });
        });
        individualProductsToUnarchive.forEach((product) => {
          next[product.uniqueKey] = false;
        });
        return next;
      });
      clearSelection();
    } catch (e: any) {
      toast.error("Ошибка при восстановлении: " + e.message);
    }
  };

  const handleInlineProductUpdated = (updatedProduct: FlattenedProduct) => {
    setProductInlineOverrides((current) => ({
      ...current,
      [updatedProduct.uniqueKey]: updatedProduct,
    }));
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Загрузка данных...
      </div>
    );

  return (
    <MainSection>
      <div className="min-h-0 flex flex-1 flex-col gap-3 overflow-y-auto p-[18px]">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1f2333] transition-colors hover:bg-[#f4f5fb]"
                aria-label="Назад"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-[20px] font-bold leading-none text-[#1b2030]">
                {category?.name || categoryName}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                variant="minimal"
                placeholder="Поиск по товарам"
                className="w-[240px]"
              />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={toggleAll}
            className="flex items-center gap-3 text-[16px] font-normal transition-colors"
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                isAllSelected
                  ? "border-[#55CB00] bg-[#55CB00]/10"
                  : "border-[#b8bdcc] bg-white"
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  isAllSelected ? "bg-[#55CB00]" : "bg-transparent"
                )}
              />
            </span>
            {isAllSelected
              ? `Выбрано товаров: ${selectedUniqueKeys.length}`
              : "Выбрать все"}
          </button>

          <SelectionButtons
            selectedCount={selectedUniqueKeys.length}
            activeTab={activeTab}
            onExport={handleExportSelected}
            onArchive={
              activeTab === "archived"
                ? handleUnarchiveSelected
                : handleArchiveSelected
            }
            onEditMenu={() => setIsEditMenuOpen(true)}
            modal="singleCategory"
          />
        </div>

        {filteredSubCategories.length > 0 ? (
          <div className="flex flex-col gap-1 divide-y divide-border">
            {filteredSubCategories.map((sub) => {
              const isOpen = openSubCategoryIds.includes(sub.id);
              const subKeys = sub.products?.map((p: any) => p.uniqueKey) || [];
              const isPartially = subKeys.some((k: any) =>
                selectedUniqueKeys.includes(k)
              );
              const isFully =
                subKeys.length > 0 &&
                subKeys.every((k: any) => selectedUniqueKeys.includes(k));

              return (
                <SubCategorySection
                key={sub.id}
                sub={sub}
                isOpen={isOpen}
                selectedUniqueKeys={selectedUniqueKeys}
                shopId={userRole == ROLES.ADMIN ? undefined : shopId}
                onUpdated={handleInlineProductUpdated}
                viewMode={viewMode}
                isPartiallySelected={isPartially}
                isFullySelected={isFully}
                  onToggleProducts={toggleSubCategoryProducts}
                  onToggleOpen={() => toggleSubCategory(sub.id)}
                  onProductToggle={toggleProduct}
                  onProductClick={handleProductClick}
                  onCopyBarcode={copyToClipboard}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            {activeTab === "active"
              ? "Нет активных подкатегорий"
              : "Архив пуст"}
          </div>
        )}
      </div>
      <EditMenu
        isOpen={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        selectedCount={selectedUniqueKeys.length}
        selectedProducts={selectedProducts}
        shopId={shopId}
      />
    </MainSection>
  );
}
