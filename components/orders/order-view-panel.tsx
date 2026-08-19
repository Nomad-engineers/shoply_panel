"use client";

import { useEffect } from "react";
import { MapPin, Phone, X, Zap } from "lucide-react";
import { cn } from "@/lib/theme";
import {
  formatCurrency,
  formatOrderChipDate,
  getOrderAddress,
  statusStyles,
} from "./order-utils";
import type { AdminOrder } from "@/types/admin-order";

function RoutePoint({
  label,
  sublabel,
  withLine,
  single,
}: {
  label: string;
  sublabel?: string;
  withLine?: boolean;
  single?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="mt-1 flex h-3 w-3 shrink-0 rounded-full bg-[#98D2FF] ring-2 ring-[#D2F0FF]" />
        {withLine && <span className={cn("w-0.5 flex-1 bg-[#98D2FF]", single ? "min-h-2.5" : "min-h-6")} />}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-[16px] font-medium leading-tight text-[#0E0F27]">{label}</p>
        {sublabel && <p className="mt-0.5 text-[12px] leading-tight text-[#0E0F27]">{sublabel}</p>}
      </div>
    </div>
  );
}

function PanelCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(17,19,34,0.04)]", className)}>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[#0E0F27]">{label}</span>
      {loading ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EAFF] px-2 py-0.5 text-[14px] text-[#8A30FF]">
          <Zap size={14} color="#9747FF" />
          Идет расчет...
        </span>
      ) : (
        <span className="text-[14px] text-[#0E0F27]">{value}</span>
      )}
    </div>
  );
}

export function OrderViewPanel({
  order,
  onClose,
}: {
  order: AdminOrder;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const status = statusStyles(order);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Закрыть панель"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#09091D]/25"
      />

      <aside className="relative flex h-full w-[480px] max-w-full flex-col gap-2.5 bg-[#EEEEF4] p-1 shadow-[-16px_0_50px_rgba(9,9,29,0.12)]">
        <div className="flex items-center justify-between py-1 pl-3 pr-3">
          <h2 className="text-[16px] font-medium text-[#0E0F27]">Просмотр заказа</h2>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white transition hover:bg-[#F8F8FA]"
          >
            <X size={18} color="#09091D" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-[20px] pb-4">
          <PanelCard className="rounded-none">
            <h3 className="text-[20px] font-semibold text-[#09091D]">Заказ №{order.dailyOrderNumber}</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex h-[34px] items-center rounded-full px-3 text-[14px] text-white",
                  status.chipClassName,
                )}
              >
                {status.label}
              </span>
              <span className="inline-flex h-[34px] items-center rounded-full bg-[#F8F8FA] px-3 text-[14px] text-[#0E0F27]">
                {formatOrderChipDate(order.createdAt)}
              </span>
              <span className="inline-flex h-[34px] items-center rounded-full bg-[#F8F8FA] px-3 text-[14px] text-[#0E0F27]">
                ID {order.id}
              </span>
            </div>

            <div className="mt-3 border-t border-[#DCDCE6] pt-3">
              <RoutePoint
                label={order.shop.name}
                sublabel={order.shop.description?.trim() || undefined}
                withLine
              />
              <RoutePoint
                label={order.addressSnapshot.fullAddress?.trim() || order.addressSnapshot.city || "Адрес не указан"}
                single
              />
            </div>
          </PanelCard>

          <PanelCard>
            <h4 className="text-[16px] font-medium text-[#0E0F27]">{status.sentenceLabel}</h4>
            <div className="mt-3 border-t border-[#DCDCE6] pt-3">
              <p className="text-[12px] text-[#8F90A7]">Комментарии от клиента</p>
              <p className="mt-1 whitespace-pre-line text-[14px] leading-snug text-[#0E0F27]">
                {order.comment?.trim() || "Без комментария"}
              </p>
              {order.isCancelled && order.cancelDescription?.trim() && (
                <p className="mt-3 text-[14px] leading-snug text-[#F5462B]">
                  Причина отмены: {order.cancelDescription}
                </p>
              )}
            </div>
          </PanelCard>

          <PanelCard>
            <div className="flex flex-col gap-3">
              <InfoRow
                label="Стоимость доставки"
                value={formatCurrency(order.deliveryCost, order.currency)}
              />
              <div className="border-t border-[#DCDCE6]" />
              <InfoRow
                label="Бонус за доставку"
                value={formatCurrency(order.courierIncome, order.currency)}
                loading={!order.courierIncome}
              />
              <div className="border-t border-[#DCDCE6]" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[16px] font-medium text-[#0E0F27]">Итоговый доход</span>
                <span className="text-[16px] font-medium text-[#0E0F27]">
                  {formatCurrency(order.shoplyIncome, order.currency)}
                </span>
              </div>
            </div>
          </PanelCard>

          <div className="px-4">
            <a
              href={`tel:${order.shop.supportPhone}`}
              className="inline-flex items-center gap-2 rounded-[12px] bg-white px-[18px] py-2 text-[14px] font-semibold text-[#0E0F27] shadow-[0_6px_18px_rgba(17,19,34,0.06)] transition hover:bg-[#F8F8FA]"
            >
              <Phone size={20} color="#55CB00" />
              Магазин
            </a>
          </div>

          <div className="flex items-center gap-1.5 px-4 text-[12px] text-[#8F90A7]">
            <MapPin size={14} />
            {getOrderAddress(order)}
          </div>
        </div>
      </aside>
    </div>
  );
}
