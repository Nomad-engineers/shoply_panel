"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SelectListModal } from "@/components/promotions/select-list-modal";
import { useAuth } from "@/components/hooks/useLogin";
import { useShops } from "@/components/hooks/useShops";
import { MarketingCopyIcon } from "@/components/icons/marketing-icons";
import type { Shop } from "@/types/shop";

export interface SelectedShopOption {
  id: number;
  name: string;
}

interface SelectShopsModalProps {
  open: boolean;
  selected: SelectedShopOption[];
  onConfirm: (shops: SelectedShopOption[]) => void;
  onClose: () => void;
  single?: boolean;
}

export const SelectShopsModal = ({
  open,
  selected,
  onConfirm,
  onClose,
  single,
}: SelectShopsModalProps) => {
  const { adminData, loading: authLoading } = useAuth();
  const isAdmin = adminData?.isAdmin ?? false;

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { shops, loading, error } = useShops({
    isAdmin,
    dateFrom: today,
    dateTo: tomorrow,
    skip: authLoading || !open || !adminData,
  });

  const [shopSearch, setShopSearch] = useState("");
  const [selectedShops, setSelectedShops] = useState<
    Map<number, SelectedShopOption>
  >(new Map());

  useEffect(() => {
    if (open) {
      setSelectedShops(new Map(selected.map((shop) => [shop.id, shop])));
    }
  }, [open]);

  const filteredShops = useMemo(() => {
    const query = shopSearch.trim().toLowerCase();
    if (!query) return shops;
    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
        String(shop.id).includes(query)
    );
  }, [shops, shopSearch]);

  const toggleShop = (shop: Shop) => {
    setSelectedShops((prev) => {
      if (single) {
        if (prev.size === 1 && prev.has(shop.id)) return new Map();
        return new Map([[shop.id, { id: shop.id, name: shop.name }]]);
      }
      const next = new Map(prev);
      if (next.has(shop.id)) {
        next.delete(shop.id);
      } else {
        next.set(shop.id, { id: shop.id, name: shop.name });
      }
      return next;
    });
  };

  const copyShopId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    toast.success("ID скопирован");
  };

  return (
    <SelectListModal<Shop>
      open={open}
      title="Выберите магазины"
      closeLabel="Закрыть"
      searchLabel="Поиск магазина"
      searchPlaceholder="Название, ID"
      infoColumnLabel="Название магазина"
      metaColumnLabel="ID магазина"
      emptyText="Магазины не найдены"
      items={filteredShops}
      loading={loading}
      error={error}
      selectedIds={new Set(selectedShops.keys())}
      onSearchChange={setShopSearch}
      onToggle={toggleShop}
      renderTitle={(shop) => shop.name}
      renderMeta={(shop) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            copyShopId(shop.id);
          }}
          className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#478EFF] transition-opacity hover:opacity-70"
        >
          <MarketingCopyIcon className="h-[18px] w-[18px] shrink-0" />
          {shop.id}
        </div>
      )}
      onClose={onClose}
      onConfirm={() => onConfirm([...selectedShops.values()])}
      confirmActive={selectedShops.size > 0}
    />
  );
};
