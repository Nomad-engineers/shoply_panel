"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Phone, MapPin, User, ShoppingBag, Clock, CreditCard, MessageSquare } from "lucide-react";
import { cn } from "@/lib/theme";
import { useV2PanelOrder } from "@/components/hooks/useV2PanelOrder";
import type { V2PanelOrderDetailDto } from "@/types/v2-panel-order.dto";

interface PendingOrderDetailModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = "info" | "logs";

function formatCurrency(amount: number, currency: string = ""): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "KGS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const day = isToday ? "Сегодня" : date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return `${time}, ${day}`;
}

function formatAddress(address: {
  streetType?: string | null;
  street?: string | null;
  house?: string | null;
  flat?: number | null;
}): string {
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

export function PendingOrderDetailModal({ orderId, onClose, onSuccess }: PendingOrderDetailModalProps) {
  const { fetchOrderDetail, acceptOrder, cancelOrder } = useV2PanelOrder();

  const [order, setOrder] = useState<V2PanelOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
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
      onClose();
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
      const updated = await cancelOrder(order.id, { cancelDescription: cancelReason });
      setOrder(updated);
      setShowCancelModal(false);
      setCancelReason("");
      onSuccess?.();
      onClose();
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

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09091D]/50 p-4">
      <div className="relative flex h-full w-full max-w-5xl flex-col rounded-2xl bg-[#F5F5F7] overflow-hidden shadow-2xl">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="w-1/2 min-w-0 border-r border-[#E5E5EA] bg-[#F5F5F7]">
            <div className="flex h-full flex-col p-6">
              <h3 className="mb-4 text-sm font-medium text-[#8E8E93]">Список товаров</h3>

              <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-4 p-4">
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-[#F5F5F7] overflow-hidden">
                          {item.photoId ? (
                            <img
                              src={item.photoId}
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
                          <p className="text-sm font-medium text-[#09091D] line-clamp-2">{item.productName}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            {item.quantity > 1 && (
                              <span className="text-[#8E8E93]">{item.quantity} шт.</span>
                            )}
                            {item.priceAtOrderTime > 0 && (
                              <span className="text-[#8E8E93]">{formatCurrency(item.priceAtOrderTime, order.targetCurrency)} / шт.</span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-[#09091D]">
                            {formatCurrency(item.quantity * item.priceAtOrderTime, order.targetCurrency)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#8E8E93]">{item.quantity} шт.</p>
                          )}
                        </div>
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
                    <span>{totalItems} товар{totalItems > 1 ? "а" : ""}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#8E8E93]">Итого:</span>
                    <span className="ml-2 font-semibold text-[#09091D]">
                      {formatCurrency(order.subtotalPrice, order.targetCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/2 min-w-0 bg-white">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#E5E5EA] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#09091D]">
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
                      : "text-[#8E8E93] hover:text-[#09091D]"
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
                      : "text-[#8E8E93] hover:text-[#09091D]"
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
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD]">
                        <Clock size={24} color="#1976D2" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#09091D]">
                          Принять заказ, №{order.dailyOrderNumber}
                        </h3>
                        <p className="mt-1 text-sm text-[#8E8E93]">
                          Проверьте состав корзины, адрес и комментарий клиента перед началом сборки.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#E3F2FD] px-3 py-1.5 text-sm font-medium text-[#1976D2]">
                        Ожидание
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-3 py-1.5 text-sm text-[#8E8E93]">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-[#F5F5F7] px-4 py-3">
                      <CreditCard size={20} color="#8E8E93" />
                      <span className="text-sm text-[#09091D]">{getPaymentMethod(order.paymentMethod)}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="mt-0.5 text-[#8E8E93]" />
                      <div className="flex-1">
                        <p className="text-sm text-[#09091D]">{formatAddress(order.addressSnapshot)}</p>
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
                        className="flex items-center gap-3 text-sm text-[#1976D2] hover:underline"
                      >
                        <Phone size={20} />
                        {order.user.phone}
                      </a>
                    </div>

                    {order.comment && (
                      <div className="flex items-start gap-3 rounded-xl bg-[#F5F5F7] p-4">
                        <MessageSquare size={20} className="mt-0.5 text-[#8E8E93]" />
                        <div className="flex-1">
                          <p className="text-sm text-[#09091D] whitespace-pre-line">{order.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {order.logs.map((log) => (
                      <div key={log.id} className="pb-4 border-b border-[#E5E5EA] last:border-0">
                        <p className="text-sm font-medium text-[#09091D]">{log.action}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#8E8E93]">
                          <span>{log.userName || "Система"}</span>
                          <span>•</span>
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                        {log.reason && (
                          <p className="mt-2 text-xs text-[#8E8E93]">Причина: {log.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-[#E5E5EA] px-6 py-4 bg-white">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading === "accept"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#44A800] disabled:opacity-50"
                >
                  {actionLoading === "accept" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Обработка...
                    </>
                  ) : (
                    "Принять заказ"
                  )}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] px-6 py-3.5 text-sm font-semibold text-[#09091D] transition hover:bg-[#E5E5EA]"
                >
                  Отклонить заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#09091D]/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#09091D] mb-4">Причина отмены</h3>
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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
