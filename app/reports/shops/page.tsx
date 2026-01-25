"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useShops } from "@/components/hooks/useShops";
import { useAuth } from "@/components/hooks/useLogin";
import { Spinner } from "@/components/ui";
import { ShopStats } from "@/types/shop";
import { getImageUrl } from "@/lib/utils";

type SortField = "id" | "name" | "orderCount" | "revenue" | "serviceIncome";
type SortDirection = "asc" | "desc";
type PeriodType = "day" | "week" | "month" | "halfYear" | "year";

export default function ShopsPage() {
  const router = useRouter();
  const { shopsStats, loading, error, refetch } = useShops({
    periodType: "month",
    isPublic: "true",
    isAdmin: true,
    dateFrom: new Date().toISOString().split("T")[0],
  });

  const { adminData, loading: authLoading } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL,
  );

  useEffect(() => {
    if (authLoading || !adminData) return;

    // Check if user has a shop ID (shop_owner or shop_member)
    // AND is NOT an admin (just in case an admin also has a shop attached somehow)
    const userShopId =
      adminData?.shop?.id ?? adminData?.shopId ?? adminData?.shop_id;

    if (userShopId && !adminData.isAdmin) {
      router.replace(`/reports/shops/${userShopId}`);
    }
  }, [adminData, authLoading, router]);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [activePeriod, setActivePeriod] = useState<PeriodType>("month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Сегодня" },
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "halfYear", label: "Пол года" },
    { value: "year", label: "Год" },
  ];

  const handlePeriodChange = (period: PeriodType) => {
    setActivePeriod(period);
    setIsDropdownOpen(false);
    const today = new Date().toISOString().split("T")[0];
    refetch({
      periodType: period,
      dateFrom: today,
      isPublic: "true",
      isAdmin: true,
    });
  };

  // Close dropdown when clicking outside
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

  const sortedShops = useMemo(() => {
    if (!shopsStats.length) return [];

    const sorted = [...shopsStats].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [shopsStats, sortField, sortDirection]);

  const totals = useMemo(() => {
    return shopsStats.reduce(
      (acc, shop) => ({
        orderCount: acc.orderCount + shop.orderCount,
        revenue: acc.revenue + shop.revenue,
        serviceIncome: acc.serviceIncome + shop.serviceIncome,
      }),
      { orderCount: 0, revenue: 0, serviceIncome: 0 },
    );
  }, [shopsStats]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  const getShopAvatar = (name: string, photoUrl: string | null) => {
    if (photoUrl) {
      return (
        <img
          src={getImageUrl(photoUrl, { width: 64, height: 64, fit: "cover" })}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    const colors = [
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const initial = name.charAt(0).toUpperCase();

    return (
      <div
        className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm`}
      >
        {initial}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-6">
        <div className="flex items-center justify-center h-64">
          <Spinner size={40} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[24px] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <h1 className="text-[20px] font-bold text-[#111111] whitespace-nowrap">
          Магазины
        </h1>

        <div className="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-[12px] text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: "rgba(238, 238, 244, 0.5)",
              fontFamily: "Inter",
            }}
          >
            {periods.find((p) => p.value === activePeriod)?.label || "Месяц"}
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] shadow-lg border border-gray-200 overflow-hidden z-10"
              style={{ fontFamily: "Inter" }}
            >
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                    activePeriod === period.value
                      ? "bg-green-50 text-[#55CB00] font-medium"
                      : "text-gray-700"
                  }`}
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
                onClick={() => handleSort("name")}
              >
                Название <SortIcon field="name" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("orderCount")}
              >
                Кол-во заказов <SortIcon field="orderCount" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("revenue")}
              >
                Оборот магазина <SortIcon field="revenue" />
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-medium text-[#8E8E93] cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("serviceIncome")}
              >
                Доход сервиса <SortIcon field="serviceIncome" />
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedShops.map((shop) => (
              <tr
                key={shop.id}
                onClick={() =>
                  router.push(
                    `/reports/shops/${shop.id}?periodType=${activePeriod}&name=${encodeURIComponent(shop.name)}`,
                  )
                }
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                style={{ borderColor: "rgba(220, 220, 230, 1)" }}
              >
                <td className="py-4 px-4 text-sm text-[#8E8E93]">{shop.id}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {getShopAvatar(shop.name, shop.photoUrl)}
                    <span className="text-sm text-[#111111] font-medium">
                      {shop.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {shop.orderCount} заказов
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {shop.revenue.toLocaleString("ru-RU")} ₽
                </td>
                <td className="py-4 px-4 text-sm text-[#111111]">
                  {shop.serviceIncome.toLocaleString("ru-RU")} ₽
                </td>
                <td className="py-4 px-4">
                  <ChevronRight size={20} className="text-[#C7C7CC]" />
                </td>
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="">
              <td className="py-4 px-4 text-sm"></td>
              <td className="py-4 px-4 text-sm"></td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {totals.orderCount} заказов
              </td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {totals.revenue.toLocaleString("ru-RU")} ₽
              </td>
              <td className="py-4 px-4 text-sm text-[#8E8E93]">
                {totals.serviceIncome.toLocaleString("ru-RU")} ₽
              </td>
              <td className="py-4 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {sortedShops.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Нет данных о магазинах
        </div>
      )}
    </div>
  );
}
