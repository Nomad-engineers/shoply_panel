"use client";

import { useMemo } from "react";
import { ChevronDown, ClipboardList, Package, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { cn } from "@/lib/theme";
import { Spinner } from "@/components/ui";
import { useAdminOrders } from "@/components/hooks/useAdminOrders";
import type { AdminOrder, AdminOrderStatus } from "@/types/admin-order";

type BoardColumnTone = "new" | "progress" | "picked" | "delivery" | "done" | "return";

interface OrderCardData {
  cardId: string;
  id: number;
  customer: string;
  address: string;
  total: string;
  items: string;
  status: string;
  tone: BoardColumnTone;
}

interface BoardColumnData {
  id: string;
  title: string;
  tone: BoardColumnTone;
  orders: OrderCardData[];
}

interface SummaryCardData {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
}

const tabs = [
  { id: "active", label: "Активные заказы", disabled: false },
  { id: "history", label: "История заказов", disabled: true },
  { id: "promo", label: "Промо компании", disabled: true },
];

const boardColumnTemplate: Omit<BoardColumnData, "orders">[] = [
  { id: "new", title: "Новые заказы", tone: "new" },
  { id: "progress", title: "В работе", tone: "progress" },
  { id: "picked", title: "Собраны", tone: "picked" },
  { id: "delivery", title: "На доставке", tone: "delivery" },
  { id: "done", title: "Завершение", tone: "done" },
  { id: "return", title: "Возврат", tone: "return" },
];

const toneClassNames: Record<BoardColumnTone, string> = {
  new: "text-[#76C84F]",
  progress: "text-[#76C84F]",
  picked: "text-[#76C84F]",
  delivery: "text-[#76C84F]",
  done: "text-[#76C84F]",
  return: "text-[#F26A4B]",
};

const statusLabelsByColumnId: Record<BoardColumnData["id"], string> = {
  new: "Новый",
  progress: "В работе",
  picked: "Собраны",
  delivery: "Доставка",
  done: "Завершение",
  return: "Возврат",
};

const columnIdByOrderStatus: Record<AdminOrderStatus, BoardColumnData["id"]> = {
  pending: "new",
  assembling: "progress",
  ready: "picked",
  delivery: "delivery",
  completing: "done",
  completed: "done",
  cancelled: "return",
};

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("ru-RU")} ${currency}`;
  }
}

function formatOrderCount(count: number) {
  const noun =
    count % 10 === 1 && count % 100 !== 11
      ? "заказ"
      : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)
        ? "заказа"
        : "заказов";

  return `${count} ${noun}`;
}

function formatItemCount(count: number) {
  const noun =
    count % 10 === 1 && count % 100 !== 11
      ? "товар"
      : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)
        ? "товара"
        : "товаров";

  return `${count} ${noun}`;
}

function getOrderAddress(order: AdminOrder) {
  if (order.addressSnapshot.fullAddress?.trim()) {
    return order.addressSnapshot.fullAddress.trim();
  }

  const addressParts = [
    order.addressSnapshot.streetType,
    order.addressSnapshot.street,
    order.addressSnapshot.house,
  ].filter(Boolean);

  return addressParts.join(" ") || order.addressSnapshot.city || "Адрес не указан";
}

function mapOrderToCard(order: AdminOrder): OrderCardData {
  const tone = order.isCancelled ? "return" : boardColumnTemplate.find(
    (column) => column.id === (order.isCancelled ? "return" : columnIdByOrderStatus[order.status]),
  )?.tone ?? "progress";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const columnId = order.isCancelled ? "return" : columnIdByOrderStatus[order.status];

  return {
    cardId: `order-${order.id}`,
    id: order.id,
    customer: order.shop.name,
    address: getOrderAddress(order),
    total: formatCurrency(order.totalPrice, order.currency),
    items: formatItemCount(itemCount),
    status: statusLabelsByColumnId[columnId],
    tone,
  };
}

function OrdersHeader() {
  return (
    <div className="flex w-full items-center gap-8 overflow-x-auto">
      <h1 className="shrink-0 text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Заказы
      </h1>
      <div className="flex min-w-max items-center gap-7">
        {tabs.map((tab) => {
          const isActive = tab.id === "active";

          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              className={cn(
                "rounded-full px-4 py-2 text-[14px] font-semibold transition",
                isActive
                  ? "bg-[#55CB00] text-[#FFFFFF] shadow-[0_8px_18px_rgba(85,203,0,0.26)]"
                  : tab.disabled
                    ? "cursor-default text-[#23263A]/60"
                    : "text-[#23263A]/60 hover:text-[#111322]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: SummaryCardData) {
  return (
    <div className="w-[156px] shrink-0 rounded-[18px] border border-[#ECECF3] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(17,19,34,0.04)]">
      <div className="mb-2 flex items-center gap-2 text-[#A0A5B5]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        <span className="whitespace-nowrap text-[12px] font-medium">{label}</span>
      </div>
      <p className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.03em] text-[#1A1D29]">{value}</p>
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: OrderCardData;
}) {
  return (
    <article className="rounded-[16px] border border-[#E9E9F1] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(17,19,34,0.04)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[16px] font-extrabold tracking-[-0.03em] text-[#36394A]">№ {order.id}</span>
        <span className={cn("text-[15px] font-bold", toneClassNames[order.tone])}>{order.status}</span>
      </div>
      <div className="space-y-2 text-[14px] leading-[1.25] text-[#4B5062]">
        <p className="font-semibold text-[#575C6D]">{order.customer}</p>
        <p>{order.address}</p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 text-[13px] text-[#9CA2B3]">
        <span className="text-[20px] font-bold tracking-[-0.03em] text-[#45495C]">{order.total}</span>
        <span>{order.items}</span>
      </div>
    </article>
  );
}

function BoardColumn({
  column,
}: {
  column: BoardColumnData;
}) {
  return (
    <div className="flex min-w-[230px] flex-1 flex-col rounded-[18px] bg-[#F2F2F8] p-1">
      <div className="flex items-center gap-2 px-3 py-3">
        <h2 className="text-[14px] font-semibold text-[#52576A]">{column.title}</h2>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111322] px-1.5 text-[11px] font-semibold text-white">
          {column.orders.length}
        </span>
      </div>
      <div className="flex min-h-[540px] flex-1 flex-col gap-3 rounded-[16px] bg-[#F7F7FB] p-2">
        {column.orders.map((order) => (
          <OrderCard key={order.cardId} order={order} />
        ))}
      </div>
    </div>
  );
}

export function OrdersBoard() {
  const { orders, meta, loading, error } = useAdminOrders({
    page: 1,
    pageSize: 100,
  });

  const header = <OrdersHeader />;

  const columns = useMemo<BoardColumnData[]>(() => {
    const groupedOrders = new Map<BoardColumnData["id"], OrderCardData[]>();

    boardColumnTemplate.forEach((column) => {
      groupedOrders.set(column.id, []);
    });

    orders.forEach((order) => {
      const columnId = order.isCancelled ? "return" : columnIdByOrderStatus[order.status];
      groupedOrders.get(columnId)?.push(mapOrderToCard(order));
    });

    return boardColumnTemplate.map((column) => ({
      ...column,
      orders: groupedOrders.get(column.id) ?? [],
    }));
  }, [orders]);

  const summaryCards = useMemo<SummaryCardData[]>(() => {
    return [
      { id: "active", label: "Активные", value: formatOrderCount(meta.total), icon: ClipboardList },
      { id: "new", label: "Новые", value: formatOrderCount(columns[0]?.orders.length ?? 0), icon: Package },
      { id: "progress", label: "В работе", value: formatOrderCount(columns[1]?.orders.length ?? 0), icon: Package },
      { id: "picked", label: "Собраны", value: formatOrderCount(columns[2]?.orders.length ?? 0), icon: Package },
      { id: "delivery", label: "Доставка", value: formatOrderCount(columns[3]?.orders.length ?? 0), icon: Truck },
      { id: "done", label: "Завершение", value: formatOrderCount(columns[4]?.orders.length ?? 0), icon: Package },
      { id: "cancelled", label: "Отмены", value: formatOrderCount(columns[5]?.orders.length ?? 0), icon: Truck },
    ];
  }, [columns, meta.total]);

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 overflow-hidden p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#ECECF3] bg-white px-4 py-4 shadow-[0_16px_50px_rgba(17,19,34,0.05)]">
          <div className="flex flex-wrap items-start gap-4 border-b border-[#EFEFF5] pb-5">
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.id} {...card} />
              ))}
            </div>

            <div className="relative ml-auto shrink-0">
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium text-[#4B5062]"
                style={{ backgroundColor: "rgba(238, 238, 244, 0.5)" }}
              >
                Активные
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-auto pt-5">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Spinner size={28} />
              </div>
            ) : error ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-[18px] bg-[#F7F7FB] px-6 text-center text-[15px] text-[#6F748B]">
                {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-[18px] bg-[#F7F7FB] px-6 text-center text-[15px] text-[#6F748B]">
                Активных заказов нет
              </div>
            ) : (
              <div className="flex min-h-max min-w-max items-start gap-3">
                {columns.map((column) => (
                  <BoardColumn key={column.id} column={column} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
