import React, { useMemo, useState } from "react";
import { Plus, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "@/components/ui";
import { Category, Product } from "@/types/category.types";
import { useApiData } from "../hooks/useApiData";
import Cookies from "js-cookie";
import { ROLES } from "@/middleware";
import Link from "next/link";
interface CategoryHeaderProps {
  onImport?: () => void;
  activeTab: "active" | "archived";
  setActiveTab: (tab: "active" | "archived") => void;
}

export const CategoryHeader = ({
  onImport,
  activeTab,
  setActiveTab,
}: CategoryHeaderProps) => {
  const shopId = Cookies.get("user_shop_id");

  const activeParams = useMemo(() => {
    const filter = {
      shopProduct: {
        id: { isNull: false },
        shop: { id: Number(shopId) },
        archivedAt: { isNull: true },
      },
    };

    return {
      search: JSON.stringify(filter),
      pageSize: "1",
      page: "1",
    };
  }, [shopId]);

  const archiveParams = useMemo(() => {
    const filter = {
      shopProduct: {
        id: { isNull: false },
        shop: { id: Number(shopId) },
        archivedAt: { isNull: false },
      },
    };

    return {
      search: JSON.stringify(filter),
      pageSize: "1",
      page: "1",
    };
  }, [shopId]);

  const { dataCount: productCount, refetch: refetchActive } =
    useApiData<Product>("products", {
      searchParams: activeParams,
      relations: ["shopProduct"],
    });
  const { dataCount: archiveCount, refetch: refetchArchive } =
    useApiData<Product>("products", {
      searchParams: archiveParams,
      relations: ["shopProduct"],
    });

  React.useEffect(() => {
    refetchActive();
    refetchArchive();
  }, [activeTab, refetchActive, refetchArchive]);

  return (
    <div className="flex flex-col gap-8 w-full mb-10 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <h1 className="text-[32px] font-bold text-[#111111]">Товары</h1>

          {/* Табы */}
          <div className="flex gap-8  border-transparent">
            <button
              onClick={() => setActiveTab?.("active")}
              className={cn(
                " text-lg font-medium transition-all relative",
                activeTab === "active"
                  ? "text-[#55CB00] border-b-2 border-[#55CB00]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Товары
              <span
                className={cn(
                  "ml-2 text-xs px-2 py-0.5 rounded-full",
                  activeTab === "active"
                    ? "bg-[#55CB00]/10 text-[#55CB00]"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {productCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab?.("archived")}
              className={cn(
                " text-lg font-medium transition-all relative",
                activeTab === "archived"
                  ? "text-[#55CB00] border-b-2 border-[#55CB00]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Архив
              <span
                className={cn(
                  "ml-2 text-xs px-2 py-0.5 rounded-full",
                  activeTab === "archived"
                    ? "bg-[#55CB00]/10 text-[#55CB00]"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {archiveCount}
              </span>
            </button>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-3">
          <Link href="/categories/excel">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 h-11 px-4 text-sm font-bold flex gap-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-[#55CB00]" />
              Импорт товаров
            </Button>
          </Link>
          <Link href="/categories/addProduct">
            <Button className="bg-[#55CB00] hover:bg-[#48ad00] text-white rounded-xl h-11 px-6 text-sm font-bold flex gap-2 border-none">
              <Plus className="w-5 h-5" />
              Добавить товар
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};