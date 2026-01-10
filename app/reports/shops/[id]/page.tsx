"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronDown, Check, X, Clock, Calendar } from "lucide-react";
import { useShops } from "@/components/hooks/useShops";
import { Shop, ShopOrder } from "@/types/shop";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// ... imports ...

// ... imports ...

type PeriodType = "day" | "week" | "month" | "halfYear" | "year" | "period";

export default function ShopDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = Number(params.id);

  const searchParams = useSearchParams();
  const urlPeriod = searchParams.get("periodType") as PeriodType | null;

  const [activePeriod, setActivePeriod] = useState<PeriodType>(urlPeriod || "month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const period = urlPeriod || "month";
    const end = new Date();
    const start = new Date();
    
    if (period === "period") return null;

    switch (period) {
      case "day": break;
      case "week": start.setDate(end.getDate() - 7); break;
      case "month": start.setMonth(end.getMonth() - 1); break;
      case "halfYear": start.setMonth(end.getMonth() - 6); break;
      case "year": start.setFullYear(end.getFullYear() - 1); break;
    }
    return start;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const { shops, loading, error, refetch } = useShops({
    periodType: urlPeriod || "month",
    isPublic: "true",
    dateFrom: new Date().toISOString().split("T")[0],
  });

  const shop = useMemo(() => shops.find((s) => s.id === shopId), [shops, shopId]);

  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Сегодня" },
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "halfYear", label: "Пол года" },
    { value: "year", label: "Год" },
    { value: "period", label: "Период" },
  ];

  const handlePeriodChange = (period: PeriodType) => {
    setActivePeriod(period);
    setIsDropdownOpen(false);

    if (period === "period") {
      // Don't auto-set dates, let user pick
      return; 
    }

    const end = new Date();
    const start = new Date();

    switch (period) {
      case "day":
        // No change to start, it remains same as end (today)
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "halfYear":
        start.setMonth(end.getMonth() - 6);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    setStartDate(start);
    setEndDate(end);

    refetch({
      periodType: period, 
      dateFrom: end.toISOString().split("T")[0],
      isPublic: "true",
    });
  };

  const handleDateChange = (type: "start" | "end", date: Date | null) => {
    if (type === "start") setStartDate(date);
    else setEndDate(date);
    
    // If we are in 'period' mode, we might want to auto-refetch if both dates are present
    const newStart = type === "start" ? date : startDate;
    const newEnd = type === "end" ? date : endDate;

    if (activePeriod === "period" && newStart && newEnd) {
       refetch({
        periodType: "period",
        dateFrom: newStart.toISOString().split("T")[0],
        dateTo: newEnd.toISOString().split("T")[0],
        isPublic: "true",
      });
    }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    if (!shop) return null;

    const orders = shop.orders;
    const totalOrders = orders.length;
    const completed = orders.filter((o) => o.status === "completed" && !o.isCancelled).length;
    const cancelled = orders.filter((o) => o.status === "cancelled" || o.isCancelled).length;
    const open = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled" && !o.isCancelled).length;

    // Turnover
    const turnoverCash = orders
      .filter((o) => o.paymentMethod === "cash" && o.status === "completed" && !o.isCancelled)
      .reduce((sum, o) => sum + o.subtotalPrice, 0);

    const turnoverSbp = orders
      .filter((o) => o.paymentMethod !== "cash" && o.status === "completed" && !o.isCancelled)
      .reduce((sum, o) => sum + o.subtotalPrice, 0);

    const totalTurnover = turnoverCash + turnoverSbp;

    // Promocodes
    let promoShop = 0;
    let promoShoply = 0;

    orders.forEach((o) => {
      if (o.status === "completed" && !o.isCancelled && (o.discountAmount > 0 || o.promocode)) {
        const discount = o.discountAmount || 0;
        if (o.promocode?.payFromShop) {
          promoShop += discount;
        } else {
          promoShoply += discount;
        }
      }
    });

    const totalPromo = promoShop + promoShoply;

    // Commission & Delivery
    const commission = orders
      .filter((o) => o.status === "completed" && !o.isCancelled)
      .reduce((sum, o) => sum + (Number(o.commissionService) || 0), 0);

    const delivery = orders
      .filter((o) => o.status === "completed" && !o.isCancelled)
      .reduce((sum, o) => sum + o.deliveryCost, 0);
      
    const shopEarnings = totalTurnover - commission - delivery;

    return {
      totalOrders,
      completed,
      cancelled,
      open,
      turnoverCash,
      turnoverSbp,
      totalTurnover,
      promoShop,
      promoShoply,
      totalPromo,
      commission,
      delivery,
      shopEarnings,
    };
  }, [shop]);

  const handleDownloadExcel = () => {
    if (!shop || !stats) return;

    // Prepare data for Excel
    const data = shop.orders.map((order, index) => ({
      "№": index + 1,
      "ID заказа": order.id,
      "Дата, время": new Date(order.createdAt).toLocaleString("ru-RU"),
      "Оплата": order.paymentMethod === "cash" ? "Наличными" : "СБП",
      "Корзина": order.subtotalPrice,
      "Доставка": order.deliveryCost,
      "Комиссия": Number(order.commissionService) || 0,
      "Итого": order.totalPrice,
      "Промокод (Сумма)": order.discountAmount || 0,
      "Промокод (Тип)": order.promocode ? (order.promocode.payFromShop ? "Магазин" : "SHOPLY") : "-",
      "Статус": order.status === "completed" ? "Выполнен" : order.status === "cancelled" ? "Отменен" : "В работе",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Generate Excel file
    XLSX.writeFile(wb, `${shop.name}_orders_${new Date().toISOString().split("T")[0]}.xlsx`);
  };


  if (loading) return <div className="p-6">Загрузка...</div>;
  if (!shop) return <div className="p-6">Магазин не найден</div>;

  return (
    <div className="bg-white rounded-[24px] p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{shop.name}</h1>
        </div>

        <div className="flex items-center gap-4">
             {/* Date Pickers - Only show if activePeriod is 'period' */}
             {activePeriod === "period" && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => handleDateChange("start", date)}
                            dateFormat="dd.MM.yyyy"
                            className="px-4 py-2 rounded-[12px] text-sm font-medium border-none outline-none w-[140px] text-left cursor-pointer transition-all bg-[#F2F2F7] hover:bg-[#E5E5EA] focus:ring-2 focus:ring-[#55CB00]/20 font-sans"
                            placeholderText="дд.мм.гггг"
                            wrapperClassName="date-picker-wrapper"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <Calendar size={16} className="text-gray-500" />
                        </div>
                     </div>
                     <div className="relative">
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => handleDateChange("end", date)}
                            dateFormat="dd.MM.yyyy"
                            className="px-4 py-2 rounded-[12px] text-sm font-medium border-none outline-none w-[140px] text-left cursor-pointer transition-all bg-[#F2F2F7] hover:bg-[#E5E5EA] focus:ring-2 focus:ring-[#55CB00]/20 font-sans"
                            placeholderText="дд.мм.гггг"
                            wrapperClassName="date-picker-wrapper"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <Calendar size={16} className="text-gray-500" />
                        </div>
                     </div>
                </div>
             )}


            {/* Period Dropdown */}
            <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-[12px] text-sm font-medium transition-colors flex items-center gap-2 min-w-[100px] justify-between"
                style={{
                backgroundColor: "rgba(238, 238, 244, 0.5)",
                fontFamily: "Inter",
                }}
            >
                {periods.find((p) => p.value === activePeriod)?.label || "Месяц"}
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] shadow-lg border border-gray-200 overflow-hidden z-20">
                {periods.map((period) => (
                    <button
                    key={period.value}
                    onClick={() => handlePeriodChange(period.value)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                        activePeriod === period.value ? "bg-green-50 text-[#55CB00] font-medium" : "text-gray-700"
                    }`}
                    >
                    {period.label}
                    </button>
                ))}
                </div>
            )}
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-8 border rounded-lg" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>№</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>ID заказа</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Дата, время</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Оплата</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Корзина</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Доставка</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Комиссия</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Итого</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>Промокоды</th>
              <th className="py-3 px-4 font-normal text-[#8E8E93] text-center">Статус</th>
            </tr>
          </thead>
          <tbody className="text-[#111111]">
            {shop.orders.map((order, index) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
                <td className="py-4 px-4 text-[#8E8E93] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{index + 1}</td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{order.id}</td>
                <td className="py-4 px-4 text-[#111111] border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
                  {new Date(order.createdAt).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
                  {order.paymentMethod === "cash" ? "Наличными" : "СБП"}
                </td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{order.subtotalPrice}</td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{order.deliveryCost}</td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{Number(order.commissionService) || 0}</td>
                <td className="py-4 px-4 font-medium border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>{order.totalPrice}</td>
                <td className="py-4 px-4 border-r" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
                  {(order.discountAmount > 0 || order.promocode) ? (
                    <div className="flex items-center justify-between w-full max-w-[120px]">
                       <span className="font-medium">{order.discountAmount}</span>
                       <span className="text-[#8E8E93] text-xs">
                         {order.promocode ? (order.promocode.payFromShop ? "Магазин" : "SHOPLY") : "SHOPLY"}
                       </span>
                    </div>
                  ) : null}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    {order.status === "completed" && <Check className="text-[#55CB00]" size={18} strokeWidth={3} />}
                    {(order.status === "cancelled" || order.isCancelled) && <X className="text-[#FF3B30]" size={18} strokeWidth={3} />}
                    {order.status !== "completed" && order.status !== "cancelled" && !order.isCancelled && (
                      <Clock className="text-[#007AFF]" size={18} strokeWidth={3} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {stats && (
        <div className="mt-10 pt-8 border-t" style={{ borderColor: "rgba(220, 220, 230, 1)" }}>
          <div className="flex flex-nowrap gap-0 mb-8 items-start justify-between overflow-x-auto pb-2">
            {/* Column 1: Date Range */}
            <div className="pr-2 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Расчет за</div>
              <div className="font-bold text-sm text-[#111111] whitespace-nowrap">
                {activePeriod === "day" && startDate ? (
                  startDate.toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' })
                ) : startDate && endDate ? (
                  <>
                    {startDate.toLocaleDateString("ru-RU")} - {endDate.toLocaleDateString("ru-RU")}
                  </>
                ) : (
                  "12.11.25 - 28.11.25"
                )}
              </div>
            </div>

            {/* Column 2: Orders */}
            <div className="px-3 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Заказы</div>
              <div className="font-bold text-sm text-[#111111] mb-2 whitespace-nowrap">{stats.totalOrders} заказов</div>
              <div className="space-y-1 text-xs text-[#111111] whitespace-nowrap">
                <div><span className="font-medium">{stats.completed}</span> - выполненно</div>
                <div><span className="font-medium">{stats.cancelled}</span> - отменно</div>
                <div><span className="font-medium">{stats.open}</span> - не закрыт</div>
              </div>
            </div>

            {/* Column 3: Turnover */}
            <div className="px-3 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Общий оборот магазина</div>
              <div className="font-bold text-sm text-[#111111] mb-2 whitespace-nowrap">{stats.totalTurnover.toLocaleString("ru-RU")} руб</div>
              <div className="space-y-1 text-xs text-[#111111] whitespace-nowrap">
                <div>Наличные - <span className="font-medium">{stats.turnoverCash.toLocaleString("ru-RU")}</span></div>
                <div>СБП - <span className="font-medium">{stats.turnoverSbp.toLocaleString("ru-RU")}</span></div>
              </div>
            </div>

            {/* Column 4: Promocodes */}
            <div className="px-3 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Промокоды</div>
              <div className="font-bold text-sm text-[#111111] mb-2 whitespace-nowrap">{stats.totalPromo.toLocaleString("ru-RU")} руб</div>
              <div className="space-y-1 text-xs text-[#111111] whitespace-nowrap">
                {stats.promoShop > 0 && (
                  <div>Магазин - <span className="font-medium">{stats.promoShop.toLocaleString("ru-RU")}</span></div>
                )}
                {stats.promoShoply > 0 && (
                  <div>SHOPLY - <span className="font-medium">{stats.promoShoply.toLocaleString("ru-RU")}</span></div>
                )}
              </div>
            </div>

            {/* Column 5: Commission */}
            <div className="px-3 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Комиссия</div>
              <div className="font-bold text-sm text-[#111111] whitespace-nowrap">{stats.commission.toLocaleString("ru-RU")} руб</div>
            </div>

            {/* Column 6: Delivery */}
            <div className="px-3 border-r border-[#ECECEE] min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Доставка</div>
              <div className="font-bold text-sm text-[#111111] whitespace-nowrap">{stats.delivery.toLocaleString("ru-RU")} руб</div>
            </div>

            {/* Column 7: Shop Earnings */}
            <div className="pl-3 min-h-[80px] flex-grow">
              <div className="text-[#8E8E93] text-[10px] uppercase tracking-wider mb-2">Заработок магазина</div>
              <div className="font-bold text-lg text-[#55CB00] whitespace-nowrap">{stats.shopEarnings.toLocaleString("ru-RU")} руб</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadExcel}
              className="px-6 py-3 rounded-[12px] text-sm font-medium transition-colors hover:bg-[#E5E5EA]"
              style={{ backgroundColor: "#F2F2F7", color: "#111111" }}
            >
              Скачать Excel
            </button>
            <button
              className="px-6 py-3 rounded-[12px] text-sm font-medium transition-colors hover:bg-[#E5E5EA]"
              style={{ backgroundColor: "#F2F2F7", color: "#111111" }}
            >
              Скачать CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
