"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  MarketingSearchIcon,
  MarketingEmptyBellIcon,
  MarketingPushIcon,
} from "@/components/icons/marketing-icons";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { CreatePushSheet } from "@/components/promotions/create-push-sheet";
import { usePushNotifications } from "@/components/hooks/usePushNotifications";
import type { PushNotification } from "@/types/push-notification";

type PushNotificationRow = PushNotification;

const formatCount = (value: number) => value.toLocaleString("ru-RU");

const formatDate = (iso: string | null) => {
  if (!iso) return "Бессрочный";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Бессрочный";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy} г.`;
};

const formatPushSent = (p: PushNotificationRow) => {
  switch (p.status) {
    case "scheduled":
      return `Запланирован · ${formatCount(p.totalRecipients)}`;
    case "sending":
      return `Отправка... ${formatCount(p.successCount)}/${formatCount(p.totalRecipients)}`;
    case "sent":
      return `${formatCount(p.successCount)} чел.`;
    case "failed":
      return "Ошибка отправки";
    default:
      return "—";
  }
};

const formatPushDate = (p: PushNotificationRow) => {
  if (p.status === "scheduled" && p.scheduledAt) {
    return formatDate(p.scheduledAt);
  }
  return formatDate(p.createdAt);
};

export default function PushPage() {
  const [pushSearch, setPushSearch] = useState("");
  const [pushSheetOpen, setPushSheetOpen] = useState(false);

  const {
    data: pushData,
    refetch: pushRefetch,
  } = usePushNotifications({
    page: 1,
    pageSize: 30,
    search: pushSearch,
  });

  const pushes = pushData;

  return (
    <>
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 lg:gap-4 lg:px-6 lg:py-4">
        <div className="flex flex-1 flex-wrap items-center gap-4 lg:gap-6">
          <div className="py-1.5 text-[18px] font-semibold leading-[18px] text-text-primary">
            Push уведомления
          </div>

          {/* Separator */}
          <div className="hidden h-8 w-px bg-[#DCDCE6]/60 lg:block" />

          {/* Search */}
          <label className="relative block w-full min-w-[140px] flex-1 sm:max-w-[225px]">
            <input
              value={pushSearch}
              onChange={(e) => setPushSearch(e.target.value)}
              placeholder="Поиск"
              className="h-[26px] w-full border-0 border-b border-[#09091D40] bg-transparent py-[4px] pl-0 pr-[22px] text-[14px] font-normal leading-[18px] text-[#0E0F27] outline-none transition-colors placeholder:text-[#8e90a0]"
            />
            <MarketingSearchIcon className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#09091D]" />
          </label>
        </div>

        {/* Create button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPushSheetOpen(true)}
            title="Создать push"
            className="inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] bg-[#55CB00] px-[12px] py-[4px] text-white transition-colors hover:bg-[#4db800]"
          >
            <Plus className="h-[14px] w-[14px]" strokeWidth={3} />
          </button>
        </div>
      </div>

      <CreatePushSheet
        open={pushSheetOpen}
        onClose={() => setPushSheetOpen(false)}
        onSuccess={() => pushRefetch()}
      />
      {pushes.length === 0 ? (
        <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
          <MarketingEmptyBellIcon className="h-[36px] w-[36px] text-[#09091D]" />
          <div className="text-[14px] text-[#8e90a0]">
            Еще пока нет созданных уведомлений
          </div>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-2 lg:hidden">
            {pushes.map((p) => (
              <div
                key={p.id}
                className="rounded-[16px] border border-[#ECECF3] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-text-secondary">
                    {formatPushDate(p)} · ID {p.id}
                  </span>
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-[#b9bbc6]" />
                </div>

                <div className="mt-2 flex items-start gap-3 rounded-[14px] bg-[#F6F6FA] p-[10px]">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[#0E0F27]">
                      {p.title}
                    </div>
                    <p className="mt-[2px] line-clamp-2 text-[12px] leading-[15px] text-[#0E0F27]/70">
                      {p.description}
                    </p>
                  </div>
                  <MarketingPushIcon className="h-[40px] w-[40px] shrink-0" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-[13px]">
                  <span className="font-medium text-text-primary">
                    {formatPushSent(p)}
                  </span>
                  <span className="min-w-0 truncate text-text-secondary">
                    {p.author}
                  </span>
                </div>

                {p.technicalName && (
                  <div className="mt-2 truncate text-[12px] text-text-secondary">
                    {p.technicalName}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden flex-1 overflow-x-auto px-3 lg:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="text-left text-[14px] text-text-secondary">
                  <th className="border-b border-border px-3 py-5 font-medium">
                    ID
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium whitespace-nowrap">
                    Дата
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Push уведомление
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Техническое название
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Отправлено
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Автор
                  </th>
                  <th className="border-b border-border px-3 py-5" />
                </tr>
              </thead>
              <tbody>
                {pushes.map((p) => (
                  <tr
                    key={p.id}
                    className="group cursor-pointer transition-colors hover:bg-gray-50/50"
                  >
                    <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary">
                      {p.id}
                    </td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary">
                      {formatPushDate(p)}
                    </td>
                    <td className="border-b border-border px-3 py-5 align-top">
                      <div className="flex w-[280px] items-center gap-3 rounded-[14px] bg-[#F6F6FA] p-[10px]">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-bold text-[#0E0F27]">
                            {p.title}
                          </div>
                          <p className="mt-[2px] line-clamp-2 text-[12px] leading-[15px] text-[#0E0F27]/70">
                            {p.description}
                          </p>
                        </div>
                        <MarketingPushIcon className="h-[40px] w-[40px] shrink-0" />
                      </div>
                    </td>
                    <td className="border-b border-border px-3 py-5 align-top">
                      <p className="max-w-[180px] text-[14px] leading-relaxed text-text-secondary">
                        {p.technicalName}
                      </p>
                    </td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary">
                      {formatPushSent(p)}
                    </td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] text-text-primary">
                      {p.author}
                    </td>
                    <td className="border-b border-border px-3 py-5 text-right align-top">
                      <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="shrink-0 border-t border-border px-6 py-5 text-[14px] font-normal leading-[18px] text-[var(--sf-gray-100,#AAAAB8)]">
            {pushes.length} уведомлений
          </div>
        </>
      )}
    </>
  );
}
