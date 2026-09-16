import React from "react";
import { ChevronDown, Info } from "lucide-react";
import { Shop, ShopStats } from "@/types/shop";

interface ShopConfigSidebarProps {
  isAdmin: boolean;
  adminData: any;
  selectedShopId: string;
  shopsStats: ShopStats[];
  onShopChange: (shopId: string) => void;
}

export function ShopConfigSidebar({
  isAdmin,
  adminData,
  selectedShopId,
  shopsStats,
  onShopChange,
}: ShopConfigSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-widest">
          <Info className="w-4 h-4 text-primary-main" />
          Конфигурация
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
              Магазин назначения
            </label>
            {isAdmin ? (
              <div className="relative">
                <select
                  value={selectedShopId}
                  onChange={(e) => onShopChange(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-primary-main outline-none"
                >
                  <option value="">Выберите магазин...</option>
                  {shopsStats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            ) : (
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="text-sm font-bold text-gray-900">
                  {adminData?.shop?.name || "Мой магазин"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
