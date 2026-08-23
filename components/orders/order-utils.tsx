import type { AdminOrder, AdminOrderStatus } from "@/types/admin-order";
import {
  IconAssembling,
  IconCancelled,
  IconCompleted,
  IconDelivery,
  IconReady,
} from "./status-icons";

export type BoardColumnId = "new" | "assembling" | "pickup" | "delivery" | "done";

export interface StatusStyle {
  label: string;
  sentenceLabel: string;
  icon: React.ReactNode;
  color: string;
  chipClassName: string;
}

const STATUS_STYLES: Record<AdminOrderStatus, StatusStyle> = {
  pending: {
    label: "Новый",
    sentenceLabel: "Ожидает сборки",
    icon: null,
    color: "#55CB00",
    chipClassName: "bg-[#55CB00]",
  },
  assembling: {
    label: "Сборка",
    sentenceLabel: "Заказ собирают",
    icon: <IconAssembling />,
    color: "#FFC400",
    chipClassName: "bg-[#FFC400]",
  },
  ready: {
    label: "Готов к выдаче",
    sentenceLabel: "Заказ собран",
    icon: <IconReady />,
    color: "#55CB00",
    chipClassName: "bg-[#55CB00]",
  },
  delivery: {
    label: "Доставка",
    sentenceLabel: "Заказ в доставке",
    icon: <IconDelivery />,
    color: "#478EFF",
    chipClassName: "bg-[#478EFF]",
  },
  completing: {
    label: "Завершение",
    sentenceLabel: "Завершается",
    icon: <IconAssembling />,
    color: "#FFC400",
    chipClassName: "bg-[#FFC400]",
  },
  completed: {
    label: "Доставлен",
    sentenceLabel: "Заказ доставлен",
    icon: <IconCompleted />,
    color: "#55CB00",
    chipClassName: "bg-[#55CB00]",
  },
  cancelled: {
    label: "Отменен",
    sentenceLabel: "Заказ отменен",
    icon: <IconCancelled />,
    color: "#F5462C",
    chipClassName: "bg-[#F5462C]",
  },
};

export function statusStyles(order: AdminOrder): StatusStyle {
  if (order.isCancelled) {
    const byShop = /shop|store|магаз/i.test(order.canceledBy ?? "");
    return {
      ...STATUS_STYLES.cancelled,
      label: byShop ? "Отменен (магазином)" : "Отменен (клиентом)",
    };
  }
  return STATUS_STYLES[order.status];
}

export function columnIdByOrder(order: AdminOrder): BoardColumnId {
  if (order.isCancelled || order.status === "completed") return "done";

  const map: Record<AdminOrderStatus, BoardColumnId> = {
    pending: "new",
    assembling: "assembling",
    ready: "pickup",
    delivery: "delivery",
    completing: "done",
    completed: "done",
    cancelled: "done",
  };

  return map[order.status];
}

export function formatCurrency(value: number, currency: string) {
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

export function formatCardTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatOrderChipDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) return `${time}, Сегодня`;

  const dayMonth = date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  return `${time}, ${dayMonth}`;
}

export function getCourierName(order: AdminOrder) {
  const user = order.deliveryMan?.user;
  if (!user) return null;

  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.phone || null;
}

export function getOrderAddress(order: AdminOrder) {
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
