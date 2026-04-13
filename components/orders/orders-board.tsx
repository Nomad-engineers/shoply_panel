"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleDollarSign, ClipboardList, CreditCard, Package, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { cn } from "@/lib/theme";

type PeriodOption = "День" | "Неделя" | "Месяц";
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

const summaryCards: SummaryCardData[] = [
  { id: "active", label: "Активные", value: "12 заказов", icon: ClipboardList },
  { id: "finished", label: "Завершены", value: "5 заказа", icon: Package },
  { id: "cancelled", label: "Отмены", value: "2 заказа", icon: Truck },
  { id: "total", label: "Всего", value: "17 заказов", icon: Package },
  { id: "revenue", label: "Выручка", value: "15 750 ₽", icon: CircleDollarSign },
  { id: "fee", label: "Доход", value: "1 575 ₽", icon: CreditCard },
  { id: "payout", label: "Выплаты", value: "1 930 ₽", icon: CircleDollarSign },
];

const initialBoardColumns: BoardColumnData[] = [
  {
    id: "new",
    title: "Новые заказы",
    tone: "new",
    orders: [
      {
        cardId: "new-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Новый",
        tone: "new",
      },
    ],
  },
  {
    id: "progress",
    title: "В работе",
    tone: "progress",
    orders: [
      {
        cardId: "progress-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "В работе",
        tone: "progress",
      },
      {
        cardId: "progress-64-2",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "В работе",
        tone: "progress",
      },
    ],
  },
  {
    id: "picked",
    title: "Собраны",
    tone: "picked",
    orders: [
      {
        cardId: "picked-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Собраны",
        tone: "picked",
      },
    ],
  },
  {
    id: "delivery",
    title: "На доставке",
    tone: "delivery",
    orders: [
      {
        cardId: "delivery-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Доставка",
        tone: "delivery",
      },
      {
        cardId: "delivery-64-2",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Доставка",
        tone: "delivery",
      },
      {
        cardId: "delivery-picked-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Собраны",
        tone: "picked",
      },
    ],
  },
  {
    id: "done",
    title: "Завершены",
    tone: "done",
    orders: [
      {
        cardId: "done-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Завершен",
        tone: "done",
      },
      {
        cardId: "done-64-2",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Завершен",
        tone: "done",
      },
    ],
  },
  {
    id: "return",
    title: "Возврат",
    tone: "return",
    orders: [
      {
        cardId: "return-64-1",
        id: 64,
        customer: "Болашак",
        address: "Королева 25, кв 28",
        total: "1 750 ₽",
        items: "12 товар",
        status: "Возврат",
        tone: "return",
      },
    ],
  },
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
  done: "Завершен",
  return: "Возврат",
};

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
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  order: OrderCardData;
  onDragStart: (order: OrderCardData) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(order)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-[16px] border border-[#E9E9F1] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(17,19,34,0.04)]",
        isDragging && "scale-[0.98] opacity-60",
      )}
    >
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
  onDragStart,
  onDropOrder,
  onDragEnd,
  onDragEnterColumn,
  isDropTarget,
  draggingCardId,
}: {
  column: BoardColumnData;
  onDragStart: (order: OrderCardData, columnId: string) => void;
  onDropOrder: (columnId: string) => void;
  onDragEnd: () => void;
  onDragEnterColumn: (columnId: string) => void;
  isDropTarget: boolean;
  draggingCardId: string | null;
}) {
  return (
    <div className="flex min-w-[230px] flex-1 flex-col rounded-[18px] bg-[#F2F2F8] p-1">
      <div className="flex items-center gap-2 px-3 py-3">
        <h2 className="text-[14px] font-semibold text-[#52576A]">{column.title}</h2>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111322] px-1.5 text-[11px] font-semibold text-white">
          {column.orders.length}
        </span>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDragEnter={() => onDragEnterColumn(column.id)}
        onDrop={(event) => {
          event.preventDefault();
          onDropOrder(column.id);
        }}
        className={cn(
          "flex min-h-[540px] flex-1 flex-col gap-3 rounded-[16px] bg-[#F7F7FB] p-2",
          isDropTarget && "bg-[#EDF8E8] ring-2 ring-[#55CB00]/35",
        )}
      >
        {column.orders.map((order) => (
          <OrderCard
            key={order.cardId}
            order={order}
            onDragStart={(dragOrder) => onDragStart(dragOrder, column.id)}
            onDragEnd={onDragEnd}
            isDragging={draggingCardId === order.cardId}
          />
        ))}
      </div>
    </div>
  );
}

export function OrdersBoard() {
  const [periodLabel, setPeriodLabel] = useState<PeriodOption>("Месяц");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [columns, setColumns] = useState(initialBoardColumns);
  const [dragState, setDragState] = useState<{
    order: OrderCardData;
    sourceColumnId: string;
  } | null>(null);
  const [dropColumnId, setDropColumnId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const header = <OrdersHeader />;

  const handleDragStart = (order: OrderCardData, sourceColumnId: string) => {
    setDragState({ order, sourceColumnId });
  };

  const handleDropOrder = (targetColumnId: string) => {
    if (!dragState) {
      return;
    }

    const { order, sourceColumnId } = dragState;

    if (sourceColumnId === targetColumnId) {
      setDragState(null);
      setDropColumnId(null);
      return;
    }

    setColumns((currentColumns) =>
      currentColumns.map((column) => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            orders: column.orders.filter((item) => item.cardId !== order.cardId),
          };
        }

        if (column.id === targetColumnId) {
          return {
            ...column,
            orders: [
              ...column.orders,
              {
                ...order,
                tone: column.tone,
                status: statusLabelsByColumnId[column.id],
              },
            ],
          };
        }

        return column;
      }),
    );

    setDragState(null);
    setDropColumnId(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDropColumnId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPeriodOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col p-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#ECECF3] bg-white px-4 py-4 shadow-[0_16px_50px_rgba(17,19,34,0.05)]">
          <div className="flex flex-wrap items-start gap-4 border-b border-[#EFEFF5] pb-5">
            <div className="flex min-w-0 flex-1 flex-wrap gap-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.id} {...card} />
              ))}
            </div>

            <div className="relative ml-auto shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsPeriodOpen((current) => !current)}
                className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: "rgba(238, 238, 244, 0.5)" }}
              >
                {periodLabel}
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    isPeriodOpen && "rotate-180",
                  )}
                />
              </button>

              {isPeriodOpen && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-lg">
                  {(["День", "Неделя", "Месяц"] as PeriodOption[]).map((option) => {
                    const isActive = option === periodLabel;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setPeriodLabel(option);
                          setIsPeriodOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50",
                          isActive
                            ? "bg-green-50 font-medium text-[#55CB00]"
                            : "text-gray-700",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden pt-5">
            <div className="flex min-h-full min-w-max gap-3">
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  onDragStart={handleDragStart}
                  onDropOrder={handleDropOrder}
                  onDragEnd={handleDragEnd}
                  onDragEnterColumn={(columnId) => {
                    if (dragState) {
                      setDropColumnId(columnId);
                    }
                  }}
                  isDropTarget={dropColumnId === column.id}
                  draggingCardId={dragState?.order.cardId ?? null}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
