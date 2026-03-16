"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";
import { useApiData } from "@/components/hooks/useApiData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import { useCategorySelection } from "./components/category/hooks/useCategorySelection";
import { ViewModeToggle } from "./components/category/ViewModeToggle";
import { CategoryGridView } from "./components/category/CategoryGridView";
import { CategoryListView } from "./components/category/CategoryListView";
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { parseJwt } from "@/lib/jwt";

function CategoryPageContent() {
  const router = useRouter();
  const token =
    (typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null) || "";
  const userRole = parseJwt(token)?.role;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const { mutate, isLoading: isArchiving } = useApiMutation();

  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const setActiveTab = (tab: "active" | "archived") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const params = useMemo(() => {
    let searchParams = {};
    if (userRole === ROLES.SHOP_OWNER) {
      const shopId = Cookies.get("current_shop_id");
      searchParams = { search: JSON.stringify({ "shop.id": shopId }) };
    }
    return searchParams;
  }, [userRole]);

  const {
    data: categories,
    loading,
    refetch,
  } = useApiData<Category>("category/archived", {
    relations: ["photo", "subCategory"],
    searchParams: params,
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((cat: any) => {
      if (activeTab === "archived") {
        return cat.hasArchive || cat.isArchived;
      }
      return cat.hasActive || !cat.isArchived;
    });
  }, [categories, activeTab]);

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
          mutate(`category/archive/${id}`, { method: "PATCH" })
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
          mutate(`category/unArchive/${id}`, { method: "PATCH" })
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
    router.push(
      `/categories/${id}?name=${encodeURIComponent(name)}&tab=${activeTab}`
    );
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
      <CategoryHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-8 rounded-4xl bg-white min-h-screen">
        <div className="flex flex-col items-end mb-8 gap-4">
          <div className="flex md:items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Все категории
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Доступно разделов: {filteredCategories.length}
              </p>
            </div>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          <SelectionButtons
            selectedCount={selectedIds.length}
            activeTab={activeTab}
            onEditMenu={() => setIsEditMenuOpen(true)}
            onExport={handleExport}
            modal="allCategories"
            onArchive={
              activeTab === "active"
                ? handleArchiveSelected
                : handleUnarchiveSelected
            }
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
    </div>
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