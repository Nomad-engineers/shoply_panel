"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Search } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { getImageUrl } from "@/lib/utils";
import type { Shop } from "@/types/shop";

interface ShopsFilterDropdownProps {
  shops: Shop[];
  loading: boolean;
  appliedShopIds: number[];
  selectedShopIds: number[];
  onToggle: (id: number) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const ShopsFilterDropdown = ({
  shops,
  loading,
  appliedShopIds,
  selectedShopIds,
  onToggle,
  onApply,
  onReset,
  onClose,
}: ShopsFilterDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredShops = useMemo(() => {
    if (!searchQuery) return shops;
    const lowerQuery = searchQuery.toLowerCase();
    return shops.filter((s) => s.name.toLowerCase().includes(lowerQuery));
  }, [shops, searchQuery]);

  const sameAsApplied =
    selectedShopIds.length === appliedShopIds.length &&
    [...selectedShopIds].sort((a, b) => a - b).join(",") ===
      [...appliedShopIds].sort((a, b) => a - b).join(",");

  const showApply = selectedShopIds.length > 0 && !sameAsApplied;
  const showFooter = selectedShopIds.length > 0 || appliedShopIds.length > 0;

  return (
    <div
      ref={rootRef}
      className="absolute top-full left-0 z-30 mt-2 flex w-[340px] flex-col rounded-[20px] border border-border bg-white p-[8px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] animate-in fade-in zoom-in-95 duration-150 origin-top"
    >
      <label className="relative block pt-[4px] pb-[8px]">
        <input
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поле ввода"
          className="h-[48px] w-full rounded-[12px] border-0 bg-[#EEEEF480] px-[12px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none placeholder:text-[#0E0F2780]"
        />
      </label>

      <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="px-3 py-6 text-center">
            <Spinner size={20} />
          </div>
        ) : (
          filteredShops.map((shop, index) => {
            const isSelected = selectedShopIds.includes(shop.id);
            const photoUrl = shop.photo?.id
              ? getImageUrl({ id: shop.photo.id })
              : null;

            return (
              <button
                key={shop.id}
                type="button"
                onClick={() => onToggle(shop.id)}
                className={cn(
                  "flex h-[48px] w-full items-center gap-[12px] px-[12px] text-left transition-colors hover:bg-[#FAFAFC]",
                  index !== 0 && "border-t border-[#F0F0F4]"
                )}
              >
                <span
                  className={cn(
                    "grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border transition-colors",
                    isSelected
                      ? "border-[#55CB00] bg-[#55CB00] text-white"
                      : "border-[#09091D40] bg-white"
                  )}
                >
                  {isSelected && <Check className="h-[12px] w-[12px]" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#0E0F27]">
                  {shop.name}
                </span>
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={shop.name}
                    width={20}
                    height={20}
                    className="h-[20px] w-[20px] rounded-full object-cover"
                  />
                ) : null}
                <span className="text-[14px] text-[#8e90a0]">{shop.id}</span>
              </button>
            );
          })
        )}
        {!loading && filteredShops.length === 0 && (
          <div className="px-3 py-6 text-center text-[13px] text-[#b7b8c5]">
            Магазины не найдены
          </div>
        )}
      </div>

      {showFooter && (
        <div className="flex items-center gap-[8px] px-[4px] pb-[4px] pt-[8px]">
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "inline-flex h-[40px] items-center justify-center gap-[8px] rounded-[14px] bg-[#F6F6FA] text-[14px] font-semibold text-[#0E0F27] transition-colors hover:bg-[#eeeef3]",
              showApply ? "flex-1" : "w-full"
            )}
          >
            <RotateCcw className="h-[14px] w-[14px]" />
            Сбросить
          </button>
          {showApply && (
            <button
              type="button"
              onClick={onApply}
              className="inline-flex h-[40px] flex-1 items-center justify-center gap-[8px] rounded-[14px] bg-[#55CB00] text-[14px] font-semibold text-white transition-colors hover:bg-[#4db800]"
            >
              <Check className="h-[14px] w-[14px]" />
              Применить
            </button>
          )}
        </div>
      )}
    </div>
  );
};
