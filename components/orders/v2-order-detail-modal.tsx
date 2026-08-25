"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Phone, MapPin, User, Package, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/theme";
import { useV2PanelOrder } from "@/components/hooks/useV2PanelOrder";
import type { V2PanelOrderDetailDto } from "@/types/v2-panel-order.dto";
import { OrderStatus } from "@/types/panel-orders.dto";

interface V2OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalState = "pending" | "assembling" | "ready" | "editing";

function formatCurrency(amount: number, currency: string = ""): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "KGS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Ожидание",
    [OrderStatus.ASSEMBLING]: "Сборка",
    [OrderStatus.READY]: "Заказ собран",
    [OrderStatus.DELIVERY]: "Доставка",
    [OrderStatus.COMPLETING]: "Завершение",
    [OrderStatus.COMPLETED]: "Завершен",
    [OrderStatus.CANCELLED]: "Отменен",
  };
  return labels[status] || status;
}

function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "#55CB00",
    [OrderStatus.ASSEMBLING]: "#FFC400",
    [OrderStatus.READY]: "#55CB00",
    [OrderStatus.DELIVERY]: "#478EFF",
    [OrderStatus.COMPLETING]: "#FFC400",
    [OrderStatus.COMPLETED]: "#55CB00",
    [OrderStatus.CANCELLED]: "#F5462C",
  };
  return colors[status] || "#55CB00";
}

export function V2OrderDetailModal({ orderId, onClose, onSuccess }: V2OrderDetailModalProps) {
  const { fetchOrderDetail, acceptOrder, cancelOrder, assembleOrder, addItem, updateItem, deleteItem } = useV2PanelOrder();

  const [order, setOrder] = useState<V2PanelOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);

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

  const modalState: ModalState = order?.isCancelled ? "ready" :
    order?.status === OrderStatus.PENDING ? "pending" :
    order?.status === OrderStatus.ASSEMBLING ? "assembling" :
    order?.status === OrderStatus.READY ? "ready" : "ready";

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
      const updated = await cancelOrder(order.id, { cancelDescription: cancelReason });
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
      const updated = await updateItem(order.id, itemId, { quantity: newQuantity });
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
        <Loader2 className="h-8 w-8 animate-spin text-white" />
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

  const statusColor = getStatusColor(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09091D]/50 p-4">
      <div className="relative flex h-full w-full max-w-[600px] flex-col rounded-[24px] bg-[#EEEEF4] shadow-[-16px_0_50px_rgba(9,9,29,0.12)]">
        <div className="flex items-center justify-between border-b border-[#DCDCE6] bg-white px-6 py-4 rounded-t-[24px]">
          <div>
            <h2 className="text-xl font-semibold text-[#09091D]">Заказ №{order.dailyOrderNumber}</h2>
            <p className="text-sm text-[#8F90A7]">ID {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F8F8FA] transition hover:bg-[#EDEDF4]"
          >
            <X size={18} color="#09091D" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex h-[34px] items-center rounded-full px-3 text-sm font-medium text-white" style={{ backgroundColor: statusColor }}>
                {getStatusLabel(order.status)}
              </span>
              <span className="inline-flex h-[34px] items-center rounded-full bg-[#F8F8FA] px-3 text-sm text-[#0E0F27]">
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="mt-0.5 text-[#8F90A7]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0E0F27]">
                    {order.user.firstName || ""} {order.user.lastName || ""}
                  </p>
                  <p className="text-sm text-[#8F90A7]">{order.user.phone || ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[#8F90A7]" />
                <div className="flex-1">
                  <p className="text-sm text-[#0E0F27]">
                    {order.addressSnapshot.fullAddress || "Адрес не указан"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8F90A7]">Оплата:</span>
                <span className="font-medium text-[#0E0F27]">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-[#09091D] mb-3">Товары</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-[#DCDCE6] last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0E0F27]">{item.productName}</p>
                    <p className="text-xs text-[#8F90A7]">
                      {item.productWeight} {item.productMeasure}
                    </p>
                  </div>

                  {modalState === "assembling" ? (
                    <div className="flex items-center gap-2">
                      {editingItem === item.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={actionLoading === `update-${item.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F8FA] transition hover:bg-[#EDEDF4]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={actionLoading === `update-${item.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F8FA] transition hover:bg-[#EDEDF4]"
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#0E0F27]">{item.quantity} шт</span>
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
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#0E0F27]">{item.quantity} шт</p>
                      <p className="text-sm text-[#8F90A7]">{formatCurrency(item.priceAtOrderTime, order.targetCurrency)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {modalState === "assembling" && (
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DCDCE6] px-4 py-2 text-sm text-[#8F90A7] transition hover:border-[#55CB00] hover:text-[#55CB00]">
                <Plus size={16} />
                Добавить товар
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-[#09091D] mb-3">Итого</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8F90A7]">Товары:</span>
                <span className="text-[#0E0F27]">{formatCurrency(order.subtotalPrice, order.targetCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F90A7]">Доставка:</span>
                <span className="text-[#0E0F27]">{formatCurrency(order.deliveryCost, order.targetCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F90A7]">Сервисный сбор:</span>
                <span className="text-[#0E0F27]">{formatCurrency(order.serviceFee, order.targetCurrency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Скидка:</span>
                  <span>−{formatCurrency(order.discountAmount, order.targetCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#DCDCE6] pt-2 text-base font-semibold">
                <span>Итого:</span>
                <span>{formatCurrency(order.totalPrice, order.targetCurrency)}</span>
              </div>
            </div>
          </div>

          {order.logs.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#09091D] mb-3">История</h3>
              <div className="space-y-2">
                {order.logs.map((log) => (
                  <div key={log.id} className="text-xs pb-2 border-b border-[#DCDCE6] last:border-0 last:pb-0">
                    <p className="font-medium text-[#0E0F27]">{log.action}</p>
                    <p className="text-[#8F90A7]">
                      {log.userName || "Система"} • {formatDate(log.createdAt)}
                    </p>
                    {log.reason && <p className="mt-1 text-[#8F90A7]">Причина: {log.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.comment && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#09091D] mb-2">Комментарий клиента</h3>
              <p className="text-sm text-[#0E0F27] whitespace-pre-line">{order.comment}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[#DCDCE6] bg-white px-6 py-4 rounded-b-[24px]">
          {modalState === "pending" && (
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading === "accept"}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#44A800] disabled:opacity-50"
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
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Отклонить
              </button>
            </>
          )}

          {modalState === "assembling" && (
            <>
              <button
                onClick={handleAssemble}
                disabled={actionLoading === "assemble"}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#44A800] disabled:opacity-50"
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
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Отменить заказ
              </button>
            </>
          )}

          {modalState === "ready" && (
            <>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#55CB00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#44A800]"
              >
                Редактировать
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Отменить заказ
              </button>
            </>
          )}
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
              className="w-full rounded-xl border border-[#DCDCE6] px-4 py-3 text-sm text-[#0E0F27] placeholder:text-[#8F90A7] focus:border-[#55CB00] focus:outline-none resize-none"
              rows={4}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex flex-1 items-center justify-center rounded-xl bg-[#F8F8FA] px-4 py-3 text-sm font-semibold text-[#0E0F27] transition hover:bg-[#EDEDF4]"
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
