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
  const { adminData, loading: authLoading } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL,
  );

  const derivedShopId =
    (adminData as any)?.shopId ??
    (adminData as any)?.shop?.id ??
    (adminData as any)?.shop_id;

  const shopIdForFilter = useMemo(() => {
    if (!derivedShopId) return undefined;
    const n = Number(derivedShopId);
    return Number.isNaN(n) ? undefined : n;
  }, [derivedShopId]);

  const [activeTab, setActiveTab] = useState<"promocodes" | "contests">(
    "promocodes",
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
      s.name.toLowerCase().includes(lowerQuery),
    );
  }, [allShops, shopSearchQuery]);

  const { data, loading, error, refetch } = usePromocodes({
    page,
    pageSize,
    relations: "promocodeShop.shop,promocodeShop.shop.photo,orders",
    shopId: selectedFilterShopId || shopIdForFilter,
    skip: authLoading || (!shopIdForFilter && !(adminData as any)?.isAdmin),
  });

  const { fetchWithSession, refreshSession } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL,
  );

  const [allTimeTurnover, setAllTimeTurnover] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalStats = async () => {
      const isShopOwnerWithoutId =
        !shopIdForFilter && !(adminData as any)?.isAdmin;
      if (isShopOwnerWithoutId) {
        return;
      }

      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", "1");
        queryParams.set("pageSize", "30");
        queryParams.set("relations", "orders");

        if (shopIdForFilter) {
          const searchParams = {
            promocodeShop: {
              shop: {
                id: shopIdForFilter,
              },
            },
          };
          queryParams.set("search", JSON.stringify(searchParams));
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/promocodes?${queryParams.toString()}`;
        const res = await fetchWithSession(
          url,
          () => localStorage.getItem("access_token"),
          refreshSession,
        );

        if (res.ok) {
          const json = await res.json();
          const allItems = (json.data || []) as Promocode[];

          // Calculate total turnover
          const total = allItems.reduce((sum, p) => {
            const ordersSum = (p.orders ?? []).reduce(
              (acc, o) => acc + (Number(o.subtotalPrice) || 0),
              0,
            );
            return sum + ordersSum;
          }, 0);

          setAllTimeTurnover(total);
        }
      } catch (e) {
        console.error("Failed to fetch total stats", e);
      }
    };

    fetchTotalStats();
  }, [shopIdForFilter, refetch, adminData]); // Re-fetch stats when filter changes or main data refetched

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

    // 1. Client-side Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.technicalName?.toLowerCase().includes(lowerSearch) ||
          String(p.id).includes(lowerSearch),
      );
    }

    // 2. Shop filter (if needed, although backend handles it, keep for safety)
    if (shopIdForFilter) {
      list = list.filter((p) => {
        const shops = p.promocodeShop ?? [];
        return shops.some((ps) => (ps as any)?.shop?.id === shopIdForFilter);
      });
    }

    return list;
  }, [data?.data, shopIdForFilter, searchTerm]);

  const totalTurnover = useMemo(() => {
    return promocodes.reduce((sum, p) => {
      const ordersSum = (p.orders ?? []).reduce(
        (acc, o) => acc + (Number(o.subtotalPrice) || 0),
        0,
      );
      return sum + ordersSum;
    }, 0);
  }, [promocodes]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refetch({
      page: newPage,
      pageSize,
      relations: "promocodeShop.shop,promocodeShop.shop.photo,orders",
      shopId: shopIdForFilter,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("promocodes")}
              className={cn(
                "text-[16px] font-medium pb-2 transition-all relative",
                activeTab === "promocodes"
                  ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00]"
                  : "text-[#8E8E93] hover:text-[#111111] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform",
              )}
            >
              Промокоды
            </button>
            <button
              onClick={() => setActiveTab("contests")}
              className={cn(
                "text-[16px] font-medium pb-2 transition-all relative",
                activeTab === "contests"
                  ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00]"
                  : "text-[#8E8E93] hover:text-[#111111] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#55CB00] after:scale-x-0 hover:after:scale-x-100 after:transition-transform",
              )}
            >
              Конкурсы
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Search - Line style */}
          <div className="relative flex items-center border-b border-[#E5E5EA] w-full max-w-[240px] pb-1">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск"
              className="w-full bg-transparent border-none text-[14px] placeholder:text-[#8E8E93] py-1"
            />
            <Search className="text-[#111111] ml-2" size={18} />
          </div>

          {(adminData as any)?.isAdmin && (
            <FilterButton
              active={filterActive}
              className="px-0 py-0 border-none bg-transparent hover:bg-transparent text-[#8E8E93] hover:text-[#111111] font-normal text-[16px] gap-2"
              onClick={() => setFilterActive(!filterActive)}
            >
              Фильтр
            </FilterButton>
          )}
        </div>

        <Button
          variant="success"
          className="rounded-xl gap-2"
          onClick={() => {
            if (derivedShopId) {
              router.push(`/promotions/create/${derivedShopId}`);
            } else {
              router.push("/promotions/create");
            }
          }}
        >
          Создать промокод
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {(adminData as any)?.isAdmin && filterActive && (
        <div className="mb-6 p-5 bg-[#F9F9FB] border border-[#E5E5EA] rounded-[24px] flex flex-wrap items-end gap-6 transition-all animate-in fade-in slide-in-from-top-2">
          {(adminData as any)?.isAdmin && (
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
                    selectedFilterShopId ? "text-[#111111]" : "text-[#8E8E93]",
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
                    isFilterShopDropdownOpen && "rotate-180",
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
                          : "text-[#111111] hover:bg-gray-50 hover:text-[#55CB00]",
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
                            : "text-[#111111] hover:bg-gray-50 hover:text-[#55CB00]",
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

      {activeTab === "contests" ? (
        <div className="text-gray-500 py-10">
          Раздел «Конкурсы» в разработке
        </div>
      ) : (
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "rgba(220, 220, 230, 1)" }}
                    >
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Название
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Выпуск
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Оборот
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Условия
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Содержание
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93]">
                        Активация
                        <ChevronDown className="inline ml-1 w-4 h-4" />
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {promocodes.map((p) => {
                      const turnover = (p.orders ?? []).reduce(
                        (acc, o) => acc + (Number(o.subtotalPrice) || 0),
                        0,
                      );
                      const activation = (p.orders ?? []).length;

                      return (
                        <tr
                          key={p.id}
                          className="border-b transition-colors"
                          style={{ borderColor: "rgba(220, 220, 230, 1)" }}
                        >
                          <td className="py-4 px-4 text-sm text-[#8E8E93]">
                            {p.id}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111111] font-medium">
                              {p.name}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-[#111111]">
                            {(() => {
                              const shop = p.promocodeShop?.[0]?.shop;
                              const name = shop?.name || "SHOPLY";
                              const photoUrl = getImageUrl(shop?.photo, {
                                width: 48,
                                height: 48,
                                fit: "cover",
                              });

                              return (
                                <div className="flex items-center gap-2">
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-[#55CB00] flex items-center justify-center text-white text-[10px] font-bold">
                                      {name === "SHOPLY"
                                        ? "S"
                                        : name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span>{name}</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-4 text-sm text-[#111111]">
                            {formatCurrency(turnover)}
                          </td>
                          <td className="py-4 px-4 text-sm text-[#111111]">
                            {getConditionsLabel(p)}
                          </td>
                          <td className="py-4 px-4 text-sm text-[#111111]">
                            {getContentLabel(p)}
                          </td>
                          <td className="py-4 px-4 text-sm text-[#111111]">
                            {activation}
                          </td>
                          <td className="py-4 px-4"></td>
                        </tr>
                      );
                    })}

                    <tr>
                      <td className="py-4 px-4 text-sm"></td>
                      <td className="py-4 px-4 text-sm"></td>
                      <td className="py-4 px-4 text-sm text-[#8E8E93]">
                        {total} промокодов
                      </td>
                      <td className="py-4 px-4 text-sm text-[#8E8E93]">
                        {allTimeTurnover !== null
                          ? formatCurrency(allTimeTurnover)
                          : "..."}
                      </td>
                      <td className="py-4 px-4 text-sm"></td>
                      <td className="py-4 px-4 text-sm"></td>
                      <td className="py-4 px-4 text-sm"></td>
                      <td className="py-4 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {promocodes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Нет промокодов
                </div>
              )}

              <div className="flex items-center justify-between mt-4 text-sm text-[#8E8E93]">
                <div>
                  Страница {page} из {pageCount} (всего {total})
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
