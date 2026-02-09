"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { useCouriers } from "@/components/hooks/useCouriers";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/theme";

type SortField =
  | "id"
  | "username"
  | "totaldeliverymansum"
  | "completedorderscount"
  | "canceledorderscount";
type SortDirection = "asc" | "desc";
type PeriodType = "week" | "month" | "halfYear" | "year";

export default function CouriersPage() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<"day" | "week" | "month">(
    "month",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const pageSize = 20;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

    if (activePeriod === "day") {
      return {
        dateFrom: today.toISOString(),
        dateTo: new Date(today.getTime() + 86400000).toISOString(),
      };
    }

    if (activePeriod === "week") {
      // Monday based week
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      return {
        dateFrom: monday.toISOString(),
        dateTo: undefined, // To end of time (or today?) let's leave undefined for "ongoing"
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

  const {
    couriers,
    meta: serverMeta,
    loading,
    error,
  } = useCouriers({
    page: 1, // Always fetch first page for full list
    pageSize: 1000, // Fetch all to allow client-side filtering/pagination
    dateFrom,
    dateTo,
  });

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

    let result = couriers.filter((c) => {
      // 1. Search filter
      const fullName = `${c.username || ""} ${c.lastname || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        String(c.id).includes(searchQuery);
      if (!matchesSearch) return false;
      if (showActiveOnly) {
        return c.ordersLength > 0;
      }
      return true;
    });

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
  }, [couriers, searchQuery, sortField, sortDirection, showActiveOnly]);

  const { paginatedCouriers, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredAndSortedCouriers.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      paginatedCouriers: filteredAndSortedCouriers.slice(start, end),
      totalPages: Math.max(1, total),
    };
  }, [filteredAndSortedCouriers, currentPage, pageSize]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-6 h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#55CB00]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6">
      {/* Header Area - Refined single line flex */}
      <div className="flex items-center gap-6 mb-10">
        <h1 className="text-[20px] font-bold text-[#111111] whitespace-nowrap">
          Курьеры
        </h1>

        {/* Search - Line style with icon on right */}
        <div className="relative flex items-center border-b border-[#E5E5EA] w-full max-w-[240px] pb-1">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            className="w-full bg-transparent border-none outline-none text-[14px] placeholder:text-[#8E8E93] py-1"
          />
          <Search className="text-[#111111] ml-2" size={18} />
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-[#E5E5EA] mx-2" />

        {/* Active Only Switch */}
        <div className="flex items-center gap-3">
          <Switch
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
            className="data-[state=checked]:bg-[#55CB00]"
          />
          <span className="text-[14px] font-medium text-[#111111] whitespace-nowrap">
            Только активные
          </span>
        </div>

        {/* Period Dropdown - Pushed to the right */}
        <div className="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-[12px] text-sm font-medium transition-colors flex items-center gap-2"
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] shadow-lg border border-gray-200 overflow-hidden z-20">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50",
                    activePeriod === period.value
                      ? "bg-green-50 text-[#55CB00] font-medium"
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
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("id")}
              >
                ID <SortIcon field="id" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("username")}
              >
                Имя Фамилия <SortIcon field="username" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("totaldeliverymansum")}
              >
                Заработано <SortIcon field="totaldeliverymansum" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("completedorderscount")}
              >
                Выполнено <SortIcon field="completedorderscount" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("canceledorderscount")}
              >
                Отменно <SortIcon field="canceledorderscount" />
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedCouriers.map((courier) => (
              <tr
                key={courier.id}
                onClick={() =>
                  router.push(
                    `/reports/couriers/${courier.id}?periodType=${activePeriod}`,
                  )
                }
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                style={{ borderColor: "rgba(220, 220, 230, 1)" }}
              >
                <td className="py-4 px-4 text-sm text-[#8E8E93]">
                  {courier.id}
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-[#111111] font-medium">
                    {courier.username} {courier.lastname}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {Math.round(
                    Number(courier.totaldeliverymansum || 0),
                  ).toLocaleString("ru-RU")}{" "}
                  ₽
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {courier.completedorderscount} заказов
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {courier.canceledorderscount} заказов
                </td>
                <td className="py-4 px-4 text-right">
                  <ChevronRight size={20} className="text-[#C7C7CC]" />
                </td>
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="">
              <td className="py-4 px-4 text-sm"></td>
              <td className="py-4 px-4 text-sm text-[#8E8E93] font-medium text-center">
                {filteredAndSortedCouriers.length} курьеров
              </td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {Math.round(totals.earned).toLocaleString("ru-RU")} ₽
              </td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {totals.completed} заказов
              </td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {totals.cancelled} заказов
              </td>
              <td className="py-4 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-xl text-sm font-semibold text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-[#F2F2F7] border-[#E5E5EA]"
          >
            Назад
          </button>
          <span className="text-sm font-medium text-[#8E8E93]">
            {currentPage} из {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-xl text-sm font-semibold text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-[#F2F2F7] border-[#E5E5EA]"
          >
            Вперед
          </button>
        </div>
      )}

      {!loading && filteredAndSortedCouriers.length === 0 && (
        <div className="text-center py-12 text-[#8E8E93]">
          Нет данных о курьерах
        </div>
      )}
    </div>
  );
}
