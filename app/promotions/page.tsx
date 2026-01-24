"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
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

  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterShopId, setSelectedFilterShopId] = useState<
    number | null
  >(null);

  const { shops, loading: shopsLoading } = useShops();

  const { data, loading, error, refetch } = usePromocodes({
    page,
    pageSize,
    relations: "promocodeShop.shop,promocodeShop.shop.photo,orders",
    shopId: shopIdForFilter,
    filter: useMemo(() => {
      const f: any = {};
      if (selectedFilterShopId) {
        f.promocodeShop = { shop: { id: selectedFilterShopId } };
      }
      return f;
    }, [selectedFilterShopId]),
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
                "text-[16px] font-medium border-b-2 pb-1 transition-all",
                activeTab === "promocodes"
                  ? "text-[#111111] border-[#55CB00]"
                  : "text-[#8E8E93] border-transparent hover:text-[#111111] hover:border-[#55CB00]",
              )}
            >
              Промокоды
            </button>
            <button
              onClick={() => setActiveTab("contests")}
              className={cn(
                "text-[16px] font-medium border-b-2 pb-1 transition-all",
                activeTab === "contests"
                  ? "text-[#111111] border-[#55CB00]"
                  : "text-[#8E8E93] border-transparent hover:text-[#111111] hover:border-[#55CB00]",
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

          <FilterButton
            active={filterActive}
            className="px-0 py-0 border-none bg-transparent hover:bg-transparent text-[#8E8E93] hover:text-[#111111] font-normal text-[16px] gap-2"
            onClick={() => setFilterActive(!filterActive)}
          >
            Фильтр
          </FilterButton>
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

      {filterActive && (
        <div className="mb-6 p-4 bg-[#F2F2F7] rounded-2xl flex flex-wrap items-end gap-4 transition-all animate-in fade-in slide-in-from-top-2">
          {(adminData as any)?.isAdmin && (
            <div className="w-[300px]">
              <div className="text-[12px] text-[#8E8E93] mb-1.5 ml-1">
                Магазин
              </div>
              <select
                className="w-full h-11 px-3 rounded-xl bg-white border-none shadow-sm text-sm focus:ring-2 focus:ring-[#55CB00] appearance-none cursor-pointer"
                value={selectedFilterShopId || ""}
                onChange={(e) =>
                  setSelectedFilterShopId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Все магазины</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="h-11 px-6 text-sm font-medium text-[#8E8E93] hover:text-[#111111] transition-colors"
            onClick={() => {
              setSelectedFilterShopId(null);
            }}
          >
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
                          className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
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
                                    <Image
                                      src={photoUrl}
                                      alt={name}
                                      width={24}
                                      height={24}
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
                          <td className="py-4 px-4">
                            <ChevronRight
                              size={20}
                              className="text-[#C7C7CC]"
                            />
                          </td>
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
