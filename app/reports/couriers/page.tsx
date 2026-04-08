"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { useCouriers } from "@/components/hooks/useCouriers";
import { MainSection } from "@/components/layout";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/theme";

type SortField =
  | "id"
  | "username"
  | "totaldeliverymansum"
  | "completedorderscount"
  | "canceledorderscount";
type SortDirection = "asc" | "desc";

export default function CouriersPage() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<"day" | "week" | "month">(
    "month",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggeredSearchQuery, setTriggeredSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const pageSize = 50;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (activePeriod === "day") {
      return {
        dateFrom: today.toISOString(),
        dateTo: new Date(today.getTime() + 86400000).toISOString(),
      };
    }

    if (activePeriod === "week") {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      return {
        dateFrom: monday.toISOString(),
        dateTo: undefined,
      };
    }

    if (activePeriod === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        dateFrom: firstDay.toISOString(),
        dateTo: undefined,
      };
    }

    return { dateFrom: undefined, dateTo: undefined };
  }, [activePeriod]);

  const handleSearch = () => {
    setTriggeredSearchQuery(searchQuery);
  };

  const {
    couriers,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  } = useCouriers({
    pageSize,
    dateFrom,
    dateTo,
    search: triggeredSearchQuery,
  });

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const periods: { value: typeof activePeriod; label: string }[] = [
    { value: "day", label: "День" },
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
  ];

  const handlePeriodChange = (period: typeof activePeriod) => {
    setActivePeriod(period);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Infinite scroll: IntersectionObserver on sentinel element
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedCouriers = useMemo(() => {
    if (!couriers.length) return [];

    let result = [...couriers];

    if (showActiveOnly) {
      result = result.filter((c) => c.ordersLength > 0);
    }

    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (
        sortField === "totaldeliverymansum" ||
        sortField === "completedorderscount" ||
        sortField === "canceledorderscount"
      ) {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [couriers, sortField, sortDirection, showActiveOnly]);

  const totals = useMemo(() => {
    return filteredAndSortedCouriers.reduce(
      (acc, c) => ({
        earned: acc.earned + Number(c.totaldeliverymansum || 0),
        completed: acc.completed + Number(c.completedorderscount || 0),
        cancelled: acc.cancelled + Number(c.canceledorderscount || 0),
      }),
      { earned: 0, completed: 0, cancelled: 0 },
    );
  }, [filteredAndSortedCouriers]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  if (loading && couriers.length === 0) {
    return (
      <MainSection>
        <div className="flex h-full min-h-[320px] items-center justify-center p-6">
          <Loader2 className="h-10 w-10 animate-spin text-[#55CB00]" />
        </div>
      </MainSection>
    );
  }

  return (
    <MainSection>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* Header Area */}
        <div className="mb-10 flex items-center gap-6">
          <h1 className="whitespace-nowrap text-[20px] font-bold text-[#111111]">
            Курьеры
          </h1>

          {/* Search */}
          <div className="relative flex w-full max-w-[240px] items-center border-b border-[#E5E5EA] pb-1">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Поиск"
              className="w-full border-none bg-transparent py-1 text-[14px] outline-none placeholder:text-[#8E8E93]"
            />
            <button
              onClick={handleSearch}
              className="group ml-2 rounded-full p-1 transition-colors hover:bg-gray-100"
              title="Поиск"
            >
              <Search
                className="text-[#111111] transition-colors group-hover:text-[#55CB00]"
                size={18}
              />
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="mx-2 h-8 w-[1px] bg-[#E5E5EA]" />

          {/* Active Only Switch */}
          <div className="flex items-center gap-3">
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
              className="data-[state=checked]:bg-[#55CB00]"
            />
            <span className="whitespace-nowrap text-[14px] font-medium text-[#111111]">
              Только активные
            </span>
          </div>

          {/* Period Dropdown */}
          <div className="relative ml-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: "rgba(238, 238, 244, 0.5)" }}
            >
              {periods.find((p) => p.value === activePeriod)?.label || "Месяц"}
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform",
                  isDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-lg">
                {periods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodChange(period.value)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50",
                      activePeriod === period.value
                        ? "bg-green-50 font-medium text-[#55CB00]"
                        : "text-gray-700",
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: "rgba(220, 220, 230, 1)" }}
              >
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[#8E8E93] hover:text-gray-700"
                  onClick={() => handleSort("id")}
                >
                  ID <SortIcon field="id" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[#8E8E93] hover:text-gray-700"
                  onClick={() => handleSort("username")}
                >
                  Имя Фамилия <SortIcon field="username" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[#8E8E93] hover:text-gray-700"
                  onClick={() => handleSort("totaldeliverymansum")}
                >
                  Заработано <SortIcon field="totaldeliverymansum" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[#8E8E93] hover:text-gray-700"
                  onClick={() => handleSort("completedorderscount")}
                >
                  Выполнено <SortIcon field="completedorderscount" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-[#8E8E93] hover:text-gray-700"
                  onClick={() => handleSort("canceledorderscount")}
                >
                  Отменно <SortIcon field="canceledorderscount" />
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCouriers.map((courier) => (
                <tr
                  key={courier.id}
                  onClick={() =>
                    router.push(
                      `/reports/couriers/${courier.id}?periodType=${activePeriod}`,
                    )
                  }
                  className="cursor-pointer border-b transition-colors hover:bg-gray-50"
                  style={{ borderColor: "rgba(220, 220, 230, 1)" }}
                >
                  <td className="px-4 py-4 text-sm text-[#8E8E93]">
                    {courier.id}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-[#111111]">
                      {courier.username} {courier.lastname}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#111111]">
                    {Math.round(
                      Number(courier.totaldeliverymansum || 0),
                    ).toLocaleString("ru-RU")}{" "}
                    ₽
                  </td>
                  <td className="px-4 py-4 text-sm text-[#111111]">
                    {courier.completedorderscount} заказов
                  </td>
                  <td className="px-4 py-4 text-sm text-[#111111]">
                    {courier.canceledorderscount} заказов
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ChevronRight size={20} className="text-[#C7C7CC]" />
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr>
                <td className="px-4 py-4 text-sm"></td>
                <td className="px-4 py-4 text-center text-sm font-medium text-[#8E8E93]">
                  {filteredAndSortedCouriers.length} курьеров
                </td>
                <td className="px-4 py-4 text-sm text-[#8E8E93]">
                  {Math.round(totals.earned).toLocaleString("ru-RU")} ₽
                </td>
                <td className="px-4 py-4 text-sm text-[#8E8E93]">
                  {totals.completed} заказов
                </td>
                <td className="px-4 py-4 text-sm text-[#8E8E93]">
                  {totals.cancelled} заказов
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#55CB00]" />
            <span className="text-sm text-[#8E8E93]">Загрузка...</span>
          </div>
        )}

        {/* All loaded indicator */}
        {!hasMore && filteredAndSortedCouriers.length > 0 && !loading && (
          <div className="py-4 text-center text-sm text-[#8E8E93]">
            Все курьеры загружены
          </div>
        )}

        {!loading && filteredAndSortedCouriers.length === 0 && (
          <div className="py-12 text-center text-[#8E8E93]">
            Нет данных о курьерах
          </div>
        )}
      </div>
    </MainSection>
  );
}
