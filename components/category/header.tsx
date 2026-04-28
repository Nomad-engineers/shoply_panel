import React, { useMemo, useState } from "react";
import { Plus, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "@/components/ui";
import { useApiData } from "../hooks/useApiData";
import Cookies from "js-cookie";
import Link from "next/link";

interface ShopProductCountResponse {
  available: number;
  notAvailable: number;
}

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
  const shopId = Cookies.get("current_shop_id");
  const archiveParams = useMemo(
    () => ({
      scope: "archive",
      pageSize: "1",
      page: "1",
    }),
    []
  );
  const inStockParams = useMemo(
    () => ({
      scope: "instock",
      pageSize: "1",
      page: "1",
    }),
    []
  );

  const { singleItem: productCounts, refetch: refetchCounts } =
    useApiData<ShopProductCountResponse>(
      shopId ? `v2/shop/${shopId}/product/count` : null
    );
  const { dataCount: archiveCount, refetch: refetchArchive } = useApiData(
    shopId ? `v2/shop/${shopId}/product/archive` : null,
    {
      searchParams: archiveParams,
    }
  );
  const { dataCount: unavailableCount, refetch: refetchUnavailable } =
    useApiData(shopId ? `v2/shop/${shopId}/product/archive` : null, {
      searchParams: inStockParams,
    });

  const productCount =
    Number(productCounts?.available || 0) + Number(unavailableCount || 0);

  React.useEffect(() => {
    refetchCounts();
    refetchArchive();
    refetchUnavailable();
  }, [activeTab, refetchArchive, refetchCounts, refetchUnavailable]);

  return (
    <div className="flex w-full items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <h1 className="text-[28px] font-bold leading-none text-[#111322]">
          Товары
        </h1>
        <div className="flex items-center gap-5">
          {[
            {
              key: "active" as const,
              label: "Товары",
              count: productCount,
            },
            {
              key: "archived" as const,
              label: "Архив",
              count: archiveCount,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab?.(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 text-[20px] font-semibold",
                  isActive ? "text-[#1f2333]" : "text-[#52576b]"
                )}
              >
                <span
                  className={cn(
                    "relative inline-flex items-center",
                    isActive &&
                      "after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                  )}
                >
                  {tab.label}
                </span>
                <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e5e6ee] px-1.5 text-[12px] font-semibold text-[#9a9dab]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/categories/excel">
          <Button
            variant="outline"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#d9ddea] bg-white px-4 text-[14px] font-medium text-[#3b4052] hover:bg-[#f7f7fa] hover:text-[#3b4052]"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#55CB00]" />
            Импорт товаров
          </Button>
        </Link>
        <Link href="/categories/addProduct">
          <Button className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#55CB00] px-4 text-[14px] font-semibold text-white hover:bg-[#4abb00]">
            Добавить товар
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
