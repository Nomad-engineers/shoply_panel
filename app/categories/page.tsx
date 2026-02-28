"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";
import { useApiData } from "@/components/hooks/useApiData";
import { useRouter } from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import { useCategorySelection } from "./components/category/hooks/useCategorySelection";
import { ViewModeToggle } from "./components/category/ViewModeToggle";
import { CategoryGridView } from "./components/category/CategoryGridView";
import { CategoryListView } from "./components/category/CategoryListView";

export default function CategoryPage() {
  const router = useRouter();
  const userRole = Cookies.get("user_role");
  const params = useMemo(() => {
    let searchParams = {};

    if (userRole === ROLES.SHOP_OWNER) {
      const shopId = Cookies.get("user_shop_id");
      searchParams = {
        search: JSON.stringify({ "shop.id": shopId }),
      };
    }

    return searchParams;
  }, [userRole]);
  const { data: categories, loading } = useApiData<Category>("category", {
    relations: ["photo", "subCategory"],
    searchParams: params,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const { selectedIds, isAllSelected, toggleCategory, toggleAll } =
    useCategorySelection({ categories });

  const handleCardClick = (id: number, name: string) => {
    router.push(`/categories/${id}?name=${encodeURIComponent(name)}`);
  };

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse text-gray-400">
        Загрузка каталога...
      </div>
    );
  }

  return (
    <div>
      <CategoryHeader />
      <div className="p-8 rounded-4xl bg-white min-h-screen">
        <div className="flex flex-col items-end mb-8 gap-4">
          <div className="flex md:items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Все категории
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Доступно разделов: {categories.length}
              </p>
            </div>

            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <SelectionButtons
            selectedCount={selectedIds.length}
            onEditMenu={() => setIsEditMenuOpen(true)}
            onExport={() => console.log("Exporting...")}
            onArchive={() => console.log("Archiving...")}
          />
        </div>

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <CheckCircle2
              className={cn(
                "w-5 h-5",
                isAllSelected ? "text-[#55CB00]" : "text-gray-300"
              )}
            />
            {isAllSelected ? `Выбрано: ${selectedIds.length}` : "Выбрать все"}
          </button>
        </div>

        {viewMode === "grid" ? (
          <CategoryGridView
            categories={categories}
            selectedIds={selectedIds}
            onToggle={toggleCategory}
            onClick={handleCardClick}
          />
        ) : (
          <CategoryListView
            categories={categories}
            selectedIds={selectedIds}
            onToggle={toggleCategory}
            onClick={handleCardClick}
          />
        )}
      </div>
    </div>
  );
}
