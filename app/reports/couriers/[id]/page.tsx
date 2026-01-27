"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Clock,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { useCourierDetail } from "@/components/hooks/useCourierDetail";
import { useAuth } from "@/components/hooks/useLogin";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/theme";
import { Spinner } from "@/components/ui";
import { getImageUrl } from "@/lib/utils";

type PeriodType = "day" | "week" | "month" | "halfYear" | "year" | "period";

export default function CourierDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const urlPeriod = searchParams.get("periodType") as PeriodType | null;

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [activePeriod, setActivePeriod] = useState<PeriodType>(
    urlPeriod || "month",
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [appliedStartDate, setAppliedStartDate] = useState<string | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { courier, loading, error, refetch } = useCourierDetail({
    id,
    periodType: activePeriod,
    dateFrom: activePeriod === "period" ? appliedStartDate || undefined : today,
    dateTo: activePeriod === "period" ? appliedEndDate || undefined : undefined,
    page: currentPage,
    pageSize: 20,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCalculate = () => {
    if (startDate && endDate) {
      setAppliedStartDate(startDate.toISOString().split("T")[0]);
      setAppliedEndDate(endDate.toISOString().split("T")[0]);
      setCurrentPage(1);
    }
  };

  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Сегодня" },
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "period", label: "Период" },
  ];

  const handleDownloadExcel = () => {
    if (!courier) return;

    const exportData = courier.orders.map((order, index) => ({
      "№": index + 1,
      "ID заказа": order.id,
      "Дата, время": new Date(order.createdAt).toLocaleString("ru-RU"),
      Магазин: typeof order.shop === "string" ? order.shop : order.shop?.name,
      Оплата: order.paymentMethod === "cash" ? "Наличными" : "СБП",
      Корзина: order.subtotalPrice,
      Доставка: order.deliveryCost,
      Ставка: order.deliveryRate,
      Комисия: (order.subtotalPrice * (order.deliveryCommission || 0)) / 100,
      "%": (order.deliveryCommission || 0) + "%",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payouts");
    XLSX.writeFile(wb, `courier_${id}_payouts.xlsx`);
  };

  const orders = courier?.orders || [];
  const stats = courier?.payoutStats;

  const totalEarned = stats
    ? stats.totalDeliveryRate
    : orders.reduce((sum, o) => sum + (o.deliveryRate || 0), 0);
  const totalSubtotal =
    stats?.totalSubtotalPrice ||
    orders.reduce((sum, o) => sum + (o.subtotalPrice || 0), 0);
  const totalCommission = stats
    ? stats.totalDeliveryCommissionSum
    : orders.reduce(
        (sum, o) => sum + (o.subtotalPrice * (o.deliveryCommission || 0)) / 100,
        0,
      );
  const totalOrdersCount = stats ? stats.orderCount : orders.length;

  if (loading && !courier)
    return (
      <div className="p-10 flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!courier) return null;

  const showContent =
    activePeriod !== "period" || (appliedStartDate && appliedEndDate);

  return (
    <div className="bg-white rounded-[24px] p-6 min-h-screen">
      {/* Header section */}
      <div className="flex items-center justify-between px-0 py-3 mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[14px] font-medium text-[#111111] hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
            Назад
          </button>

          <div className="h-6 w-[1px] bg-[#E5E5EA]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center overflow-hidden">
              {courier.user?.photo?.url ? (
                <img
                  src={getImageUrl(courier.user.photo, {
                    width: 80,
                    height: 80,
                    fit: "cover",
                  })}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={20} className="text-[#8E8E93]" />
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[16px] font-bold text-[#111111]">
                {courier.user?.firstName} {courier.user?.lastName}
              </span>
              <div className="flex gap-4 text-[12px] text-[#8E8E93]">
                <span>user id: {courier.user?.id}</span>
                <span>delivery id: {courier.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F2F2F7] text-[14px] font-medium"
          >
            {periods.find((p) => p.value === activePeriod)?.label || "Месяц"}
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform text-[#8E8E93]",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E5E5EA] z-50 overflow-hidden">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => {
                    setActivePeriod(period.value);
                    setIsDropdownOpen(false);
                    setCurrentPage(1);
                    if (period.value !== "period") {
                      setAppliedStartDate(null);
                      setAppliedEndDate(null);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm hover:bg-gray-50",
                    activePeriod === period.value
                      ? "bg-green-50 text-[#55CB00] font-bold"
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

      {/* Date Range Selection (shown only for 'period') */}
      {activePeriod === "period" && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-[#F2F2F7] rounded-xl inline-flex">
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd.MM.yyyy"
              placeholderText="дд.мм.гггг"
              className="w-40 px-3 py-2 bg-[#F2F2F7] rounded-lg text-sm font-medium border-none focus:ring-1 focus:ring-[#55CB00]"
            />
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none"
            />
          </div>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd.MM.yyyy"
              placeholderText="дд.мм.гггг"
              className="w-40 px-3 py-2 bg-[#F2F2F7] rounded-lg text-sm font-medium border-none focus:ring-1 focus:ring-[#55CB00]"
            />
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none"
            />
          </div>
          <button
            onClick={handleCalculate}
            className="px-6 py-2 bg-[#55CB00] text-white rounded-lg text-sm font-bold hover:bg-[#4BB500] transition-colors"
          >
            Расчет
          </button>
        </div>
      )}

      {showContent && (
        <>
          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5E5EA] mb-6">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-white border-b border-[#E5E5EA]">
                <tr className="text-[#8E8E93] font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 border-r border-[#E5E5EA]">№</th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA]">
                    ID заказа
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA]">
                    <div className="flex items-center justify-between">
                      Дата, время
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA]">
                    <div className="flex items-center justify-between">
                      Магазин
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA]">
                    <div className="flex items-center justify-between">
                      Оплата
                      <ChevronDown size={14} />
                    </div>
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                    КОРЗИНА
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                    ДОСТАВКА
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                    СТАВКА
                  </th>
                  <th className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                    КОМИСИЯ
                  </th>
                  <th className="py-3 px-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F7]">
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="text-[#111111] hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-[#8E8E93]">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] font-medium">
                      {order.id}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-[12px]">
                      {new Date(order.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] font-medium">
                      {typeof order.shop === "string"
                        ? order.shop
                        : order.shop?.name}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-[12px]">
                      {order.paymentMethod === "cash" ? "Наличными" : "СБП"}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                      {order.subtotalPrice}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right">
                      {order.deliveryCost}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-medium">
                      {order.deliveryRate}
                    </td>
                    <td className="py-3 px-3 border-r border-[#E5E5EA] text-right font-medium">
                      {(
                        (order.subtotalPrice *
                          (order.deliveryCommission || 0)) /
                        100
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[12px] text-[#8E8E93]">
                      {order.deliveryCommission}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {courier?.meta && courier.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-[#F2F2F7] border-[#E5E5EA]"
              >
                Назад
              </button>
              <span className="text-sm font-medium text-[#8E8E93]">
                {currentPage} из {courier.meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(courier.meta!.totalPages, prev + 1),
                  )
                }
                disabled={currentPage === courier.meta.totalPages}
                className="px-4 py-2 border rounded-xl text-sm font-semibold text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-[#F2F2F7] border-[#E5E5EA]"
              >
                Вперед
              </button>
            </div>
          )}
          {/* Summary Footer Grid */}
          {/* Summary Footer Grid */}
          <div className="flex flex-wrap items-start mb-8 gap-y-6">
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Расчет за период
              </span>
              <span className="text-[16px] font-bold text-[#111111] whitespace-nowrap">
                {courier?.payoutDates
                  ? `${new Date(
                      courier.payoutDates.dateFrom,
                    ).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })} - ${new Date(
                      courier.payoutDates.dateTo,
                    ).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}`
                  : activePeriod === "day"
                    ? today.split("-").reverse().join(".")
                    : activePeriod === "week"
                      ? `от ${today.split("-").reverse().join(".")}`
                      : activePeriod === "month"
                        ? `от ${today.split("-").reverse().join(".")}`
                        : `${(appliedStartDate || "").split("-").reverse().join(".")} - ${(appliedEndDate || "").split("-").reverse().join(".")}`}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Дней
              </span>
              <span className="text-[16px] font-bold text-[#111111]">
                {courier?.payoutDates
                  ? Math.max(
                      1,
                      Math.ceil(
                        (new Date(courier.payoutDates.dateTo).getTime() -
                          new Date(courier.payoutDates.dateFrom).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 0}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Курьер
              </span>
              <span className="text-[16px] font-bold text-[#111111] whitespace-nowrap">
                {courier.user?.firstName} {courier.user?.lastName}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                ID курьера
              </span>
              <span className="text-[16px] font-bold text-[#111111]">
                {courier.id}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                ID пользователя
              </span>
              <span className="text-[16px] font-bold text-[#111111]">
                {courier.user?.id}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Заказов
              </span>
              <span className="text-[16px] font-bold text-[#111111]">
                {totalOrdersCount}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Ставка
              </span>
              <span className="text-[16px] font-bold text-[#111111] whitespace-nowrap">
                {totalEarned.toLocaleString()} руб
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[#c2c2c2]">
                Комиссия
              </span>
              <span className="text-[16px] font-bold text-[#111111] whitespace-nowrap">
                {totalCommission.toLocaleString()} руб
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleDownloadExcel}
              className="px-6 py-2 border rounded-xl text-sm font-semibold text-[#111111] hover:bg-gray-50 transition-colors bg-[#F2F2F7] border-[#E5E5EA]"
            >
              Скачать Excel
            </button>
            <button className="px-6 py-2 border rounded-xl text-sm font-semibold text-[#111111] hover:bg-gray-100 transition-colors bg-white border-[#E5E5EA]">
              Скачать CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
