"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { DashboardLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { usePromocodes } from "@/components/hooks/usePromocodes";
import { useShops } from "@/components/hooks/useShops";
import type { Promocode } from "@/types/promocode";
import { useAuth } from "@/components/hooks/useLogin";
import { getImageUrl } from "@/lib/utils";
import { PromocodeIcon } from "@/components/icons/PromocodeIcon";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const formatDate = (iso: string | null) => {
  if (!iso) return "Бессрочный";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Бессрочный";
  return d.toLocaleDateString("ru-RU");
};

const getConditionsLabel = (p: Promocode) => {
  if (p.usageLimit === null) return "Бесконечный";
  return `${p.usageLimit} шт`;
};

const getContentLabel = (p: Promocode) => {
  if (p.type === "percent") return `-${p.valueForType}%`;
  return `${p.valueForType} ₽`;
};

export default function PromotionsPage() {
  const router = useRouter();
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
  const [filterActive, setFilterActive] = useState(false);
  const [selectedFilterShopId, setSelectedFilterShopId] = useState<
    number | null
  >(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [isFilterShopDropdownOpen, setIsFilterShopDropdownOpen] =
    useState(false);
  const filterShopDropdownRef = useRef<HTMLDivElement>(null);

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
    skip: authLoading
  });
  const filteredShops = useMemo(() => {
    if (!shopSearchQuery) return allShops || [];
    const lowerQuery = shopSearchQuery.toLowerCase();
    return (allShops || []).filter((s) =>
      s.name.toLowerCase().includes(lowerQuery)
    );
  }, [allShops, shopSearchQuery]);

  const promocodeParams = useMemo(
    () => ({
      page,
      pageSize,
      shopId: selectedFilterShopId || shopIdForFilter,
      skip: authLoading || (!shopIdForFilter && !isAdmin),
      filter: { search },
    }),
    [
      page,
      pageSize,
      selectedFilterShopId,
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
  }, [search, selectedFilterShopId]);

  const total = data?.meta?.total ?? 0;
  const pageCount = data?.meta?.pageCount ?? 1;
  // Close filter shop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterShopDropdownRef.current &&
        !filterShopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterShopDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (shopIdForFilter) {
      list = list.filter((p) => p.shop?.id === shopIdForFilter);
    }

    return list.sort((a, b) => b.id - a.id);
  }, [data?.data, shopIdForFilter, activeTab]);

  const totalActivations = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.activationCount ?? 0), 0);
  }, [promocodes]);

  const totalTurnover = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.turnover ?? 0), 0);
  }, [promocodes]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const header = (
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Промокоды
      </h1>
    </div>
  );

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 pr-2">
                <button
                  onClick={() => setActiveTab("promocodes")}
                  className={cn(
                    "text-[18px] font-semibold leading-none transition-all py-1.5",
                    activeTab === "promocodes"
                      ? "text-text-primary relative after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                      : "text-[#23263a]/60 hover:text-text-primary"
                  )}
                >
                  Промокоды
                </button>
                <button
                  onClick={() => setActiveTab("archive")}
                  className={cn(
                    "text-[18px] font-semibold leading-none transition-all py-1.5",
                    activeTab === "archive"
                      ? "text-text-primary relative after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                      : "text-[#23263a]/60 hover:text-text-primary"
                  )}
                >
                  Архив
                </button>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-[#DCDCE6]/60" />

              {/* Filter toggle */}
              {isAdmin && (
                <button
                  onClick={() => setFilterActive(!filterActive)}
                  className={cn(
                    "inline-flex items-center gap-2 text-[15px] font-medium transition-colors",
                    filterActive ? "text-[#55CB00]" : "text-text-primary"
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6H21M7 12H17M10 18H14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Фильтр
                </button>
              )}

              {/* Search */}
              <label className="relative block w-[225px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск"
                  className="h-[32px] w-full border-0 border-b border-[#DCDCE6] bg-transparent pl-0 pr-8 text-[15px] text-text-primary outline-none transition-colors placeholder:text-[#8e90a0] focus:border-[#55CB00]"
                />
                <Search className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              </label>
            </div>

            {/* Create button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (derivedShopId) {
                    router.push(`/promotions/create/${derivedShopId}`);
                  } else {
                    router.push("/promotions/create");
                  }
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#55CB00] px-5 text-[15px] font-bold text-white transition-all hover:bg-[#4abb00] shadow-[0_10px_20px_rgba(85,203,0,0.15)] active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Создать промокод
              </button>
            </div>
          </div>

          {/* Shop filter panel */}
          {isAdmin && filterActive && (
            <div className="border-b border-border px-6 py-4 flex flex-wrap items-end gap-6 transition-all animate-in fade-in slide-in-from-top-2">
              <div className="w-[300px] relative" ref={filterShopDropdownRef}>
                <div className="text-[12px] font-medium text-[#8E8E93] mb-2 ml-1">
                  Магазин
                </div>

                <button
                  onClick={() =>
                    setIsFilterShopDropdownOpen(!isFilterShopDropdownOpen)
                  }
                  className="w-full h-[32px] px-3 rounded-xl bg-[#f6f6fa] border border-[#ececf1] flex items-center justify-between text-[14px] transition-all hover:border-[#55CB00]"
                >
                  <span
                    className={cn(
                      selectedFilterShopId ? "text-text-primary" : "text-[#8e90a0]"
                    )}
                  >
                    {selectedFilterShopId
                      ? allShops.find((s) => s.id === selectedFilterShopId)?.name
                      : "Все магазины"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-text-secondary transition-transform",
                      isFilterShopDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isFilterShopDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-lg border border-border py-2 z-20 transition-all animate-in zoom-in-95 duration-200 origin-top">
                    <div className="px-3 pb-2 mb-1 border-b border-border">
                      <div className="relative flex items-center bg-[#f6f6fa] rounded-lg px-3 py-1.5 transition-all focus-within:ring-1 focus-within:ring-[#55CB00]/20">
                        <Search size={14} className="text-[#8e90a0] mr-2" />
                        <input
                          autoFocus
                          placeholder="Поиск магазина..."
                          className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-[#8e90a0]"
                          value={shopSearchQuery}
                          onChange={(e) => setShopSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto px-1 custom-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedFilterShopId(null);
                          setIsFilterShopDropdownOpen(false);
                          setShopSearchQuery("");
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors",
                          !selectedFilterShopId
                            ? "text-[#55CB00] font-semibold bg-[#55CB00]/10"
                            : "text-text-primary hover:bg-[#fafafe] hover:text-[#55CB00]"
                        )}
                      >
                        Все магазины
                      </button>
                      {shopsLoading ? (
                        <div className="px-3 py-4 text-center">
                          <Spinner size={16} />
                        </div>
                      ) : (
                        <>
                          {filteredShops.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedFilterShopId(s.id);
                                setIsFilterShopDropdownOpen(false);
                                setShopSearchQuery("");
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors flex items-center justify-between",
                                selectedFilterShopId === s.id
                                  ? "text-[#55CB00] font-semibold bg-[#55CB00]/10"
                                  : "text-text-primary hover:bg-[#fafafe] hover:text-[#55CB00]"
                              )}
                            >
                              <span className="truncate">{s.name}</span>
                              <span className="text-[10px] text-[#b7b8c5] ml-2">
                                ID {s.id}
                              </span>
                            </button>
                          ))}
                          {filteredShops.length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-[#b7b8c5]">
                              Магазины не найдены
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                className="h-[32px] px-4 text-[14px] font-medium text-[#8e90a0] hover:text-[#E26D5C] transition-colors flex items-center gap-2"
                onClick={() => {
                  setSelectedFilterShopId(null);
                  setSearch("");
                }}
              >
                <RotateCcw size={14} />
                Сбросить
              </button>
            </div>
          )}

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
                  <div className="flex-1 overflow-x-auto px-3 pb-2">
                    <table className="min-w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="text-left text-[14px] text-text-secondary">
                          <th className="border-b border-border px-3 py-3 font-medium">
                            ID
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium whitespace-nowrap">
                            Дата
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            <div className="inline-flex items-center gap-1">
                              Название
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            Комментарий
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            <div className="inline-flex items-center gap-1">
                              Выпуск
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            Оборот
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            Условия
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            Содержание
                          </th>
                          <th className="border-b border-border px-3 py-3 font-medium">
                            Активация
                          </th>
                          <th className="border-b border-border px-3 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {promocodes.map((p) => {
                          const turnover = p.turnover ?? 0;
                          const activation = p.activationCount ?? 0;

                          return (
                            <tr
                              key={p.id}
                              className="group cursor-pointer transition-colors hover:bg-[#fafafe]"
                              onClick={() => {
                                sessionStorage.setItem(`shoply:edit-promocode:${p.id}`, JSON.stringify(p));
                                router.push(`/promotions/edit/${p.id}`);
                              }}
                            >
                              <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                                {p.id}
                              </td>
                              <td className="border-b border-border px-3 py-3 text-[16px] font-medium text-text-primary whitespace-nowrap">
                                {formatDate(p.createdAt)}
                              </td>
                              <td className="border-b border-border px-3 py-3">
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
                                  <span className="text-[16px] text-[#478EFF] font-bold hover:underline decoration-2 underline-offset-4">
                                    {p.name}
                                  </span>
                                </div>
                              </td>
                              <td className="border-b border-border px-3 py-3">
                                <p className="text-[14px] text-text-secondary line-clamp-2 max-w-[200px] leading-relaxed">
                                  {p.technicalName || "-"}
                                </p>
                              </td>
                              <td className="border-b border-border px-3 py-3">
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
                                      <span className="text-[16px] text-text-primary font-medium whitespace-nowrap">
                                        {name}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="border-b border-border px-3 py-3 text-[16px] text-text-primary font-medium">
                                {formatCurrency(turnover)}
                              </td>
                              <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary whitespace-nowrap">
                                {getConditionsLabel(p)}
                              </td>
                              <td className="border-b border-border px-3 py-3 text-[16px] text-text-primary font-medium">
                                <span className="px-2 py-1 bg-[#f6f6fa] rounded-lg">
                                  {getContentLabel(p)}
                                </span>
                              </td>
                              <td className="border-b border-border px-3 py-3 text-[16px] text-text-primary font-medium">
                                {activation}
                              </td>
                              <td className="border-b border-border px-3 py-3 text-right">
                                <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                              </td>
                            </tr>
                          );
                        })}

                        {/* Summary row */}
                        {promocodes.length > 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-4 text-[14px] text-text-secondary font-medium"
                            >
                              {promocodes.length} промокодов
                            </td>
                            <td className="px-3 py-4" />
                            <td className="px-3 py-4 text-[16px] text-text-primary font-semibold">
                              {formatCurrency(totalTurnover)}
                            </td>
                            <td className="px-3 py-4" />
                            <td className="px-3 py-4" />
                            <td className="px-3 py-4 text-[16px] text-text-primary font-semibold">
                              {totalActivations}
                            </td>
                            <td className="px-3 py-4" />
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {promocodes.length === 0 && (
                    <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-text-secondary">
                      Нет промокодов
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border text-[14px] text-text-secondary">
                    <div>
                      Страница {page} из {pageCount} (всего {total})
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => handlePageChange(page - 1)}
                        className="inline-flex h-8 items-center rounded-xl border border-[#ececf1] bg-[#f6f6fa] px-3 text-[14px] font-medium text-text-primary disabled:opacity-50 transition-colors hover:bg-[#eeeef3]"
                      >
                        Назад
                      </button>
                      <button
                        disabled={page >= pageCount}
                        onClick={() => handlePageChange(page + 1)}
                        className="inline-flex h-8 items-center rounded-xl border border-[#ececf1] bg-[#f6f6fa] px-3 text-[14px] font-medium text-text-primary disabled:opacity-50 transition-colors hover:bg-[#eeeef3]"
                      >
                        Вперед
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
