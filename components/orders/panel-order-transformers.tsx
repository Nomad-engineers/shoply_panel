"use client";

import type {
  AddressSnapshotDto,
  PanelOrderDto,
} from "@/types/panel-orders.dto";
import { OrderStatus } from "@/types/panel-orders.dto";
import type { AdminOrder, AdminOrderStatus } from "@/types/admin-order";
import {
  IconAssembling,
  IconCancelled,
  IconCompleted,
  IconDelivery,
  IconReady,
} from "./status-icons";

/**
 * UI Status representation for order cards
 */
export interface OrderUiStatus {
  label: string;
  sentenceLabel: string;
  icon: React.ReactNode;
  color: string;
  chipClassName: string;
  columnId: "new" | "assembling" | "pickup" | "delivery" | "done";
}

/**
 * Card props format for rendering order cards
 */
export interface OrderCardProps {
  id: number;
  dailyOrderNumber: number;
  createdAt: string;
  shopName: string;
  totalPrice: number;
  currency: string;
  uiStatus: OrderUiStatus;
  address: string;
}

/**
 * Maps backend OrderStatus to frontend AdminOrderStatus
 */
function mapOrderStatus(status: OrderStatus): AdminOrderStatus {
  const statusMap: Record<OrderStatus, AdminOrderStatus> = {
    [OrderStatus.PENDING]: "pending",
    [OrderStatus.ASSEMBLING]: "assembling",
    [OrderStatus.READY]: "ready",
    [OrderStatus.DELIVERY]: "delivery",
    [OrderStatus.COMPLETING]: "completing",
    [OrderStatus.COMPLETED]: "completed",
    [OrderStatus.CANCELLED]: "cancelled",
  };
  return statusMap[status] ?? "pending";
}

/**
 * Determines UI status based on order state
 */
function getUiStatus(
  status: OrderStatus,
  isCancelled: boolean,
  canceledBy: string | null
): OrderUiStatus {
  // Handle cancelled orders
  if (isCancelled) {
    const byShop = /shop|store|магаз/i.test(canceledBy ?? "");
    return {
      label: byShop ? "Отменен (магазином)" : "Отменен (клиентом)",
      sentenceLabel: "Заказ отменен",
      icon: <IconCancelled />,
      color: "#F5462C",
      chipClassName: "bg-[#F5462C]",
      columnId: "done",
    };
  }

  const mappedStatus = mapOrderStatus(status);

  // Status styles mapping
  const STATUS_STYLES: Record<AdminOrderStatus, Omit<OrderUiStatus, "columnId">> = {
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
      sentenceLabel: "Заказ готов",
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

  const statusStyle = STATUS_STYLES[mappedStatus];

  // Map status to board column
  const columnMap: Record<AdminOrderStatus, OrderUiStatus["columnId"]> = {
    pending: "new",
    assembling: "assembling",
    ready: "pickup",
    delivery: "delivery",
    completing: "done",
    completed: "done",
    cancelled: "done",
  };

  return {
    ...statusStyle,
    columnId: columnMap[mappedStatus],
  };
}

/**
 * Formats address from DTO to display string
 */
function formatAddress(address: AddressSnapshotDto): string {
  const parts = [address.street, address.house, address.flat ? `кв. ${address.flat}` : null];
  return parts.filter(Boolean).join(", ") || "Адрес не указан";
}

/**
 * Transforms backend PanelOrderDto to frontend OrderCardProps
 */
export function transformOrderToCard(dto: PanelOrderDto): OrderCardProps {
  const uiStatus = getUiStatus(dto.status, dto.isCancelled, dto.canceledBy);

  return {
    id: dto.id,
    dailyOrderNumber: dto.dailyOrderNumber,
    createdAt: dto.createdAt.toString(),
    shopName: dto.shopName,
    totalPrice: dto.totalPrice,
    currency: dto.currency,
    uiStatus,
    address: formatAddress(dto.address),
  };
}

/**
 * Transforms an array of PanelOrderDto to OrderCardProps
 */
export function transformOrdersToCards(dtos: PanelOrderDto[]): OrderCardProps[] {
  return dtos.map(transformOrderToCard);
}

/**
 * Groups cards by their column ID for Kanban board rendering
 */
export function groupCardsByColumn(
  cards: OrderCardProps[]
): Record<OrderUiStatus["columnId"], OrderCardProps[]> {
  const grouped: Record<OrderUiStatus["columnId"], OrderCardProps[]> = {
    new: [],
    assembling: [],
    pickup: [],
    delivery: [],
    done: [],
  };

  for (const card of cards) {
    grouped[card.uiStatus.columnId].push(card);
  }

  return grouped;
}
