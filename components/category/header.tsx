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
  archiveCount?: number;
  onImport?: () => void;
}

export const CategoryHeader = ({
  archiveCount = 0,
  onImport,
}: CategoryHeaderProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "archive">("all");
  const userRole = Cookies.get("user_role");
  const params = useMemo(() => {
    let searchParams = {};

    if (userRole === ROLES.SHOP_OWNER) {
      const shopId = Cookies.get("user_shop_id");

      searchParams = {
        search: JSON.stringify({
          shopProduct: { shop: { id: shopId } },
        }),
      };
    }

    return searchParams;
  }, [userRole]);
  const { data: products = [] } = useApiData<Product>("products", {
    relations: ["shopProduct", "shopProduct.shop"],
    searchParams: params,
  });

  const totalAllProducts = useMemo(() => {
    if (userRole === ROLES.ADMIN) {
      return products.reduce((acc, product) => {
        return acc + (product.shopProduct?.length || 0);
      }, 0);
    }

    const shopId = Cookies.get("user_shop_id");

    return products.filter((product) =>
      product.shopProduct?.some((sp) => String(sp.shop?.id) === String(shopId))
    ).length;
  }, [products, userRole]);

  return (
    <div className="flex flex-col gap-8 w-full mb-10 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <h1 className="text-[32px] font-bold text-[#111111]">Товары</h1>

          {/* Табы */}
          <div className="flex gap-8  border-transparent">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                " text-lg font-medium transition-all relative",
                activeTab === "all"
                  ? "text-[#55CB00] border-b-2 border-[#55CB00]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Товары
              <span
                className={cn(
                  "ml-2 text-xs px-2 py-0.5 rounded-full",
                  activeTab === "all"
                    ? "bg-[#55CB00]/10 text-[#55CB00]"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {totalAllProducts}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("archive")}
              className={cn(
                " text-lg font-medium transition-all relative",
                activeTab === "archive"
                  ? "text-[#55CB00] border-b-2 border-[#55CB00]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Архив
              <span
                className={cn(
                  "ml-2 text-xs px-2 py-0.5 rounded-full",
                  activeTab === "archive"
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