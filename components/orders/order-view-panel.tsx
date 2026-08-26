"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/theme";
import { getImageUrl } from "@/lib/utils";
import { useV2PanelOrder } from "@/components/hooks/useV2PanelOrder";
import type { V2PanelOrderDetailDto } from "@/types/v2-panel-order.dto";
import { OrderStatus } from "@/types/panel-orders.dto";
import { getOrderLogActionTranslation } from "@/types/order-log.dto";

interface OrderViewPanelProps {
  orderId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = "info" | "logs";
type EditMode = boolean;

function formatCurrency(amount: number, currency: string = ""): string {
  const currencySymbols: Record<string, string> = {
    RUB: "₽",
    KZT: "₸",
  };
  const symbol = currencySymbols[currency] || currency;
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)} ${symbol}`;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${time}`;
}

function formatAddress(address: {
  fullAddress?: string | null;
  streetType?: string | null;
  street?: string | null;
  house?: string | null;
  flat?: number | null;
}): string {
  if (address.fullAddress) return address.fullAddress;

  const parts = [
    address.streetType,
    address.street,
    address.house ? `д. ${address.house}` : null,
    address.flat ? `кв. ${address.flat}` : null,
  ].filter(Boolean);

  return parts.join(" ") || "Адрес не указан";
}

function getPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    cash: "Наличными",
    card: "Картой",
    online: "Онлайн",
  };
  return methods[method] || method;
}

function getStatusTranslation(status: OrderStatus): string {
  const translations: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Ожидание",
    [OrderStatus.ASSEMBLING]: "Сборка",
    [OrderStatus.READY]: "Готов к выдаче",
    [OrderStatus.DELIVERY]: "Доставка",
    [OrderStatus.COMPLETING]: "Завершение",
    [OrderStatus.COMPLETED]: "Завершен",
    [OrderStatus.CANCELLED]: "Отменен",
  };
  return translations[status] || status;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  canEdit: boolean;
  showActions: boolean;
  primaryAction?: string;
  secondaryAction?: string;
}

function getStatusConfig(
  status: OrderStatus,
  isCancelled: boolean,
): StatusConfig {
  if (isCancelled) {
    return {
      label: "Отменен",
      color: "#F5462C",
      bgColor: "#FEF2F2",
      icon: <XCircle size={24} color="#F5462C" />,
      canEdit: false,
      showActions: false,
    };
  }

  switch (status) {
    case OrderStatus.PENDING:
      return {
        label: "Ожидание",
        color: "#1976D2",
        bgColor: "#E3F2FD",
        icon: (
          <img src="v2-files/order-pending.svg" alt="" width={30} height={30} />
        ),
        canEdit: false,
        showActions: true,
        primaryAction: "accept",
        secondaryAction: "cancel",
      };
    case OrderStatus.ASSEMBLING:
      return {
        label: "Сборка",
        color: "#FF9800",
        bgColor: "#FFF3E0",
        icon: (
          <img
            src="v2-files/order-assembling.svg"
            alt=""
            width={30}
            height={30}
          />
        ),
        canEdit: true,
        showActions: true,
        primaryAction: "assemble",
        secondaryAction: "cancel",
      };
    case OrderStatus.READY:
      return {
        label: "Заказ собран",
        color: "#55CB00",
        bgColor: "#E8F5E9",
        icon: <CheckCircle2 size={24} color="#55CB00" />,
        canEdit: false,
        showActions: true,
        primaryAction: "edit",
        secondaryAction: "cancel",
      };
    default:
      return {
        label: "Обрабатывается",
        color: "#8E8E93",
        bgColor: "#F5F5F7",
        icon: <Loader2 size={24} color="#8E8E93" />,
        canEdit: false,
        showActions: false,
      };
  }
}

export function OrderViewPanel({
  orderId,
  onClose,
  onSuccess,
}: OrderViewPanelProps) {
  const {
    fetchOrderDetail,
    acceptOrder,
    cancelOrder,
    assembleOrder,
    updateItem,
    deleteItem,
  } = useV2PanelOrder();

  const [order, setOrder] = useState<V2PanelOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [editMode, setEditMode] = useState<EditMode>(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
      setEditMode(false);
    } catch (err: any) {
      if (err.message?.includes("403")) {
        setError("У вас нет прав для управления заказом этого магазина");
      } else {
        setError(err.message || "Ошибка при загрузке заказа");
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, fetchOrderDetail]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAccept = async () => {
    if (!order) return;
    try {
      setActionLoading("accept");
      const updated = await acceptOrder(order.id);
      setOrder(updated);
      onSuccess?.();
    } catch (err: any) {
      if (err.message?.includes("403")) {
        setError("У вас нет прав для управления заказом этого магазина");
      } else {
        setError(err.message || "Ошибка при принятии заказа");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!order || !cancelReason.trim()) return;
    try {
      setActionLoading("cancel");
      const updated = await cancelOrder(order.id, {
        cancelDescription: cancelReason,
      });
      setOrder(updated);
      setShowCancelModal(false);
      setCancelReason("");
      onSuccess?.();
    } catch (err: any) {
      if (err.message?.includes("403")) {
        setError("У вас нет прав для управления заказом этого магазина");
      } else {
        setError(err.message || "Ошибка при отмене заказа");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssemble = async () => {
    if (!order) return;
    try {
      setActionLoading("assemble");
      const updated = await assembleOrder(order.id);
      setOrder(updated);
      onSuccess?.();
    } catch (err: any) {
      if (err.message?.includes("403")) {
        setError("У вас нет прав для управления заказом этого магазина");
      } else {
        setError(err.message || "Ошибка при завершении сборки");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!order) return;
    try {
      setActionLoading(`delete-${itemId}`);
      const updated = await deleteItem(order.id, itemId);
      setOrder(updated);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Ошибка при удалении товара");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (!order || newQuantity < 1) return;
    try {
      setActionLoading(`update-${itemId}`);
      const updated = await updateItem(order.id, itemId, {
        quantity: newQuantity,
      });
      setOrder(updated);
      setEditingItem(null);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Ошибка при обновлении количества");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09091D]/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09091D]/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <p className="text-red-500">{error || "Заказ не найден"}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-[#55CB00] px-4 py-2 text-white transition hover:bg-[#44A800]"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status, order.isCancelled);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isEditMode = editMode || statusConfig.canEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09091D]/50 p-4">
      <div className="relative flex h-full w-full max-w-5xl flex-col rounded-2xl bg-[#F5F5F7] overflow-hidden shadow-2xl">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="w-[70%] min-w-0 border-r border-[#E5E5EA] bg-[#F5F5F7]">
            <div className="flex h-full flex-col p-6">
              <h3 className="mb-4 text-sm font-medium text-[#8E8E93]">
                Список товаров
              </h3>

              <div className="flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-4 p-4">
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-[#F5F5F7] overflow-hidden">
                          {item.photos && item.photos[0] ? (
                            <img
                              src={getImageUrl(item.photos[0])}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#C7C7CC]">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col">
                          <p className="text-sm font-medium text-[#09091D] line-clamp-2">
                            {item.productName}
                          </p>
                        </div>

                        {isEditMode ? (
                          <div className="flex items-center gap-2">
                            {editingItem === item.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      Math.max(1, item.quantity - 1),
                                    )
                                  }
                                  disabled={
                                    actionLoading === `update-${item.id}`
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F7] transition hover:bg-[#E5E5EA]"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={
                                    actionLoading === `update-${item.id}`
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F7] transition hover:bg-[#E5E5EA]"
                                >
                                  <Plus size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingItem(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F7] transition hover:bg-[#E5E5EA]"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => setEditingItem(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F7] transition hover:bg-[#E5E5EA]"
                                >
                                  <Plus size={14} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={actionLoading === `delete-${item.id}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 transition hover:bg-red-200 text-red-500"
                            >
                              {actionLoading === `delete-${item.id}` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-[#09091D]">
                              {formatCurrency(
                                item.quantity * item.priceAtOrderTime,
                                order.targetCurrency,
                              )}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-[#8E8E93]">
                                {item.quantity} шт.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {index < order.items.length - 1 && (
                        <div className="mx-4 border-t border-[#E5E5EA]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E5EA] px-4 py-3 bg-[#FAFAFC]">
                  <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                    <ShoppingBag size={16} />
                    <span>
                      {totalItems} товар{totalItems > 1 ? "а" : ""}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#8E8E93]">Итого:</span>
                    <span className="ml-2 font-semibold text-[#09091D]">
                      {formatCurrency(
                        order.subtotalPrice,
                        order.targetCurrency,
                      )}
                    </span>
                  </div>
                </div>

                {isEditMode && (
                  <div className="border-t border-[#E5E5EA] p-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E5EA] px-4 py-2 text-sm text-[#8E8E93] transition hover:border-[#55CB00] hover:text-[#55CB00]">
                      <Plus size={16} />
                      Добавить товар
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-[30%] min-w-0 bg-white">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#E5E5EA] px-6 py-4">
                <h2 className="text-md text-gray-400">
                  Детали заказа, ID {order.id}
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] transition hover:bg-[#E5E5EA]"
                >
                  <X size={18} color="#09091D" />
                </button>
              </div>

              <div className="flex border-b border-[#E5E5EA]">
                <button
                  onClick={() => setActiveTab("info")}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors relative",
                    activeTab === "info"
                      ? "text-[#55CB00]"
                      : "text-[#8E8E93] hover:text-[#09091D]",
                  )}
                >
                  Информация
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#55CB00]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-medium transition-colors relative",
                    activeTab === "logs"
                      ? "text-[#55CB00]"
                      : "text-[#8E8E93] hover:text-[#09091D]",
                  )}
                >
                  Журнал
                  {activeTab === "logs" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#55CB00]" />
                  )}
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {activeTab === "info" ? (
                  <div className="p-6 space-y-6">
                    <div className="flex flex-col text-center">
                      <div className="flex shrink-0 rounded-full mb-3">
                        {statusConfig.icon}
                      </div>
                      <div className="w-full">
                        <h3 className="text-lg text-left font-semibold text-[#09091D]">
                          {order.status === OrderStatus.PENDING
                            ? `Принять заказ, №${order.dailyOrderNumber}`
                            : order.status === OrderStatus.ASSEMBLING
                              ? `Сборка заказа, №${order.dailyOrderNumber}`
                              : order.status === OrderStatus.READY
                                ? `Заказ собран, №${order.dailyOrderNumber}`
                                : `Заказ №${order.dailyOrderNumber}`}
                        </h3>
                        <p className="mt-1 text-left text-sm text-[#8E8E93]">
                          {order.status === OrderStatus.PENDING
                            ? "Проверьте состав корзины, адрес и комментарий клиента перед началом сборки."
                            : order.status === OrderStatus.ASSEMBLING
                              ? "Соберите заказ. При отсутствии товаров или изменении цены согласуйте корректировки с клиентом"
                              : order.status === OrderStatus.READY
                                ? "Заказ готов к выдаче клиенту."
                                : "Заказ обрабатывается."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-3 py-1.5 text-sm text-[#8E8E93]">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    {order.isCancelled && (
                      <div className="rounded-xl bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-600">
                          Заказ отменен
                        </p>
                        <p className="mt-1 text-sm text-red-500">
                          {order.cancelDescription &&
                            `Причина: ${order.cancelDescription}`}
                          {order.canceledBy &&
                            ` • Отменено: ${order.canceledBy}`}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 border-b py-3">
                      <img
                        src="v2-files/order-money.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                      <span className="text-sm text-[#09091D]">
                        {getPaymentMethod(order.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b pb-3">
                      <MapPin size={20} className="mt-0.5 text-[#8E8E93]" />
                      <div className="flex-1">
                        <p className="text-sm text-[#09091D]">
                          {formatAddress(order.addressSnapshot)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User size={20} color="#8E8E93" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#09091D]">
                            {order.user.firstName} {order.user.lastName || ""}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${order.user.phone}`}
                        className="flex items-center gap-3 text-sm text-[#1976D2] hover:underline  border-b pb-3"
                      >
                        <Phone size={20} />
                        {order.user.phone}
                      </a>
                    </div>

                    <div className="flex flex-col items-start rounded-xl">
                      <div className="flex items-center w-full justify-between">
                        <p className="text-sm text-gray-400">Комментарий</p>
                        <MessageSquare
                          size={20}
                          className="mt-0.5 text-[#8E8E93]"
                        />
                      </div>
                      <div className="pt-5">
                        <p className="text-sm text-[#09091D] whitespace-pre-line">
                          {order.comment ? order.comment : "Нету комментариев"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {order.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col pb-4 border-b border-[#E5E5EA] last:border-0"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-[#8E8E93]">{formatDateTime(log.createdAt)}</span>
                              <span className="text-xs text-[#8E8E93]">,</span>
                              <p className="text-sm font-medium text-[#09091D]">
                                {getOrderLogActionTranslation(log.action as any)}
                              </p>
                            </div>
                            <div className="text-xs text-[#8E8E93] whitespace-nowrap">
                              {log.userName || "Система"}
                            </div>
                          </div>
                        </div>
                        {order.isCancelled && log.reason && (
                          <p className="mt-2 text-xs text-[#8E8E93]">
                            Причина: {log.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {statusConfig.showActions && (
                <div className="flex flex-col gap-3 border-t border-[#E5E5EA] px-6 py-4 bg-white">
                  {statusConfig.primaryAction === "accept" && (
                    <button
                      onClick={handleAccept}
                      disabled={actionLoading === "accept"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#44A800] disabled:opacity-50"
                    >
                      {actionLoading === "accept" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        "Принять заказ"
                      )}
                    </button>
                  )}

                  {statusConfig.primaryAction === "assemble" && (
                    <button
                      onClick={handleAssemble}
                      disabled={actionLoading === "assemble"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#44A800] disabled:opacity-50"
                    >
                      {actionLoading === "assemble" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        "Завершить сборку"
                      )}
                    </button>
                  )}

                  {statusConfig.primaryAction === "edit" &&
                    order.status === OrderStatus.READY && (
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#44A800]"
                      >
                        {editMode ? "Отменить редактирование" : "Редактировать"}
                      </button>
                    )}

                  {statusConfig.secondaryAction === "cancel" && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition",
                        order.status === OrderStatus.PENDING
                          ? "bg-[#F5F5F7] text-[#09091D] hover:bg-[#E5E5EA]"
                          : "bg-red-500 text-white hover:bg-red-600",
                      )}
                    >
                      {order.status === OrderStatus.PENDING
                        ? "Отклонить заказ"
                        : "Отменить заказ"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#09091D]/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#09091D] mb-4">
              Причина отмены
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Укажите причину отмены заказа..."
              className="w-full rounded-xl border border-[#E5E5EA] px-4 py-3 text-sm text-[#09091D] placeholder:text-[#8E8E93] focus:border-[#55CB00] focus:outline-none resize-none"
              rows={4}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex flex-1 items-center justify-center rounded-xl bg-[#F5F5F7] px-4 py-3 text-sm font-semibold text-[#09091D] transition hover:bg-[#E5E5EA]"
              >
                Отмена
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || actionLoading === "cancel"}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading === "cancel" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Отмена...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
