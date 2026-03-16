"use client";

import React, { useState, useMemo, useEffect } from "react";
import { List, LayoutGrid, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";
import { EditMenu } from "@/components/category/editMenu";
import { SearchFilter } from "@/components/category/search";
import Cookies from "js-cookie";
import { useProductData } from "./components/products/hooks/useProductData";
import { useProductSelection } from "./components/products/hooks/useProductSelection";
import { useSubCategoryExpansion } from "./components/products/hooks/useSubCategoryExpansion";
import { SubCategorySection } from "./components/products/SubCategorySection";
import { useApiMutation } from "@/components/hooks/useApiMutation";

export default function SubCategoryPage() {
  const router = useRouter();
  const { categoryId } = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const categoryName = searchParams.get("name");
  const shopId = Cookies.get("current_shop_id");

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const { mutate } = useApiMutation();

  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const { subCategories, loading, refetch } = useProductData({
    categoryId: categoryId as string,
    searchQuery,
    tab: activeTab,
  });

  const setActiveTab = (tab: "active" | "archived") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredSubCategories = useMemo(() => {
    return subCategories
      .map((sub) => {
        const filteredProducts =
          sub.products?.filter((p: any) => {
            const isArchived = !!p.activeShopProduct?.archivedAt;
            return activeTab === "archived" ? isArchived : !isArchived;
          }) || [];

        return {
          ...sub,
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
  }, [subCategories, activeTab]);

  const {
    selectedUniqueKeys,
    isAllSelected,
    selectedProducts,
    toggleProduct,
    toggleSubCategoryProducts,
    toggleAll,
  } = useProductSelection({ subCategories: filteredSubCategories });

  const { openSubCategoryIds, toggleSubCategory } = useSubCategoryExpansion({
    subCategories: filteredSubCategories,
    searchQuery,
  });

  useEffect(() => {
    if (selectedUniqueKeys.length > 0) {
      toggleAll();
    }
  }, [activeTab]);

  const copyToClipboard = (
    text: string | null | undefined,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (text) navigator.clipboard.writeText(text);
  };

  const handleProductClick = (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (shopId) {
      params.set("shopId", shopId);
    } else {
      params.delete("shopId");
    }
    router.push(
      `${pathname}/subCategory/${subId}/product/${shopProductId}?${params.toString()}`
    );
  };

  const handleArchiveSelected = async () => {
    if (selectedUniqueKeys.length === 0) return;

    const subCategoryIdsToArchive: number[] = [];
    const individualProductKeysToArchive: string[] = [];

    filteredSubCategories.forEach((sub) => {
      const allKeys = sub.products?.map((p: any) => p.uniqueKey) || [];
      const selectedInSub = allKeys.filter((key) =>
        selectedUniqueKeys.includes(key)
      );

      if (allKeys.length > 0 && allKeys.length === selectedInSub.length) {
        subCategoryIdsToArchive.push(sub.id);
      } else {
        individualProductKeysToArchive.push(...selectedInSub);
      }
    });

    try {
      const promises = [
        ...subCategoryIdsToArchive.map((id) =>
          mutate(`subCategory/archive/${id}`, { method: "PATCH" })
        ),
        ...individualProductKeysToArchive.map((id) =>
          mutate(`shop/shopProduct/${id}/archive`, { method: "POST" })
        ),
      ];

      await Promise.all(promises);
      if (refetch) await refetch();
      alert("Архивация успешно выполнена");
    } catch (e: any) {
      alert("Ошибка при архивации: " + e.message);
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedUniqueKeys.length === 0) return;

    const subCategoryIdsToUnarchive: number[] = [];
    const individualProductKeysToUnarchive: string[] = [];

    filteredSubCategories.forEach((sub) => {
      const allKeys = sub.products?.map((p: any) => p.uniqueKey) || [];
      const selectedInSub = allKeys.filter((key) =>
        selectedUniqueKeys.includes(key)
      );

      if (allKeys.length > 0 && allKeys.length === selectedInSub.length) {
        subCategoryIdsToUnarchive.push(sub.id);
      } else {
        individualProductKeysToUnarchive.push(...selectedInSub);
      }
    });

    try {
      const promises = [
        ...subCategoryIdsToUnarchive.map((id) =>
          mutate(`subCategory/unarchive/${id}`, { method: "PATCH" })
        ),
        ...individualProductKeysToUnarchive.map((id) =>
          mutate(`shop/shopProduct/${id}/unArchive`, { method: "PATCH" })
        ),
      ];

      await Promise.all(promises);
      if (refetch) await refetch();
      alert("Восстановление успешно выполнено");
    } catch (e: any) {
      alert("Ошибка при восстановлении: " + e.message);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Загрузка данных...
      </div>
    );

  return (
    <div>
      <CategoryHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="min-h-screen bg-white rounded-4xl">
        <div className="p-8 flex items-end flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-gray-50 rounded-lg shrink-0"
              >
                <ChevronRight className="rotate-180 w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[#1A1C1E] whitespace-nowrap">
                {categoryName}
              </h1>
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                variant="minimal"
                placeholder="Поиск по товарам"
                className="w-full max-w-[260px] ml-2"
              />
            </div>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                  viewMode === "list"
                    ? "bg-white shadow-sm text-primary-main"
                    : "text-gray-500"
                )}
              >
                <List className="w-4 h-4" /> Список
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-primary-main"
                    : "text-gray-500"
                )}
              >
                <LayoutGrid className="w-4 h-4" /> Карточки
              </button>
            </div>
          </div>
          <SelectionButtons
            selectedCount={selectedUniqueKeys.length}
            onEditMenu={() => setIsEditMenuOpen(true)}
            onExport={() => {}}
            activeTab={activeTab}
            modal="singleCategory"
            onArchive={
              activeTab === "active"
                ? handleArchiveSelected
                : handleUnarchiveSelected
            }
          />
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-medium mb-10 transition-colors hover:text-primary-main"
          >
            <CheckCircle2
              className={cn(
                "w-5 h-5 transition-colors",
                isAllSelected ? "text-[#55CB00]" : "text-gray-300"
              )}
            />
            {isAllSelected
              ? `Выбрано товаров: ${selectedUniqueKeys.length}`
              : "Выбрать все товары на странице"}
          </button>

          {filteredSubCategories.length > 0 ? (
            filteredSubCategories.map((sub) => {
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
                  shopId={shopId}
                  viewMode={viewMode}
                  isPartiallySelected={isPartially}
                  isFullySelected={isFully}
                  onToggleProducts={toggleSubCategoryProducts}
                  onToggleOpen={() => toggleSubCategory(sub.id)}
                  onProductToggle={toggleProduct}
                  onProductClick={handleProductClick}
                  onCopyArticle={copyToClipboard}
                />
              );
            })
          ) : (
            <div className="py-20 text-center text-gray-400">
              {activeTab === "active"
                ? "Нет активных подкатегорий"
                : "Архив пуст"}
            </div>
          )}
        </div>
      </div>
      <EditMenu
        isOpen={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        selectedCount={selectedUniqueKeys.length}
        selectedProducts={selectedProducts}
        shopId={shopId}
      />
    </div>
  );
}