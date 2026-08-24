"use client";

import * as React from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { cn } from "@/lib/theme";
import { FilterButton } from "@/components/ui/filter-button";
import { OrderStatus } from "@/types/panel-orders.dto";

interface OrdersFilterPanelProps {
  /** Current filter values */
  filters: {
    status?: OrderStatus;
    regionId?: number;
    shopId?: number;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  };
  /** Available regions */
  regions?: { id: number; name: string }[];
  /** Available shops */
  shops?: { id: number; name: string }[];
  /** Callback when filters change - returns new query string */
  onFilterChange: (queryString: string) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether any non-pagination filters are active */
  hasActiveFilters?: boolean;
  /** User role for filter visibility */
  userRole?: string | null;
  /** Whether to show region filter */
  showRegionFilter?: boolean;
  /** Whether to show shop filter */
  showShopFilter?: boolean;
}

/**
 * Filter panel for orders page with dropdowns for region, shop, status, and date range
 */
export function OrdersFilterPanel({
  filters,
  regions = [],
  shops = [],
  onFilterChange,
  onClearFilters,
  hasActiveFilters = false,
  userRole = null,
  showRegionFilter = true,
  showShopFilter = true,
}: OrdersFilterPanelProps) {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [regionOpen, setRegionOpen] = React.useState(false);
  const [shopOpen, setShopOpen] = React.useState(false);

  // Status options
  const statusOptions = [
    { value: OrderStatus.PENDING, label: "Новые" },
    { value: OrderStatus.ASSEMBLING, label: "На сборке" },
    { value: OrderStatus.READY, label: "Готовы к выдаче" },
    { value: OrderStatus.DELIVERY, label: "На доставке" },
    { value: OrderStatus.COMPLETED, label: "Завершенные" },
    { value: OrderStatus.CANCELLED, label: "Отмененные" },
  ];

  // Get display labels
  const getStatusLabel = () => {
    if (!filters.status) return "Все статусы";
    return statusOptions.find((s) => s.value === filters.status)?.label ?? "Все статусы";
  };

  const getRegionLabel = () => {
    if (!filters.regionId) return "Все регионы";
    return regions.find((r) => r.id === filters.regionId)?.name ?? "Все регионы";
  };

  const getShopLabel = () => {
    if (!filters.shopId) return "Все магазины";
    return shops.find((s) => s.id === filters.shopId)?.name ?? "Все магазины";
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Filter */}
      <div className="relative">

        {statusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
            />
            <div className="absolute z-20 mt-2 flex w-[200px] flex-col rounded-lg border border-[#DCDCE6] bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onFilterChange(setFilterParam("status", undefined));
                  setStatusOpen(false);
                }}
                className={cn(
                  "rounded px-3 py-2 text-left text-sm transition-colors",
                  !filters.status ? "bg-[#04DCB4] text-white" : "text-[#0E0F27] hover:bg-gray-100"
                )}
              >
                Все статусы
              </button>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(setFilterParam("status", option.value));
                    setStatusOpen(false);
                  }}
                  className={cn(
                    "rounded px-3 py-2 text-left text-sm transition-colors",
                    filters.status === option.value
                      ? "bg-[#04DCB4] text-white"
                      : "text-[#0E0F27] hover:bg-gray-100"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Region Filter - only for admin role */}
      {showRegionFilter && regions.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setRegionOpen(!regionOpen)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              filters.regionId
                ? "border-[#04DCB4] bg-[rgba(4,220,180,0.1)] text-[#04DCB4]"
                : "border-[#FFFFFF80] bg-[#FFFFFF80] text-[#0E0F27] hover:bg-white/90"
            )}
          >
            <span>Регион:</span>
            <span className="text-[#0E0F2780]">{getRegionLabel()}</span>
            <ChevronDown className="h-4 w-4 text-[#0E0F27]" />
          </button>

          {regionOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRegionOpen(false)}
              />
              <div className="absolute z-20 mt-2 flex w-[200px] flex-col rounded-lg border border-[#DCDCE6] bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange(setFilterParam("regionId", undefined));
                    setRegionOpen(false);
                  }}
                  className={cn(
                    "rounded px-3 py-2 text-left text-sm transition-colors",
                    !filters.regionId ? "bg-[#04DCB4] text-white" : "text-[#0E0F27] hover:bg-gray-100"
                  )}
                >
                  Все регионы
                </button>
                {regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      onFilterChange(setFilterParam("regionId", region.id));
                      setRegionOpen(false);
                    }}
                    className={cn(
                      "rounded px-3 py-2 text-left text-sm transition-colors",
                      filters.regionId === region.id
                        ? "bg-[#04DCB4] text-white"
                        : "text-[#0E0F27] hover:bg-gray-100"
                    )}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Shop Filter - for admin and operator roles */}
      {showShopFilter && shops.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShopOpen(!shopOpen)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              filters.shopId
                ? "border-[#04DCB4] bg-[rgba(4,220,180,0.1)] text-[#04DCB4]"
                : "border-[#FFFFFF80] bg-[#FFFFFF80] text-[#0E0F27] hover:bg-white/90"
            )}
          >
            <span>Магазин:</span>
            <span className="text-[#0E0F2780]">{getShopLabel()}</span>
            <ChevronDown className="h-4 w-4 text-[#0E0F27]" />
          </button>

          {shopOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShopOpen(false)}
              />
              <div className="absolute z-20 mt-2 flex w-[200px] flex-col rounded-lg border border-[#DCDCE6] bg-white p-1 shadow-lg max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange(setFilterParam("shopId", undefined));
                    setShopOpen(false);
                  }}
                  className={cn(
                    "rounded px-3 py-2 text-left text-sm transition-colors",
                    !filters.shopId ? "bg-[#04DCB4] text-white" : "text-[#0E0F27] hover:bg-gray-100"
                  )}
                >
                  Все магазины
                </button>
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => {
                      onFilterChange(setFilterParam("shopId", shop.id));
                      setShopOpen(false);
                    }}
                    className={cn(
                      "rounded px-3 py-2 text-left text-sm transition-colors",
                      filters.shopId === shop.id
                        ? "bg-[#04DCB4] text-white"
                        : "text-[#0E0F27] hover:bg-gray-100"
                    )}
                  >
                    {shop.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions for URL param updates
function setFilterParam(key: string, value: any) {
  const params = new URLSearchParams(window.location.search);
  if (value === undefined || value === null || value === "") {
    params.delete(key);
  } else {
    params.set(key, String(value));
  }
  // Reset page when filters change
  params.delete("page");
  return params.toString();
}
