import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Store, Check } from "lucide-react";
import { cn } from "@/lib/theme";
import { getImageUrl } from "@/lib/utils";
import { Shop } from "@/types/shop";

interface ShopSwitcherProps {
  currentShop: Shop | null;
  allShops: any[];
  activeShopId: number | null;
  onShopSelect: (id: number) => void;
  isCollapsed?: boolean;
}

export const ShopSwitcher = ({
  currentShop,
  allShops,
  activeShopId,
  onShopSelect,
  isCollapsed,
}: ShopSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* ТРИГГЕР: ЛОГО + ИНФО */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-2xl transition-all outline-none group",
          isOpen ? "bg-surface-light" : "hover:bg-surface-light"
        )}
      >
        {/* ЛОГОТИП */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full border border-gray-100 bg-white overflow-hidden flex items-center justify-center shadow-sm">
            {currentShop?.photo ? (
              <img
                src={getImageUrl(currentShop.photo, { width: 40, height: 40, fit: "cover" })}
                alt={currentShop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {/* Маленькая иконка-индикатор дропдауна поверх лого */}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-100 p-0.5 shadow-xs">
            <ChevronDown size={10} className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>

        {/* НАЗВАНИЕ (скрывается при коллапсе) */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-bold text-text-primary truncate leading-tight">
              {currentShop?.name || "Загрузка..."}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
              Сменить магазин
            </p>
          </div>
        )}
      </button>

      {/* ВЫПАДАЮЩИЙ СПИСОК */}
      {isOpen && (
        <div className={cn(
          "absolute left-0 w-64 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200",
          isCollapsed && "left-2" 
        )}>
          <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
            Ваши магазины
          </div>
          
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {allShops
            .filter((shopItem) => shopItem.id !== activeShopId)
            .map((shopItem) => {
              const isSelected = activeShopId === shopItem.id;
              return (
                <button
                  key={shopItem.id}
                  onClick={() => {
                    onShopSelect(shopItem.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-surface-light text-left group",
                    isSelected && "bg-primary-light/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-full border border-gray-50 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50">
                    {shopItem.photo ? (
                      <img
                        src={getImageUrl(shopItem.photo, { width: 32, height: 32, fit: "cover" })}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      isSelected ? "font-bold text-primary-main" : "text-gray-700 font-medium"
                    )}>
                      {shopItem.name}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary-main flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};