"use client";

import React, { useState, useEffect, useMemo } from "react";
import { List, LayoutGrid, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";
import { EditMenu } from "@/components/category/editMenu";
import { SearchFilter } from "@/components/category/search";
import Cookies from "js-cookie";
import { useProductData } from "./components/products/hooks/useProductData";
import { useProductSelection } from "./components/products/hooks/useProductSelection";
import { useSubCategoryExpansion } from "./components/products/hooks/useSubCategoryExpansion";
import { SubCategorySection } from "./components/products/SubCategorySection";

export default function SubCategoryPage() {
  const router = useRouter();
  const { categoryId } = useParams();
  const searchParams = useSearchParams();
  const categoryName = searchParams.get("name");
  const shopId = Cookies.get("user_shop_id");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const { subCategories, loading } = useProductData({
    categoryId: categoryId as string,
    searchQuery,
  });

  const {
    selectedUniqueKeys,
    isAllSelected,
    selectedProducts,
    toggleProduct,
    toggleSubCategoryProducts,
    toggleAll,
  } = useProductSelection({ subCategories });

  const { openSubCategoryIds, toggleSubCategory } = useSubCategoryExpansion({
    subCategories,
    searchQuery,
  });

  const copyToClipboard = (
    text: string | null | undefined,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (text) navigator.clipboard.writeText(text);
  };

  const handleProductClick = (shopId: number, shopProductId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("shopId", shopId.toString());
    router.push(
      `${window.location.pathname}/subCategory/*/product/${shopProductId}?${params.toString()}`
    );
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Загрузка...
      </div>
    );

  return (
    <div>
      <CategoryHeader />
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
                placeholder="Поиск"
                className="w-full max-w-[260px] ml-2"
              />
            </div>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium",
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
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium",
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
            onArchive={() => {}}
          />
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-medium mb-10"
          >
            <CheckCircle2
              className={cn(
                "w-5 h-5",
                isAllSelected ? "text-[#55CB00]" : "text-gray-300"
              )}
            />
            {isAllSelected
              ? `Выбрано: ${selectedUniqueKeys.length}`
              : "Выбрать все товары"}
          </button>

          {subCategories.map((sub) => {
            const isOpen = openSubCategoryIds.includes(sub.id);
            const subKeys = sub.products.map((p) => p.uniqueKey);
            const isPartially = subKeys.some((k) =>
              selectedUniqueKeys.includes(k)
            );
            const isFully =
              subKeys.length > 0 &&
              subKeys.every((k) => selectedUniqueKeys.includes(k));

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
          })}
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
