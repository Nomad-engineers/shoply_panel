"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
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
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { useViewMode } from "@/hooks/use-view-mode";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { getImageUrl } from "@/lib/utils";

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
  const { mutate } = useApiMutation();

  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const setActiveTab = (tab: "active" | "archived") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const shopId = currentShopId ? String(currentShopId) : undefined;

  const params = useMemo(() => {
    let searchParams = {};
    if (userRole === ROLES.SHOP_OWNER && shopId) {
      searchParams = { search: JSON.stringify({ "shop.id": shopId }) };
    }
    return searchParams;
  }, [shopId, userRole]);

  const {
    data: categories,
    loading,
    refetch,
  } = useApiData<Category>(
    activeTab === "archived" ? "category/archived" : null,
    {
      relations: ["photo", "subCategory"],
      searchParams: params,
    }
  );

  const { data: searchedCategories, loading: searchLoading } =
    useApiData<SearchCategoryResponse>(
      shopId ? `v2/shop/${shopId}/search/categories` : null,
      {
        searchParams: searchQuery ? { q: searchQuery } : {},
      },
    );

  const filteredArchivedCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((cat: any) => {
      if (activeTab === "archived") {
        return cat.hasArchive || cat.isArchived;
      }
      return cat.hasActive || !cat.isArchived;
    });
  }, [categories, activeTab]);

  const filteredCategories = useMemo(() => {
    if (activeTab === "archived" || !shopId) {
      return filteredArchivedCategories;
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
  }, [activeTab, filteredArchivedCategories, searchedCategories, shopId]);

  const { selectedIds, isAllSelected, toggleCategory, toggleAll } =
    useCategorySelection({ categories: filteredCategories });

  useEffect(() => {
    if (selectedIds.length > 0) {
      toggleAll();
    }
  }, [activeTab]);

  const handleArchiveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          mutate(`category/archive/${id}`, {
            method: "PATCH",
            body: { shopId },
          })
        )
      );
      await refetch();
      alert("Категории успешно перемещены в архив");
    } catch (e: any) {
      alert(
        e.message?.includes("400")
          ? "Нет товаров для архивации"
          : "Ошибка: " + e.message
      );
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          mutate(`category/unArchive/${id}`, {
            method: "PATCH",
            body: { shopId },
          })
        )
      );
      await refetch();
      alert("Категории успешно возвращены из архива");
    } catch (e: any) {
      alert(
        e.message?.includes("400")
          ? "Нет товаров для восстановления"
          : "Ошибка: " + e.message
      );
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      alert("Выберите хотя бы одну категорию для экспорта");
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
          alert("В выбранных категориях нет товаров для экспорта");
        } else {
          alert(`Ошибка сервера: ${response.status} ${response.statusText}`);
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
      alert("Ошибка при экспорте: " + e.message);
    }
  };

  const handleCardClick = (id: number, name: string) => {
    router.push(`/categories/${id}`);
  };

  const isPageLoading =
    activeTab === "archived" ? loading : shopId ? searchLoading : loading;

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
            onClick={toggleAll}
            className="flex items-center gap-[18px] text-sm font-medium transition-colors"
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
            {isAllSelected ? `Выбрано: ${selectedIds.length}` : "Выбрать все"}
          </button>
        </div>

        {filteredCategories.length > 0 ? (
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
            {activeTab === "active" ? "Нет активных категорий" : "Архив пуст"}
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
