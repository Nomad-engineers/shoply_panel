"use client";

import { ShoppingBasket, MapPin } from "lucide-react";
import { cn } from "@/lib/theme";
import type { OrderCardProps } from "./panel-order-transformers";
import { formatCardTime, formatCurrency } from "./order-utils";

interface PanelOrderCardProps {
  card: OrderCardProps;
  finished?: boolean;
  onClick: () => void;
}

/**
 * Order card component for displaying transformed panel order data
 */
export function PanelOrderCard({ card, finished = false, onClick }: PanelOrderCardProps) {
  const { uiStatus } = card;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-[18px] p-3 text-left transition",
        finished
          ? "bg-[#FFFFFF80] hover:bg-white"
          : "bg-white hover:bg-[#FAFAFD]",
      )}
    >
      {/* Header: Order number, time, and price */}
      <div className="flex items-center justify-between gap-2 text-[12px] leading-[14px]">
        <span className="whitespace-nowrap text-[#0E0F2780]">
          № {card.dailyOrderNumber}, {formatCardTime(card.createdAt)}
        </span>
        <span className="whitespace-nowrap text-[#0E0F27]">
          {formatCurrency(card.totalPrice, card.currency)}
        </span>
      </div>

      <div className="h-px bg-[#DCDCE6]" />

      {/* Shop name */}
      <CardRow icon={<ShoppingBasket size={18} color="#AAAAB8" />}>
        {card.shopName}
      </CardRow>

      {/* Address */}
      <CardRow
        icon={
          <MapPin size={18} color="#0E0F27" strokeWidth={1.75} fill="#AAAAB8" fillOpacity={0.4} />
        }
      >
        {card.address}
      </CardRow>

      <div className="h-px bg-[#DCDCE6]" />

      {/* Status */}
      <CardRow
        icon={
          uiStatus.icon ?? (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: uiStatus.color }}
            />
          )
        }
      >
        {uiStatus.label}
      </CardRow>
    </button>
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
