"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlignJustify, Plus } from "lucide-react";

import { Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { getImageUrl } from "@/lib/utils";
import {
  MarketingSearchIcon,
  MarketingEmptyImageIcon,
  MarketingImageIcon,
} from "@/components/icons/marketing-icons";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { CreateBannerSheet } from "@/components/promotions/create-banner-sheet";
import { useBanners } from "@/components/hooks/useBanners";
import type { Banner } from "@/types/banner";
import { toast } from "sonner";

type BannerFilter = "all" | "active" | "archived";

const BANNER_FILTERS: { key: BannerFilter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные" },
  { key: "archived", label: "Архивные" },
];

const formatDate = (iso: string | null) => {
  if (!iso) return "Бессрочный";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Бессрочный";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy} г.`;
};

export default function BannersPage() {
  const [bannerSearch, setBannerSearch] = useState("");
  const [bannerFilter, setBannerFilter] = useState<BannerFilter>("all");
  const [bannerSheetOpen, setBannerSheetOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [bannersPage, setBannersPage] = useState(1);
  const [armedBannerId, setArmedBannerId] = useState<number | null>(null);
  const [dragBannerId, setDragBannerId] = useState<number | null>(null);
  const [bannersOrder, setBannersOrder] = useState<Banner[]>([]);

  const {
    data: bannersData,
    loading: bannersLoading,
    error: bannersError,
    refetch: bannersRefetch,
    reorderBanners,
  } = useBanners({
    page: bannersPage,
    pageSize: 30,
    search: bannerSearch,
    status: bannerFilter,
  });

  useEffect(() => {
    setBannersPage(1);
  }, [bannerSearch, bannerFilter]);

  // Keep the displayed order in sync with server data (unless a drag is in progress)
  useEffect(() => {
    setBannersOrder(bannersData);
  }, [bannersData]);

  const handleBannerDragEnter = (targetId: number) => {
    if (dragBannerId === null || dragBannerId === targetId) return;
    setBannersOrder((prev) => {
      const from = prev.findIndex((b) => b.id === dragBannerId);
      const to = prev.findIndex((b) => b.id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const commitBannerReorder = async () => {
    const dragged = bannersOrder.find((b) => b.id === dragBannerId);
    const unchanged =
      !dragged ||
      bannersData.every(
        (b, idx) => bannersOrder[idx]?.id === b.id
      );
    setDragBannerId(null);
    setArmedBannerId(null);
    if (unchanged) return;

    const items = bannersOrder.map((b, idx) => ({
      id: b.id,
      customOrderId: (bannersPage - 1) * 30 + idx,
    }));
    try {
      await reorderBanners(items);
      bannersRefetch();
    } catch {
      toast.error("Не удалось изменить порядок баннеров");
      setBannersOrder(bannersData);
    }
  };

  return (
    <>
      <CreateBannerSheet
        open={bannerSheetOpen}
        onClose={() => setBannerSheetOpen(false)}
        onSuccess={() => {
          setBannersPage(1);
          bannersRefetch();
        }}
      />

      <CreateBannerSheet
        open={editBanner !== null}
        banner={editBanner}
        onClose={() => setEditBanner(null)}
        onSuccess={() => bannersRefetch()}
      />

      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 lg:gap-4 lg:px-6 lg:py-4">
        <div className="flex flex-1 flex-wrap items-center gap-4 lg:gap-6">
          <div className="py-1.5 text-[18px] font-semibold leading-[18px] text-text-primary">
            Список баннеров
          </div>

          {/* Separator */}
          <div className="hidden h-8 w-px bg-[#DCDCE6]/60 lg:block" />

          {/* Search */}
          <label className="relative block w-full min-w-[140px] flex-1 sm:max-w-[225px]">
            <input
              value={bannerSearch}
              onChange={(e) => setBannerSearch(e.target.value)}
              placeholder="Поиск"
              className="h-[26px] w-full border-0 border-b border-[#09091D40] bg-transparent py-[4px] pl-0 pr-[22px] text-[14px] font-normal leading-[18px] text-[#0E0F27] outline-none transition-colors placeholder:text-[#8e90a0]"
            />
            <MarketingSearchIcon className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#09091D]" />
          </label>

          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-[8px]">
            {BANNER_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setBannerFilter(f.key)}
                className={cn(
                  "inline-flex h-[26px] cursor-pointer items-center rounded-[12px] border px-[16px] py-[4px] text-[14px] font-normal leading-[18px] text-[#0E0F27] transition-colors",
                  bannerFilter === f.key
                    ? "border-[#55CB00] bg-[#D3FFB4]"
                    : "border-[#DCDCE6] bg-white hover:bg-[#F6F6FA]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBannerSheetOpen(true)}
            title="Создать баннер"
            className="inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] bg-[#55CB00] px-[12px] py-[4px] text-white transition-colors hover:bg-[#4db800]"
          >
            <Plus className="h-[14px] w-[14px]" strokeWidth={3} />
          </button>
        </div>
      </div>

      {bannersData.length === 0 && !bannersLoading && !bannersError ? (
        <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
          <MarketingEmptyImageIcon className="h-[36px] w-[36px] text-[#09091D]" />
          <div className="text-[14px] text-[#8e90a0]">
            Еще пока нет созданных баннеров
          </div>
        </div>
      ) : bannersLoading ? (
        <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
          <Spinner size={32} />
        </div>
      ) : bannersError ? (
        <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-[#E26D5C]">
          Ошибка: {bannersError}
        </div>
      ) : (
        <>
          {/* Mobile cards (drag & drop reorder is desktop-only) */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-2 lg:hidden">
            {bannersOrder.map((b) => {
              const previewUrl = getImageUrl(b.cover ?? b.image ?? null);

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setEditBanner(b)}
                  className="w-full rounded-[16px] border border-[#ECECF3] bg-white p-4 text-left transition-colors hover:bg-[#FAFAFC]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-text-secondary">
                      {formatDate(b.createdAt)} · ID {b.id}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[13px] font-medium",
                        b.inArchive === true
                          ? "text-[#8e90a0]"
                          : "text-[#3DA210]"
                      )}
                    >
                      {b.inArchive === true ? "Архив" : "Активный"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-start gap-3">
                    {previewUrl ? (
                      <div className="relative h-[56px] w-[40px] shrink-0 overflow-hidden rounded-[8px] border border-[#ececf1]">
                        <Image
                          src={previewUrl}
                          alt={b.title}
                          fill
                          sizes="40px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="grid h-[56px] w-[40px] shrink-0 place-items-center rounded-[8px] bg-[#DBE9FF]">
                        <MarketingImageIcon className="h-[20px] w-[20px] text-[#7AA7E8]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold text-[#0E0F27]">
                        {b.title}
                      </div>
                      <p className="mt-[2px] line-clamp-3 text-[12px] leading-[15px] text-[#0E0F27]/70">
                        {b.description}
                      </p>
                    </div>
                  </div>

                  {b.technicalName && (
                    <div className="mt-2 truncate text-[12px] text-text-secondary">
                      {b.technicalName}
                    </div>
                  )}
                </button>
              );
            })}
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
                    Баннер
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Техническое описание
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Статус
                  </th>
                  <th className="border-b border-border px-3 py-5 font-medium">
                    Автор
                  </th>
                  <th className="border-b border-border px-3 py-5" />
                </tr>
              </thead>
              <tbody>
                {bannersOrder.map((b) => {
                  const previewUrl = getImageUrl(b.cover ?? b.image ?? null);
                  const isDragging = dragBannerId === b.id;

                  return (
                    <tr
                      key={b.id}
                      draggable={armedBannerId === b.id}
                      onDragStart={() => setDragBannerId(b.id)}
                      onDragEnter={() => handleBannerDragEnter(b.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        commitBannerReorder();
                      }}
                      onDragEnd={commitBannerReorder}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-gray-50/50",
                        isDragging && "opacity-40"
                      )}
                      onClick={() => setEditBanner(b)}
                    >
                      <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary">
                        {b.id}
                      </td>
                      <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary">
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="border-b border-border px-3 py-5 align-top">
                        <div className="flex w-[280px] items-center gap-3 rounded-[14px] bg-[#F6F6FA] p-[10px]">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] font-bold text-[#0E0F27]">
                              {b.title}
                            </div>
                            <p className="mt-[2px] line-clamp-3 text-[12px] leading-[15px] text-[#0E0F27]/70">
                              {b.description}
                            </p>
                          </div>
                          {previewUrl ? (
                            <div className="relative h-[56px] w-[40px] shrink-0 overflow-hidden rounded-[8px] border border-[#ececf1]">
                              <Image
                                src={previewUrl}
                                alt={b.title}
                                fill
                                sizes="40px"
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid h-[56px] w-[40px] shrink-0 place-items-center rounded-[8px] bg-[#DBE9FF]">
                              <MarketingImageIcon className="h-[20px] w-[20px] text-[#7AA7E8]" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border-b border-border px-3 py-5 align-top">
                        <p className="max-w-[180px] text-[14px] leading-relaxed text-text-secondary">
                          {b.technicalName || "-"}
                        </p>
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium",
                          b.inArchive === true
                            ? "text-[#8e90a0]"
                            : "text-[#3DA210]"
                        )}
                      >
                        {b.inArchive === true ? "Архив" : "Активный"}
                      </td>
                      <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] text-text-primary">
                        {b.author || "-"}
                      </td>
                      <td className="border-b border-border px-3 py-5 align-top">
                        <div
                          className="flex items-center justify-end gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronRightIcon className="h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                          <button
                            type="button"
                            title="Перетащите, чтобы изменить порядок"
                            className="cursor-grab text-[#b9bbc6] transition-colors hover:text-[#09091D] active:cursor-grabbing"
                            onMouseDown={() => setArmedBannerId(b.id)}
                            onMouseUp={() => setArmedBannerId(null)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlignJustify className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="shrink-0 border-t border-border px-6 py-5 text-[14px] font-normal leading-[18px] text-[var(--sf-gray-100,#AAAAB8)]">
            {bannersOrder.length} баннеров
          </div>
        </>
      )}
    </>
  );
}
