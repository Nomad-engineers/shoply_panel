"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  ShoppingBasket,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AppShell, Main } from "@/components/layout";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/theme";
import { useAdminOrders } from "@/components/hooks/useAdminOrders";
import { useOrderSocket } from "@/components/hooks/useOrderSocket";
import { OrderViewPanel } from "./order-view-panel";
import { IconRefresh } from "./status-icons";
import {
  columnIdByOrder,
  formatCardTime,
  formatCurrency,
  getOrderAddress,
  statusStyles,
  type BoardColumnId,
} from "./order-utils";
import type { AdminOrder } from "@/types/admin-order";

const boardColumns: { id: BoardColumnId; title: string }[] = [
  { id: "new", title: "Новые заказы" },
  { id: "assembling", title: "На сборке" },
  { id: "pickup", title: "Выдача" },
  { id: "delivery", title: "На доставке" },
  { id: "done", title: "Завершенные" },
];

const SOUND_STORAGE_KEY = "orders-sound-enabled";

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    // Audio is best-effort only.
  }
}

function formatToolbarDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("ru-RU", { month: "long" });

  return `${day} ${month}, ${now.getFullYear()}`;
}

function ToolbarPill({
  children,
  onClick,
  active = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[34px] items-center gap-2 rounded-[17px] border border-[#FFFFFF80] bg-[#FFFFFF80] py-2 pl-[18px] pr-2 text-[14px] leading-[18px] text-[#0E0F27] transition hover:bg-white/90",
        !active && "opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function OrdersToolbar({
  soundEnabled,
  onToggleSound,
  onRefresh,
  refreshing,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <ToolbarPill>
          <span>Регион:</span>
          <span className="text-[#0E0F2780]">Байконур</span>
          <ChevronDown size={16} color="#0E0F27" />
        </ToolbarPill>
        <ToolbarPill>
          <span>Магазины:</span>
          <span className="text-[#0E0F2780]">Все</span>
          <ChevronDown size={16} color="#0E0F27" />
        </ToolbarPill>
        <ToolbarPill onClick={onToggleSound} active={soundEnabled}>
          {soundEnabled ? (
            <Volume2 size={18} color="#0E0F27" />
          ) : (
            <VolumeX size={18} color="#0E0F27" />
          )}
          Звуковое уведомление
        </ToolbarPill>
        <button
          type="button"
          aria-label="Обновить"
          onClick={onRefresh}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#FFFFFF80] bg-[#FFFFFF80] transition hover:bg-white/90"
        >
          <span className={cn("flex h-[18px] w-[18px] items-center justify-center", refreshing && "animate-spin")}>
            <IconRefresh />
          </span>
        </button>
      </div>
      <span className="ml-auto whitespace-nowrap text-[20px] font-semibold text-[#0E0F27]">
        {formatToolbarDate()}
      </span>
    </div>
  );
}

function CardRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] leading-[14px] text-[#0E0F27]">
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

function OrderCard({
  order,
  finished = false,
  onOpen,
}: {
  order: AdminOrder;
  finished?: boolean;
  onOpen: () => void;
}) {
  const status = statusStyles(order);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-2 rounded-[18px] p-3 text-left transition",
        finished
          ? "bg-[#FFFFFF80] hover:bg-white"
          : "bg-white hover:bg-[#FAFAFD]",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[12px] leading-[14px]">
        <span className="whitespace-nowrap text-[#0E0F2780]">
          № {order.dailyOrderNumber}, {formatCardTime(order.createdAt)}
        </span>
        <span className="whitespace-nowrap text-[#0E0F27]">
          {formatCurrency(order.totalPrice, order.currency)}
        </span>
      </div>

      <div className="h-px bg-[#DCDCE6]" />

      <CardRow icon={<ShoppingBasket size={18} color="#AAAAB8" />}>{order.shop.name}</CardRow>
      <CardRow
        icon={
          <MapPin size={18} color="#0E0F27" strokeWidth={1.75} fill="#AAAAB8" fillOpacity={0.4} />
        }
      >
        {getOrderAddress(order)}
      </CardRow>

      <div className="h-px bg-[#DCDCE6]" />

      <CardRow
        icon={
          status.icon ?? (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: status.color }}
            />
          )
        }
      >
        {status.label}
      </CardRow>
    </button>
  );
}

function BoardColumn({
  title,
  orders,
  finished = false,
  onOpen,
}: {
  title: string;
  orders: AdminOrder[];
  finished?: boolean;
  onOpen: (order: AdminOrder) => void;
}) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col gap-2.5 rounded-[18px] bg-[#09091D40] p-1">
      <header className="flex items-center gap-2.5 px-3 py-2">
        <h2 className="whitespace-nowrap text-[16px] font-medium text-white">{title}</h2>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[14px] font-semibold leading-none text-[#0E0F27]">
          {orders.length}
        </span>
      </header>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-1 pt-0">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} finished={finished} onOpen={() => onOpen(order)} />
        ))}
      </div>
    </section>
  );
}

export function OrdersBoard() {
  const { orders, finishedOrders, loading, error, refetch, fetchOrder } = useAdminOrders({
    page: 1,
    pageSize: 100,
  });

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const soundEnabledRef = useRef(true);
  const knownIdsRef = useRef<Set<number>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOrderIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
    setSoundEnabled(stored);
    soundEnabledRef.current = stored;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  useEffect(() => {
    knownIdsRef.current = new Set([...orders, ...finishedOrders].map((order) => order.id));
  }, [orders, finishedOrders]);

  // Debounced drain: collapse a burst of socket events into a single refetch,
  // but only for the order ids we couldn't patch individually (or if the board
  // needs a full resync). Individual order updates go through fetchOrder and
  // never trigger the spinner.
  const debouncedRefetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      pendingOrderIdsRef.current.clear();
      refetch();
    }, 2000);
  }, [refetch]);

  useOrderSocket({
    onOrderEvent: (event) => {
      const orderId = event?.orderId;
      if (!orderId) {
        // No id in payload — fall back to full refresh.
        debouncedRefetch();
        return;
      }

      if (soundEnabledRef.current && !knownIdsRef.current.has(orderId)) {
        playBeep();
      }

      // Dedupe rapid bursts for the same order.
      if (pendingOrderIdsRef.current.has(orderId)) return;
      pendingOrderIdsRef.current.add(orderId);

      // Seamless single-order patch (no loading state).
      fetchOrder(orderId).finally(() => {
        pendingOrderIdsRef.current.delete(orderId);
      });
    },
  });

  const columns = useMemo(() => {
    const grouped = new Map<BoardColumnId, AdminOrder[]>(boardColumns.map((c) => [c.id, []]));

    orders.forEach((order) => {
      grouped.get(columnIdByOrder(order))?.push(order);
    });
    finishedOrders.forEach((order) => {
      const column = grouped.get(columnIdByOrder(order));
      if (column && !column.some((o) => o.id === order.id)) column.push(order);
    });

    return boardColumns.map((column) => ({ ...column, orders: grouped.get(column.id) ?? [] }));
  }, [orders, finishedOrders]);

  const allOrders = useMemo(() => [...orders, ...finishedOrders], [orders, finishedOrders]);
  const selectedOrder = useMemo(
    () =>
      selectedOrderId === null
        ? null
        : (allOrders.find((order) => order.id === selectedOrderId) ?? null),
    [allOrders, selectedOrderId],
  );

  return (
    <AppShell>
      <SidebarNav
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <Main className="bg-[#EDEDF4]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/wallpaper.png')" }}
          >
            <div className="mx-auto m-4 flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-6 rounded-[20px] bg-transparent p-6">
              <OrdersToolbar
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                onRefresh={refetch}
                refreshing={loading}
              />

              <div className="no-scrollbar flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto pb-1">
                {columns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    title={column.title}
                    orders={column.orders}
                    finished={column.id === "done"}
                    onOpen={(order) => setSelectedOrderId(order.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </AppShell>
  );
}
