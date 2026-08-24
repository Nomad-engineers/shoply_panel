"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Volume2 } from "lucide-react";
import { AppShell, Main, Sidebar } from "@/components/layout";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/theme";
import { usePanelOrders } from "@/components/hooks/usePanelOrders";
import { useAdminOrders } from "@/components/hooks/useAdminOrders";
import { usePanelRegions } from "@/components/hooks/usePanelRegions";
import { useAdminShops } from "@/components/hooks/useAdminShops";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { OrdersFilterPanel } from "@/components/orders/orders-filter-panel";
import { OrdersPagination } from "@/components/orders/orders-pagination";
import { PanelOrderCard } from "@/components/orders/panel-order-card";
import { transformOrdersToCards, groupCardsByColumn, type OrderCardProps } from "@/components/orders/panel-order-transformers";
import { OrderViewPanel } from "@/components/orders/order-view-panel";
import { IconRefresh } from "@/components/orders/status-icons";
import type { OrderUiStatus } from "@/components/orders/panel-order-transformers";
import type { AdminOrder } from "@/types/admin-order";

const boardColumns: { id: OrderUiStatus["columnId"]; title: string }[] = [
  { id: "new", title: "Новые заказы" },
  { id: "assembling", title: "На сборке" },
  { id: "pickup", title: "Выдача" },
  { id: "delivery", title: "На доставке" },
  { id: "done", title: "Завершенные" },
];

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
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <ToolbarPill active={false}>
        <Volume2 size={18} color="#0E0F27" />
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
      <span className="ml-auto whitespace-nowrap text-[20px] font-semibold text-[#0E0F27]">
        {formatToolbarDate()}
      </span>
    </div>
  );
}

function BoardColumn({
  title,
  cards,
  finished = false,
  onOpen,
}: {
  title: string;
  cards: OrderCardProps[];
  finished?: boolean;
  onOpen: (card: OrderCardProps) => void;
}) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col gap-2.5 rounded-[18px] bg-[#09091D40] p-1">
      <header className="flex items-center gap-2.5 px-3 py-2">
        <h2 className="whitespace-nowrap text-[16px] font-medium text-white">{title}</h2>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[14px] font-semibold leading-none text-[#0E0F27]">
          {cards.length}
        </span>
      </header>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-1 pt-0">
        {cards.map((card) => (
          <PanelOrderCard
            key={card.id}
            card={card}
            finished={finished}
            onClick={() => onOpen(card)}
          />
        ))}
      </div>
    </section>
  );
}
export default function PanelOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [selectedOrderCard, setSelectedOrderCard] = useState<OrderCardProps | null>(null);

  const filters = useMemo(() => {
    const statusParam = searchParams.get("status");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return {
      status: statusParam as any, // Will be validated by API
      regionId: searchParams.get("regionId") ? Number(searchParams.get("regionId")) : undefined,
      shopId: searchParams.get("shopId") ? Number(searchParams.get("shopId")) : undefined,
      // Always send today's date range to backend
      from: today.toISOString(),
      to: endOfDay.toISOString(),
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
    };
  }, [searchParams]);

  // Check if any non-pagination filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.status ||
        filters.regionId ||
        filters.shopId ||
        filters.from ||
        filters.to
    );
  }, [filters]);

  // Fetch orders with filters
  const {
    orders,
    meta,
    isLoading,
    error,
    refetch,
  } = usePanelOrders({
    filters,
    enabled: true,
  });

  // Legacy hook for fetching full order details
  const { orders: adminOrders, fetchOrder } = useAdminOrders({ skip: true });

  // Fetch filter data from API
  const { data: regions = [] } = usePanelRegions();
  const { data: shops = [] } = useAdminShops();

  // Get user role for filter visibility
  const { adminData } = useAuthContext();
  const userRole = adminData?.role;

  // Determine filter visibility based on role:
  // - shop_owner: no region, no shop filters
  // - operator: only shop filter
  // - admin: both region and shop filters
  const showRegionFilter = userRole === "admin";
  const showShopFilter = userRole === "admin" || userRole === "operator";

  // Get the full AdminOrder when a card is selected
  const selectedAdminOrder = useMemo(() => {
    if (!selectedOrderCard) return null;
    return adminOrders.find(order => order.id === selectedOrderCard.id) || null;
  }, [selectedOrderCard, adminOrders]);

  // Handle opening order detail view
  const handleOpenOrder = useCallback(async (card: OrderCardProps) => {
    setSelectedOrderCard(card);
    // Fetch full order details using the legacy endpoint
    await fetchOrder(card.id);
  }, [fetchOrder]);

  // Transform orders to card format
  const orderCards = useMemo(() => {
    return transformOrdersToCards(orders);
  }, [orders]);

  // Group cards by column
  const cardsByColumn = useMemo(() => {
    return groupCardsByColumn(orderCards);
  }, [orderCards]);

  // Handle filter change - updates URL
  const handleFilterChange = useCallback((queryString: string) => {
    router.push(`/orders${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router]);

  // Handle page change - updates URL
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/orders?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleClearFilters = useCallback(() => {
    router.push("/orders");
  }, [router]);

  return (
    <AppShell>
      <Sidebar isCollapsed={sidebarCollapsed}>
        <SidebarNav
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </Sidebar>
      <Main className="bg-[#EDEDF4]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/wallpaper.png')" }}
          >
            <div className="mx-auto m-4 flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-6 rounded-[20px] bg-transparent p-6">

              {/* Toolbar with sound, refresh, date */}
              <OrdersToolbar
                onRefresh={() => refetch()}
                refreshing={isLoading}
              />

              <OrdersFilterPanel
                filters={filters}
                regions={regions}
                shops={shops}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
                userRole={userRole}
                showRegionFilter={showRegionFilter}
                showShopFilter={showShopFilter}
              />

              {/* Error State */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500 p-4 text-red-500">
                  {error.message || "Ошибка при загрузке заказов"}
                </div>
              )}

              {/* Orders Board */}
              <div className="no-scrollbar flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto pb-1">
                {boardColumns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    title={column.title}
                    cards={cardsByColumn[column.id] ?? []}
                    finished={column.id === "done"}
                    onOpen={handleOpenOrder}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <OrdersPagination
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
                  totalItems={meta.totalItems}
                  itemsPerPage={meta.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </Main>

      {/* Order Detail Panel */}
      {selectedAdminOrder && (
        <OrderViewPanel
          order={selectedAdminOrder}
          onClose={() => setSelectedOrderCard(null)}
        />
      )}
    </AppShell>
  );
}
