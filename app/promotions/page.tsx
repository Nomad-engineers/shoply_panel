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

import { Button } from "@/components/ui/button";
import { FilterButton } from "@/components/ui/filter-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner, Input } from "@/components/ui";
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
  const [searchTerm, setSearchTerm] = useState("");

  const { shops: allShops, loading: shopsLoading } = useShops();
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
      filter: { searchTerm },
    }),
    [
      page,
      pageSize,
      selectedFilterShopId,
      shopIdForFilter,
      authLoading,
      isAdmin,
      searchTerm,
    ]
  );

  const { data, loading, error, refetch } = usePromocodes(promocodeParams);

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

    return list;
  }, [data?.data, shopIdForFilter, activeTab]);

  const totalActivations = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.activationCount ?? 0), 0);
  }, [promocodes]);

  const totalTurnover = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.turnover ?? 0), 0);
  }, [promocodes]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refetch({
      page: newPage,
      pageSize,
      shopId: shopIdForFilter,
      filter: { searchTerm },
    });
  };

  return (
    <div className="bg-[#F2F2F7] min-h-screen p-8">
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("promocodes")}
                className={cn(
                  "text-[18px] font-bold pb-2 transition-all relative whitespace-nowrap",
                  activeTab === "promocodes"
                    ? "text-[#111111] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00]"
                    : "text-[#8E8E93] hover:text-[#111111]"
                )}
              >
                Промокоды
              </button>
              <button
                onClick={() => setActiveTab("archive")}
                className={cn(
                  "text-[18px] font-bold pb-2 transition-all relative whitespace-nowrap",
                  activeTab === "archive"
                    ? "text-[#111111] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00]"
                    : "text-[#8E8E93] hover:text-[#111111]"
                )}
              >
                Архив
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-6">
              {isAdmin && (
                <button
                  onClick={() => setFilterActive(!filterActive)}
                  className={cn(
                    "flex items-center gap-2 text-[16px] font-medium transition-colors",
                    filterActive ? "text-[#55CB00]" : "text-[#111111]"
                  )}
                >
                  <svg
                    width="24"
                    height="24"
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

              <div className="relative flex items-center min-w-[280px]">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск"
                  className="w-full bg-transparent border-b border-[#E5E5EA] text-[16px] placeholder:text-[#8E8E93] py-2 pr-8 outline-none focus:border-[#55CB00] transition-colors"
                />
                <Search
                  className="absolute right-0 text-[#111111]"
                  size={20}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (derivedShopId) {
                router.push(`/promotions/create/${derivedShopId}`);
              } else {
                router.push("/promotions/create");
              }
            }}
            className="bg-[#55CB00] hover:bg-[#4AB100] text-white px-5 py-2.5 rounded-[12px] flex items-center gap-2 font-bold text-[15px] transition-colors whitespace-nowrap ml-4"
          >
            Создать промокод
            <Plus className="w-5 h-5" />
          </button>
        </div>

      {isAdmin && filterActive && (
        <div className="mb-6 p-5 bg-[#F9F9FB] border border-[#E5E5EA] rounded-[24px] flex flex-wrap items-end gap-6 transition-all animate-in fade-in slide-in-from-top-2">
          {isAdmin && (
            <div className="w-[300px] relative" ref={filterShopDropdownRef}>
              <div className="text-[12px] font-medium text-[#8E8E93] mb-2 ml-1">
                Магазин
              </div>

              <button
                onClick={() =>
                  setIsFilterShopDropdownOpen(!isFilterShopDropdownOpen)
                }
                className="w-full h-11 px-4 rounded-xl bg-white border border-[#E5E5EA] flex items-center justify-between text-sm transition-all hover:border-[#55CB00]"
              >
                <span
                  className={cn(
                    selectedFilterShopId ? "text-[#111111]" : "text-[#8E8E93]"
                  )}
                >
                  {selectedFilterShopId
                    ? allShops.find((s) => s.id === selectedFilterShopId)?.name
                    : "Все магазины"}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-[#8E8E93] transition-transform",
                    isFilterShopDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {isFilterShopDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5E5EA] py-2 z-20 transition-all animate-in zoom-in-95 duration-200 origin-top">
                  <div className="px-3 pb-2 mb-1 border-b border-[#F2F2F7]">
                    <div className="relative flex items-center bg-[#F2F2F7] rounded-lg px-3 py-1.5 transition-all focus-within:ring-1 focus-within:ring-[#55CB00]/20">
                      <Search size={14} className="text-[#8E8E93] mr-2" />
                      <input
                        autoFocus
                        placeholder="Поиск магазина..."
                        className="w-full bg-transparent border-none outline-none text-xs text-[#111111] placeholder:text-[#8E8E93]"
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
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedFilterShopId
                          ? "text-[#55CB00] font-semibold bg-[#55CB00]/10"
                          : "text-[#111111] hover:bg-gray-50 hover:text-[#55CB00]"
                      )}
                    >
                      Все магазины
                    </button>
                    {filteredShops.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedFilterShopId(s.id);
                          setIsFilterShopDropdownOpen(false);
                          setShopSearchQuery("");
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                          selectedFilterShopId === s.id
                            ? "text-[#55CB00] font-semibold bg-[#55CB00]/10"
                            : "text-[#111111] hover:bg-gray-50 hover:text-[#55CB00]"
                        )}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="text-[10px] text-[#8E8E93] ml-2">
                          ID {s.id}
                        </span>
                      </button>
                    ))}
                    {filteredShops.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-[#8E8E93]">
                        Магазины не найдены
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="h-11 px-6 text-sm font-semibold text-[#8E8E93] hover:text-[#FF3B30] transition-colors flex items-center gap-2"
            onClick={() => {
              setSelectedFilterShopId(null);
              setShopSearchQuery("");
            }}
          >
            <RotateCcw size={16} />
            Сбросить
          </button>
        </div>
      )}

      {activeTab === "archive" && promocodes.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-[#8E8E93] text-[16px]">Архив пуст</div>
        </div>
      )}

      {(activeTab === "promocodes" || promocodes.length > 0) && (
        <>
          {loading && (
            <div className="flex items-center justify-center h-40">
              <Spinner size={32} />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-40">
              <div className="text-red-500">Ошибка: {error}</div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider whitespace-nowrap">
                        Дата
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-[#111111] transition-colors">
                          Название
                          <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        Комментарий
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-[#111111] transition-colors">
                          Выпуск
                          <ChevronDown size={14} />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        Оборот
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        Условия
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        Содержание
                      </th>
                      <th className="text-left py-4 px-4 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        Активация
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promocodes.map((p) => {
                      const turnover = p.turnover ?? 0;
                      const activation = p.activationCount ?? 0;

                      return (
                        <tr
                          key={p.id}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-5 px-4 text-[14px] text-[#8E8E93] font-medium">
                            {p.id}
                          </td>
                          <td className="py-5 px-4 text-[14px] text-[#111111] font-medium whitespace-nowrap">
                            {formatDate(p.createdAt)}
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(p.name);
                                  toast.success("Промокод скопирован");
                                }}
                                className="cursor-pointer hover:opacity-70 transition-opacity"
                              >
                                <PromocodeIcon className="w-6 h-6 flex-shrink-0 text-[#478EFF]" />
                              </div>
                              <span className="text-[15px] text-[#478EFF] font-bold hover:underline decoration-2 underline-offset-4">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <p className="text-[14px] text-[#8E8E93] line-clamp-2 max-w-[200px] leading-relaxed">
                              {p.technicalName || "-"}
                            </p>
                          </td>
                          <td className="py-5 px-4">
                            {(() => {
                              const shop = p.shop;
                              const name = shop?.name || "SHOPLY";
                              const photoUrl = shop?.photoId ? getImageUrl({ id: shop.photoId }) : null;

                              return (
                                <div className="flex items-center gap-3">
                                  {photoUrl ? (
                                    <Image
                                      src={photoUrl}
                                      alt={name}
                                      width={28}
                                      height={28}
                                      className="rounded-full object-cover border border-gray-100 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#55CB00]/10 flex items-center justify-center text-[#55CB00] text-[11px] font-bold border border-[#55CB00]/20">
                                      {name === "SHOPLY"
                                        ? "S"
                                        : name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-[14px] text-[#111111] font-medium whitespace-nowrap">
                                    {name}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-5 px-4 text-left text-[14px] text-[#111111] font-semibold">
                            {formatCurrency(turnover)}
                          </td>
                          <td className="py-5 px-4 text-left text-[14px] text-[#111111] font-normal whitespace-nowrap">
                            {getConditionsLabel(p)}
                          </td>
                          <td className="py-5 px-4 text-left text-[14px] text-[#111111] font-semibold">
                            <span className="px-2 py-1 bg-gray-100 rounded-lg">
                              {getContentLabel(p)}
                            </span>
                          </td>
                          <td className="py-5 px-4 text-left text-[14px] text-[#111111] font-semibold">
                            {activation}
                          </td>
                          <td className="py-5 px-4 text-right">
                            <ChevronRight
                              size={18}
                              className="text-[#C7C7CC] group-hover:text-[#55CB00] transition-colors inline"
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary row */}
                    {promocodes.length > 0 && (
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className="py-6 px-4 text-[13px] text-[#8E8E93] font-medium"
                        >
                          {promocodes.length} промокодов
                        </td>
                        <td className="py-6 px-4"></td>
                        <td className="py-6 px-4 text-left text-[15px] text-[#111111] font-semibold">
                          {formatCurrency(totalTurnover)}
                        </td>
                        <td className="py-6 px-4"></td>
                        <td className="py-6 px-4"></td>
                        <td className="py-6 px-4 text-left text-[15px] text-[#111111] font-semibold">
                          {totalActivations}
                        </td>
                        <td className="py-6 px-4"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {promocodes.length === 0 && (
                <div className="text-center py-20 text-[#8E8E93]">
                  Нет промокодов
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50 text-[14px] text-[#8E8E93]">
                <div>
                  Страница {page} из {pageCount} (всего {total})
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 bg-white border border-[#E5E5EA] rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    disabled={page >= pageCount}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 bg-white border border-[#E5E5EA] rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
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
  </div>
);
}
