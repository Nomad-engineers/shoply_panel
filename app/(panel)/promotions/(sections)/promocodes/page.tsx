"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus } from "lucide-react";
import Cookies from "js-cookie";

import { Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { usePromocodes } from "@/components/hooks/usePromocodes";
import { useShops } from "@/components/hooks/useShops";
import type { Promocode } from "@/types/promocode";
import { useAuth } from "@/components/hooks/useLogin";
import { getImageUrl } from "@/lib/utils";
import { PromocodeIcon } from "@/components/icons/PromocodeIcon";
import {
  MarketingFilterIcon,
  MarketingSearchIcon,
  MarketingEmptyTicketIcon,
} from "@/components/icons/marketing-icons";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { ShopsFilterDropdown } from "@/components/promotions/shops-filter-dropdown";
import { CreatePromocodeSheet } from "@/components/promotions/create-promocode-sheet";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const formatDate = (iso: string | null) => {
  if (!iso) return "Бессрочный";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Бессрочный";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy} г.`;
};

const getConditionsLabel = (p: Promocode) => {
  if (p.usageLimit === null) return "∞";
  return `${(p.usageLimit ?? 0).toLocaleString("ru-RU")} шт`;
};

const getContentLabel = (p: Promocode) => {
  if (p.type === "percent") return `-${p.valueForType}%`;
  return `${p.valueForType} ₽`;
};

export default function PromocodesPage() {
  const { adminData, loading: authLoading } = useAuth();
  const isAdmin = adminData?.isAdmin ?? false;
  const derivedShopId = useMemo(() => {
    const cookieShopId = Number(Cookies.get("current_shop_id"));
    return adminData?.shopId ?? (Number.isNaN(cookieShopId) ? undefined : cookieShopId);
  }, [adminData?.shopId]);

  const shopIdForFilter = useMemo(() => {
    if (!derivedShopId) return undefined;
    const n = Number(derivedShopId);
    return Number.isNaN(n) ? undefined : n;
  }, [derivedShopId]);

  const [activeTab, setActiveTab] = useState<"promocodes" | "archive">(
    "promocodes"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editPromocode, setEditPromocode] = useState<Promocode | null>(null);
  const [appliedShopIds, setAppliedShopIds] = useState<number[]>([]);
  const [draftShopIds, setDraftShopIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Filter States
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { shops: allShops, loading: shopsLoading } = useShops({
    isAdmin,
    dateFrom: today,
    dateTo: tomorrow,
    skip: authLoading || !isAdmin,
  });

  const promocodeParams = useMemo(
    () => ({
      page,
      pageSize,
      shopId: isAdmin ? undefined : shopIdForFilter,
      shopIds: isAdmin ? appliedShopIds : undefined,
      skip: authLoading || (!shopIdForFilter && !isAdmin),
      filter: { search },
      isAdmin,
    }),
    [
      page,
      pageSize,
      appliedShopIds,
      shopIdForFilter,
      authLoading,
      isAdmin,
      search,
    ]
  );

  const { data, loading, error, refetch } = usePromocodes(promocodeParams);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, appliedShopIds]);

  const promocodes = useMemo(() => {
    let list = data?.data ?? [];

    // Filter by tab
    const now = new Date();
    if (activeTab === "promocodes") {
      list = list.filter((p) => !p.validUntil || new Date(p.validUntil) > now);
    } else {
      list = list.filter((p) => p.validUntil && new Date(p.validUntil) <= now);
    }

    // Client-side Shop filter (additional safety/UI consistency)
    if (appliedShopIds.length > 0) {
      list = list.filter((p) => p.shop?.id && appliedShopIds.includes(p.shop.id));
    }

    return list.sort((a, b) => b.id - a.id);
  }, [data?.data, appliedShopIds, activeTab]);

  const totalActivations = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.activationCount ?? 0), 0);
  }, [promocodes]);

  const totalTurnover = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.turnover ?? 0), 0);
  }, [promocodes]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 lg:gap-4 lg:px-6 lg:py-4">
        <div className="flex flex-1 flex-wrap items-center gap-4 lg:gap-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 pr-2">
            <button
              onClick={() => setActiveTab("promocodes")}
              className={cn(
                "text-[18px] font-semibold leading-[18px] text-text-primary transition-all py-1.5",
                activeTab === "promocodes"
                  ? "relative after:absolute after:inset-x-0 after:-bottom-[4px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                  : ""
              )}
            >
              Активные
            </button>
            <button
              onClick={() => setActiveTab("archive")}
              className={cn(
                "text-[18px] font-semibold leading-[18px] text-text-primary transition-all py-1.5",
                activeTab === "archive"
                  ? "relative after:absolute after:inset-x-0 after:-bottom-[4px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                  : ""
              )}
            >
              Архив
            </button>
          </div>

          {/* Separator */}
          <div className="hidden h-8 w-px bg-[#DCDCE6]/60 lg:block" />

          {/* Search */}
          <label className="relative block w-full min-w-[140px] flex-1 sm:max-w-[225px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск"
              className="h-[26px] w-full border-0 border-b border-[#09091D40] bg-transparent py-[4px] pl-0 pr-[22px] text-[14px] font-normal leading-[18px] text-[#0E0F27] outline-none transition-colors placeholder:text-[#8e90a0]"
            />
            <MarketingSearchIcon className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#09091D]" />
          </label>

          {/* Filter toggle */}
          {isAdmin && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!isFilterOpen) setDraftShopIds(appliedShopIds);
                  setIsFilterOpen(!isFilterOpen);
                }}
                title="Фильтр"
                className={cn(
                  "inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] border px-[12px] py-[4px] transition-colors",
                  appliedShopIds.length > 0
                    ? "border-transparent bg-[#55CB00] text-white"
                    : draftShopIds.length > 0
                      ? "border-[#55CB00] bg-[#F6F6FA] text-[#09091D]"
                      : "border-transparent bg-[#F6F6FA] text-[#09091D] hover:bg-[#eeeef3]"
                )}
              >
                <MarketingFilterIcon />
              </button>

              {isFilterOpen && (
                <ShopsFilterDropdown
                  shops={allShops}
                  loading={shopsLoading}
                  appliedShopIds={appliedShopIds}
                  selectedShopIds={draftShopIds}
                  onToggle={(id) =>
                    setDraftShopIds((prev) =>
                      prev.includes(id)
                        ? prev.filter((v) => v !== id)
                        : [...prev, id]
                    )
                  }
                  onApply={() => {
                    setAppliedShopIds(draftShopIds);
                    setIsFilterOpen(false);
                  }}
                  onReset={() => {
                    setDraftShopIds([]);
                    setAppliedShopIds([]);
                    setIsFilterOpen(false);
                  }}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Create button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateSheetOpen(true)}
            title="Создать промокод"
            className="inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] bg-[#55CB00] px-[12px] py-[4px] text-white transition-colors hover:bg-[#4db800]"
          >
            <Plus className="h-[14px] w-[14px]" strokeWidth={3} />
          </button>
        </div>
      </div>

      <CreatePromocodeSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <CreatePromocodeSheet
        open={editPromocode !== null}
        promocode={editPromocode}
        onClose={() => setEditPromocode(null)}
      />

      {/* Content area */}
      {activeTab === "archive" && promocodes.length === 0 && !loading && (
        <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-text-secondary">
          Архив пуст
        </div>
      )}

      {(activeTab === "promocodes" || promocodes.length > 0) && (
        <>
          {loading && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
              <Spinner size={32} />
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-[#E26D5C]">
              Ошибка: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div
                className={cn(
                  "hidden overflow-x-auto px-3 lg:block",
                  promocodes.length === 0 ? "flex-none" : "flex-1"
                )}
              >
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[9%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[17%]" />
                    <col className="w-[10%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[8%]" />
                    <col className="w-[4%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="text-left text-[14px] text-text-secondary">
                      <th className="border-b border-border px-3 py-5 font-medium">
                        ID
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium whitespace-nowrap">
                        Дата
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        <div className="inline-flex items-center gap-1">
                          Название
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        Комментарий
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        <div className="inline-flex items-center gap-1">
                          Выпуск
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        Оборот
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        Условия
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium truncate">
                        Содержание
                      </th>
                      <th className="border-b border-border px-3 py-5 font-medium">
                        Активация
                      </th>
                      <th className="border-b border-border px-3 py-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {promocodes.map((p) => {
                      const turnover = p.turnover ?? 0;
                      const activation = p.activationCount ?? 0;

                      return (
                        <tr
                          key={p.id}
                          className="group transition-colors cursor-pointer hover:bg-gray-50/50"
                          onClick={() => setEditPromocode(p)}
                        >
                          <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary">
                            {p.id}
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary whitespace-nowrap">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top">
                            <div className="flex items-center gap-2">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(p.name);
                                  toast.success("Промокод скопирован");
                                }}
                                className="cursor-pointer hover:opacity-70 transition-opacity"
                              >
                                <PromocodeIcon className="w-5 h-5 flex-shrink-0 text-[#478EFF]" />
                              </div>
                              <span className="min-w-0 truncate text-[16px] font-bold text-[#478EFF] hover:underline decoration-2 underline-offset-4">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top">
                            <p className="max-w-[150px] text-[14px] leading-relaxed text-text-secondary">
                              {p.technicalName || "-"}
                            </p>
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top">
                            {(() => {
                              const shop = p.shop;
                              const name = shop?.name || "SHOPLY";
                              const photoUrl = shop?.photoId ? getImageUrl({ id: shop.photoId }) : null;

                              return (
                                <div className="flex items-center gap-2">
                                  {photoUrl ? (
                                    <Image
                                      src={photoUrl}
                                      alt={name}
                                      width={24}
                                      height={24}
                                      className="rounded-full object-cover border border-[#ececf1]"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-[#55CB00]/10 flex items-center justify-center text-[#55CB00] text-[11px] font-bold border border-[#55CB00]/20">
                                      {name === "SHOPLY"
                                        ? "S"
                                        : name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="min-w-0 truncate text-[16px] text-text-primary font-medium">
                                    {name}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary">
                            {formatCurrency(turnover)}
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary whitespace-nowrap">
                            {getConditionsLabel(p)}
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-primary font-medium whitespace-nowrap">
                            {getContentLabel(p)}
                          </td>
                          <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-primary font-medium">
                            {activation}
                          </td>
                          <td className="border-b border-border px-3 py-5 text-right align-top">
                            <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-2 lg:hidden">
                {promocodes.map((p) => {
                  const shop = p.shop;
                  const shopName = shop?.name || "SHOPLY";
                  const photoUrl = shop?.photoId
                    ? getImageUrl({ id: shop.photoId })
                    : null;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEditPromocode(p)}
                      className="w-full rounded-[16px] border border-[#ECECF3] bg-white p-4 text-left transition-colors hover:bg-[#FAFAFC]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] text-text-secondary">
                          {formatDate(p.createdAt)} · ID {p.id}
                        </span>
                        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-[#b9bbc6]" />
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <PromocodeIcon className="h-5 w-5 shrink-0 text-[#478EFF]" />
                        <span className="min-w-0 truncate text-[16px] font-bold text-[#478EFF]">
                          {p.name}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={shopName}
                            width={20}
                            height={20}
                            className="rounded-full object-cover border border-[#ececf1]"
                          />
                        ) : (
                          <div className="grid h-5 w-5 place-items-center rounded-full bg-[#55CB00]/10 text-[10px] font-bold text-[#55CB00]">
                            {shopName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="min-w-0 truncate text-[13px] text-text-primary">
                          {shopName}
                        </span>
                        <span className="ml-auto shrink-0 rounded-[8px] bg-[#F6F6FA] px-2 py-0.5 text-[13px] font-semibold text-text-primary">
                          {getContentLabel(p)}
                        </span>
                      </div>

                      {p.technicalName && (
                        <div className="mt-1 break-words pl-7 text-[12px] leading-[16px] text-text-secondary">
                          {p.technicalName}
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#ECECF3] pt-3 text-center">
                        <div>
                          <div className="text-[10px] text-text-secondary">
                            Оборот
                          </div>
                          <div className="text-[13px] font-medium text-text-primary">
                            {formatCurrency(p.turnover ?? 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-secondary">
                            Активация
                          </div>
                          <div className="text-[13px] font-medium text-text-primary">
                            {p.activationCount ?? 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-secondary">
                            Условия
                          </div>
                          <div className="text-[13px] font-medium text-text-primary">
                            {getConditionsLabel(p)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {promocodes.length > 0 && (
                <div className="hidden shrink-0 grid-cols-[4%_9%_15%_15%_17%_10%_9%_9%_8%_4%] border-t border-border px-3 py-5 text-[14px] font-normal leading-[18px] text-[var(--sf-gray-100,#AAAAB8)] lg:grid">
                  <div />
                  <div />
                  <div className="px-3">
                    {promocodes.length} промокодов
                  </div>
                  <div />
                  <div />
                  <div className="whitespace-nowrap px-3">
                    {formatCurrency(totalTurnover)}
                  </div>
                  <div />
                  <div />
                  <div className="whitespace-nowrap px-3">
                    {totalActivations}
                  </div>
                  <div />
                </div>
              )}

              {promocodes.length === 0 && (
                <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
                  <MarketingEmptyTicketIcon className="h-[36px] w-[36px] text-[#09091D]" />
                  <div className="text-[14px] text-[#8e90a0]">
                    Еще пока нет созданных промокодов
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
