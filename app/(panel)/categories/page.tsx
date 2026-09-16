"use client";

import React, { useMemo, useState, useEffect, Suspense, useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";
import { useApiData } from "@/components/hooks/useApiData";
import { MainSection } from "@/components/layout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import { useCategorySelection } from "./components/category/hooks/useCategorySelection";
import { ViewModeToggle } from "./components/category/ViewModeToggle";
import { CategoryGridView } from "./components/category/CategoryGridView";
import { CategoryListView } from "./components/category/CategoryListView";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { useViewMode } from "@/hooks/use-view-mode";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { FlattenedProduct } from "./[categoryId]/components/products/types";
import { ProductsList } from "./[categoryId]/components/products/ProductsList";

interface SearchCategoryResponse {
  id: number;
  name: string;
  productsCount: number;
  photoId?: string | null;
  customOrderId?: number;
}

function CategoryPageContent() {
  const router = useRouter();
  const userRole = Cookies.get("user_role");
  const { currentShopId } = useAuthContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [viewMode, setViewMode] = useViewMode("CATEGORIES", "grid");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedSelectedKeys, setArchivedSelectedKeys] = useState<string[]>([]);
  const [productInlineOverrides, setProductInlineOverrides] = useState<
    Record<string, FlattenedProduct>
  >({});
  const { mutate } = useApiMutation();

  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const setActiveTab = (tab: "active" | "archived") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const shopId = currentShopId ? String(currentShopId) : undefined;

  const { data: archivedProductsRaw, loading: archivedLoading, refetch: refetchArchived } = useApiData<any>(
    activeTab === "archived" && shopId
      ? `v2/shop/${shopId}/product/archive`
      : null,
    {}
  );

  const { data: searchedCategories, loading: searchLoading } =
    useApiData<SearchCategoryResponse>(
      shopId ? `v2/shop/${shopId}/search/categories` : null,
      {
        searchParams: searchQuery ? { q: searchQuery } : {},
      },
    );

  const archivedFlattened: FlattenedProduct[] = useMemo(() => {
    if (!archivedProductsRaw) return [];
    return archivedProductsRaw.map((p: any): FlattenedProduct => {
      const override = productInlineOverrides[String(p.productId)];
      if (override) return override;
      return {
        uniqueKey: String(p.productId),
        createdAt: p.createdAt ?? "",
        name: p.name,
        barcodes: p.barcodes || [],
        weight: p.weight ?? 0,
        measure: p.measure ?? null,
        photos: p.photos?.map((fileId: string, index: number) => ({
          id: index,
          fileId,
          file: fileId
            ? { url: getImageUrl({ id: fileId }, { width: 120, height: 120, fit: "cover" }) }
            : undefined,
        })) || [],
        subCategoryId: p.subCategoryId,
        subCategoryName: p.subCategoryName ?? "",
        activeShopProduct: {
          id: p.productId,
          price: p.price ?? 0,
          inStock: p.inStock ?? false,
          archivedAt: p.archivedAt ?? new Date().toISOString(),
          shop: { id: p.shopId, name: "" },
        },
      };
    });
  }, [archivedProductsRaw, productInlineOverrides]);

  const isArchivedAllSelected =
    archivedFlattened.length > 0 &&
    archivedSelectedKeys.length === archivedFlattened.length;

  const toggleArchivedProduct = useCallback((key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const toggleArchivedAll = useCallback(() => {
    setArchivedSelectedKeys(
      isArchivedAllSelected ? [] : archivedFlattened.map((p) => p.uniqueKey)
    );
  }, [isArchivedAllSelected, archivedFlattened]);

  useEffect(() => {
    setArchivedSelectedKeys([]);
  }, [activeTab]);

  const filteredCategories = useMemo(() => {
    if (activeTab === "archived" || !shopId) {
      return [];
    }

    return (searchedCategories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      customOrderId: category.customOrderId ?? 0,
      photo: category.photoId
        ? {
            id: category.photoId,
            url: getImageUrl(
              { id: category.photoId },
              { width: 240, height: 140, fit: "cover" },
            ),
            filename_download: "",
          }
        : null,
      subCategory: [],
      isArchived: false,
    })) as Category[];
  }, [activeTab, searchedCategories, shopId]);

  const { selectedIds, isAllSelected, toggleCategory, toggleAll } =
    useCategorySelection({ categories: filteredCategories });

  useEffect(() => {
    if (selectedIds.length > 0) {
      toggleAll();
    }
  }, [activeTab]);

  const handleUnarchiveProducts = async () => {
    if (archivedSelectedKeys.length === 0) return;
    const keysToRemove = [...archivedSelectedKeys];
    try {
      await Promise.all(
        keysToRemove.map((key) =>
          mutate(`v2/shop/${shopId}/product/${key}/unarchive`, {
            method: "POST",
          })
        )
      );
      setArchivedSelectedKeys([]);
      await refetchArchived();
      toast.success("Товары восстановлены");
    } catch (e: any) {
      toast.error("Ошибка при восстановлении: " + e.message);
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Выберите хотя бы одну категорию для экспорта");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/shop/shopProducts/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: JSON.stringify({
          categoryId: selectedIds.map(String),
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("В выбранных категориях нет товаров для экспорта");
        } else {
          toast.error(`Ошибка сервера: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `export_categories_${new Date().toLocaleDateString()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error("Ошибка при экспорте: " + e.message);
    }
  };

  const handleCardClick = (id: number, name: string) => {
    router.push(`/categories/${id}`);
  };

  const isPageLoading =
    activeTab === "archived" ? archivedLoading : shopId ? searchLoading : false;

  if (isPageLoading) {
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Загрузка каталога...
      </div>
    );
  }

  return (
    <MainSection>
      <div className="min-h-0 flex-1 overflow-y-auto p-[18px]">
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-4">
            <h2 className="text-[20px] font-bold leading-none text-[#1b2030]">
              Все категории
            </h2>
            <div className="flex items-center gap-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearchQuery(searchInput.trim());
                }}
                className="relative"
              >
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Поиск категорий"
                  className="h-10 w-[240px] rounded-[14px] border border-[#d9ddea] bg-white pl-4 pr-10 text-[14px] text-[#25293a] outline-none transition-colors placeholder:text-[#8e90a0] focus:border-[#55CB00]"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e90a0] transition-colors hover:text-[#25293a]"
                  aria-label="Искать категории"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={activeTab === "archived" ? toggleArchivedAll : toggleAll}
            className="flex items-center gap-[18px] text-sm font-medium transition-colors"
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                (activeTab === "archived" ? isArchivedAllSelected : isAllSelected)
                  ? "border-[#55CB00] bg-[#55CB00]/10"
                  : "border-[#b8bdcc] bg-white"
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  (activeTab === "archived" ? isArchivedAllSelected : isAllSelected) ? "bg-[#55CB00]" : "bg-transparent"
                )}
              />
            </span>
            {activeTab === "archived"
              ? isArchivedAllSelected
                ? `Выбрано: ${archivedSelectedKeys.length}`
                : "Выбрать все"
              : isAllSelected
                ? `Выбрано: ${selectedIds.length}`
                : "Выбрать все"}
          </button>

          <SelectionButtons
            selectedCount={
              activeTab === "archived"
                ? archivedSelectedKeys.length
                : selectedIds.length
            }
            onExport={activeTab === "archived" ? undefined : handleExport}
            activeTab={activeTab}
            onArchive={
              activeTab === "archived"
                ? handleUnarchiveProducts
                : async () => {}
            }
            onEditMenu={() => {}}
            modal="allCategories"
          />
        </div>

        {activeTab === "archived" ? (
          archivedFlattened.length > 0 ? (
            <ProductsList
              products={archivedFlattened}
              selectedUniqueKeys={archivedSelectedKeys}
              shopId={shopId}
              onUpdated={(product) =>
                setProductInlineOverrides((prev) => ({
                  ...prev,
                  [product.uniqueKey]: product,
                }))
              }
              onToggle={toggleArchivedProduct}
              onClick={() => {}}
              onCopyBarcode={(text, e) => {
                e.stopPropagation();
                if (!text) return;
                navigator.clipboard.writeText(text);
                toast.success("Штрихкод скопирован");
              }}
            />
          ) : (
            <div className="py-20 text-center text-gray-400">Архив пуст</div>
          )
        ) : filteredCategories.length > 0 ? (
          viewMode === "grid" ? (
            <CategoryGridView
              categories={filteredCategories}
              selectedIds={selectedIds}
              onToggle={toggleCategory}
              onClick={handleCardClick}
            />
          ) : (
            <CategoryListView
              categories={filteredCategories}
              selectedIds={selectedIds}
              onToggle={toggleCategory}
              onClick={handleCardClick}
            />
          )
        ) : (
          <div className="py-20 text-center text-gray-400">
            Нет активных категорий
          </div>
        )}
      </div>
    </MainSection>
  );
}

// Экспорт по умолчанию с Suspense boundary
export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-400">
          Загрузка интерфейса...
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
