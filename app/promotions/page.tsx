"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Plus,
  Search,
  RotateCcw,
  Bell,
} from "lucide-react";
import Cookies from "js-cookie";

import { DashboardLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { usePromocodes } from "@/components/hooks/usePromocodes";
import { useShops } from "@/components/hooks/useShops";
import type { Promocode } from "@/types/promocode";
import { useAuth } from "@/components/hooks/useLogin";
import { getImageUrl } from "@/lib/utils";
import { PromocodeIcon } from "@/components/icons/PromocodeIcon";
import {
  MarketingTicketIcon,
  MarketingBannerIcon,
  MarketingFilterIcon,
  MarketingSearchIcon,
  MarketingEmptyTicketIcon,
  MarketingEmptyBellIcon,
  MarketingEmptyImageIcon,
  MarketingImageIcon,
  MarketingPushIcon,
} from "@/components/icons/marketing-icons";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { ShopsFilterDropdown } from "@/components/promotions/shops-filter-dropdown";
import { CreatePromocodeSheet } from "@/components/promotions/create-promocode-sheet";
import { CreatePushSheet } from "@/components/promotions/create-push-sheet";
import { CreateBannerSheet } from "@/components/promotions/create-banner-sheet";
import { useBanners } from "@/components/hooks/useBanners";
import type { Banner } from "@/types/banner";
import { toast } from "sonner";

type MarketingSection = "promocodes" | "push" | "banners";

const MARKETING_SECTIONS: {
  key: MarketingSection;
  label: string;
}[] = [
  { key: "promocodes", label: "Промокоды" },
  { key: "push", label: "Push уведомления" },
  { key: "banners", label: "Баннеры" },
];

type BannerFilter = "all" | "active" | "archived";

const BANNER_FILTERS: { key: BannerFilter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные" },
  { key: "archived", label: "Архивные" },
];

type PushNotification = {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  technicalName: string;
  sent: string;
  author: string;
};

const MOCK_PUSHES: PushNotification[] = [
  {
    id: 89,
    createdAt: "2026-01-12T10:00:00.000Z",
    title: "Заголовок",
    description:
      "Описание тут будет ровно таким же как и в реальном пуше чтобы",
    technicalName:
      "Описание промокода для того чтобы понимать зачем было выпущенно",
    sent: "1-10k",
    author: "М. Серкжан",
  },
  {
    id: 88,
    createdAt: "2026-01-12T10:00:00.000Z",
    title: "Заголовок",
    description:
      "Описание тут будет ровно таким же как и в реальном пуше чтобы",
    technicalName:
      "Описание промокода для того чтобы понимать зачем было выпущенно",
    sent: "1-10k",
    author: "М. Серкжан",
  },
  {
    id: 87,
    createdAt: "2026-01-12T10:00:00.000Z",
    title: "Заголовок",
    description:
      "Описание тут будет ровно таким же как и в реальном пуше чтобы",
    technicalName:
      "Описание промокода для того чтобы понимать зачем было выпущенно",
    sent: "1-10k",
    author: "М. Серкжан",
  },
  {
    id: 86,
    createdAt: "2026-01-12T10:00:00.000Z",
    title: "Заголовок",
    description:
      "Описание тут будет ровно таким же как и в реальном пуше чтобы",
    technicalName:
      "Описание промокода для того чтобы понимать зачем было выпущенно",
    sent: "1-10k",
    author: "М. Серкжан",
  },
];

const formatCurrency = (value: number) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const formatDate = (iso: string | null) => {
  if (!iso) return "Бессрочный";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Бессрочный";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy} г.`;
};

const getConditionsLabel = (p: Promocode) => {
  if (p.usageLimit === null) return "∞";
  return `${(p.usageLimit ?? 0).toLocaleString("ru-RU")} шт`;
};

const getContentLabel = (p: Promocode) => {
  if (p.type === "percent") return `-${p.valueForType}%`;
  return `${p.valueForType} ₽`;
};

export default function PromotionsPage() {
  const { adminData, loading: authLoading } = useAuth();
  const isAdmin = adminData?.isAdmin ?? false;
  const derivedShopId = useMemo(() => {
    const cookieShopId = Number(Cookies.get("current_shop_id"));
    return adminData?.shopId ?? (Number.isNaN(cookieShopId) ? undefined : cookieShopId);
  }, [adminData?.shopId]);

  const shopIdForFilter = useMemo(() => {
    if (!derivedShopId) return undefined;
    const n = Number(derivedShopId);
    return Number.isNaN(n) ? undefined : n;
  }, [derivedShopId]);

  const [activeTab, setActiveTab] = useState<"promocodes" | "archive">(
    "promocodes"
  );
  const [section, setSection] = useState<MarketingSection>("promocodes");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editPromocode, setEditPromocode] = useState<Promocode | null>(null);
  const [appliedShopIds, setAppliedShopIds] = useState<number[]>([]);
  const [draftShopIds, setDraftShopIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Filter States
  const [search, setSearch] = useState("");
  const [pushSearch, setPushSearch] = useState("");
  const [pushSheetOpen, setPushSheetOpen] = useState(false);

  const [bannerSearch, setBannerSearch] = useState("");
  const [bannerFilter, setBannerFilter] = useState<BannerFilter>("all");
  const [bannerSheetOpen, setBannerSheetOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [bannersPage, setBannersPage] = useState(1);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { shops: allShops, loading: shopsLoading } = useShops({
    isAdmin,
    dateFrom: today,
    dateTo: tomorrow,
    skip: authLoading || !isAdmin,
  });

  const promocodeParams = useMemo(
    () => ({
      page,
      pageSize,
      shopId: isAdmin ? undefined : shopIdForFilter,
      shopIds: isAdmin ? appliedShopIds : undefined,
      skip: authLoading || (!shopIdForFilter && !isAdmin),
      filter: { search },
      isAdmin,
    }),
    [
      page,
      pageSize,
      appliedShopIds,
      shopIdForFilter,
      authLoading,
      isAdmin,
      search,
    ]
  );

  const { data, loading, error, refetch } = usePromocodes(promocodeParams);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, appliedShopIds]);

  useEffect(() => {
    setBannersPage(1);
  }, [bannerSearch, bannerFilter]);

  const promocodes = useMemo(() => {
    let list = data?.data ?? [];

    // Filter by tab
    const now = new Date();
    if (activeTab === "promocodes") {
      list = list.filter((p) => !p.validUntil || new Date(p.validUntil) > now);
    } else {
      list = list.filter((p) => p.validUntil && new Date(p.validUntil) <= now);
    }

    // Client-side Shop filter (additional safety/UI consistency)
    if (appliedShopIds.length > 0) {
      list = list.filter((p) => p.shop?.id && appliedShopIds.includes(p.shop.id));
    }

    return list.sort((a, b) => b.id - a.id);
  }, [data?.data, appliedShopIds, activeTab]);

  const totalActivations = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.activationCount ?? 0), 0);
  }, [promocodes]);

  const totalTurnover = useMemo(() => {
    return promocodes.reduce((sum, p) => sum + (p.turnover ?? 0), 0);
  }, [promocodes]);

  const pushes = useMemo(() => {
    const q = pushSearch.trim().toLowerCase();
    if (!q) return MOCK_PUSHES;
    return MOCK_PUSHES.filter((p) =>
      [p.title, p.description, p.technicalName, p.author].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [pushSearch]);

  const {
    data: bannersData,
    loading: bannersLoading,
    error: bannersError,
    refetch: bannersRefetch,
  } = useBanners({
    page: bannersPage,
    pageSize: 30,
    search: bannerSearch,
    status: bannerFilter,
  });

  const handleSectionChange = (key: MarketingSection) => {
    setSection(key);
  };

  const marketingMenu = (
    <aside className="w-[248px] shrink-0 rounded-[20px] bg-white p-[8px] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <nav className="flex flex-col gap-[2px]">
        {MARKETING_SECTIONS.map((item) => {
          const active = section === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSectionChange(item.key)}
              className={cn(
                "flex h-[48px] w-full items-center gap-[10px] rounded-[14px] px-[8px] text-left transition-colors",
                active ? "bg-[#F6F6FA]" : "hover:bg-[#FAFAFC]"
              )}
            >
              <span
                className={cn(
                  "grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[10px] transition-colors",
                  active ? "bg-[#09091D]" : "bg-transparent"
                )}
              >
                {item.key === "banners" ? (
                  <MarketingBannerIcon
                    className={cn(
                      "h-[22px] w-[22px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                ) : item.key === "push" ? (
                  <Bell
                    className={cn(
                      "h-[20px] w-[20px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                ) : (
                  <MarketingTicketIcon
                    className={cn(
                      "h-[20px] w-[20px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  "flex-1 truncate text-[14px]",
                  active
                    ? "font-semibold text-[#09091D]"
                    : "font-normal text-[#09091D]/80"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <DashboardLayout
      contentClassName="min-h-0 w-full p-0"
    >
      <section className="flex min-h-0 flex-1 items-start gap-6 px-6 pb-6 pt-8">
        {marketingMenu}
        <div className="flex min-h-0 flex-1 flex-col self-stretch overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {section === "promocodes" && (
            <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 pr-2">
                <button
                  onClick={() => setActiveTab("promocodes")}
                  className={cn(
                    "text-[18px] font-semibold leading-[18px] text-text-primary transition-all py-1.5",
                    activeTab === "promocodes"
                      ? "relative after:absolute after:inset-x-0 after:-bottom-[4px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                      : ""
                  )}
                >
                  Активные
                </button>
                <button
                  onClick={() => setActiveTab("archive")}
                  className={cn(
                    "text-[18px] font-semibold leading-[18px] text-text-primary transition-all py-1.5",
                    activeTab === "archive"
                      ? "relative after:absolute after:inset-x-0 after:-bottom-[4px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']"
                      : ""
                  )}
                >
                  Архив
                </button>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-[#DCDCE6]/60" />

              {/* Search */}
              <label className="relative block w-[225px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск"
                  className="h-[26px] w-full border-0 border-b border-[#09091D40] bg-transparent py-[4px] pl-0 pr-[22px] text-[14px] font-normal leading-[18px] text-[#0E0F27] outline-none transition-colors placeholder:text-[#8e90a0]"
                />
                <MarketingSearchIcon className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#09091D]" />
              </label>

              {/* Filter toggle */}
              {isAdmin && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isFilterOpen) setDraftShopIds(appliedShopIds);
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    title="Фильтр"
                    className={cn(
                      "inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] border px-[12px] py-[4px] transition-colors",
                      appliedShopIds.length > 0
                        ? "border-transparent bg-[#55CB00] text-white"
                        : draftShopIds.length > 0
                          ? "border-[#55CB00] bg-[#F6F6FA] text-[#09091D]"
                          : "border-transparent bg-[#F6F6FA] text-[#09091D] hover:bg-[#eeeef3]"
                    )}
                  >
                    <MarketingFilterIcon />
                  </button>

                  {isFilterOpen && (
                    <ShopsFilterDropdown
                      shops={allShops}
                      loading={shopsLoading}
                      appliedShopIds={appliedShopIds}
                      selectedShopIds={draftShopIds}
                      onToggle={(id) =>
                        setDraftShopIds((prev) =>
                          prev.includes(id)
                            ? prev.filter((v) => v !== id)
                            : [...prev, id]
                        )
                      }
                      onApply={() => {
                        setAppliedShopIds(draftShopIds);
                        setIsFilterOpen(false);
                      }}
                      onReset={() => {
                        setDraftShopIds([]);
                        setAppliedShopIds([]);
                        setIsFilterOpen(false);
                      }}
                      onClose={() => setIsFilterOpen(false)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Create button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateSheetOpen(true)}
                title="Создать промокод"
                className="inline-flex h-[26px] w-[42px] cursor-pointer items-center justify-center rounded-[12px] bg-[#55CB00] px-[12px] py-[4px] text-white transition-colors hover:bg-[#4db800]"
              >
                <Plus className="h-[14px] w-[14px]" strokeWidth={3} />
              </button>
            </div>
          </div>

      <CreatePromocodeSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />

      <CreatePromocodeSheet
        open={editPromocode !== null}
        promocode={editPromocode}
        onClose={() => setEditPromocode(null)}
      />


          {/* Content area */}
          {activeTab === "archive" && promocodes.length === 0 && !loading && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-text-secondary">
              Архив пуст
            </div>
          )}

          {(activeTab === "promocodes" || promocodes.length > 0) && (
            <>
              {loading && (
                <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
                  <Spinner size={32} />
                </div>
              )}

              {!loading && error && (
                <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-[14px] text-[#E26D5C]">
                  Ошибка: {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  <div
                    className={cn(
                      "overflow-x-auto px-3 pb-2",
                      promocodes.length === 0 ? "flex-none" : "flex-1"
                    )}
                  >
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
                            <div className="inline-flex items-center gap-1">
                              Название
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            Комментарий
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            <div className="inline-flex items-center gap-1">
                              Выпуск
                              <ChevronDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            Оборот
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            Условия
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            Содержание
                          </th>
                          <th className="border-b border-border px-3 py-5 font-medium">
                            Активация
                          </th>
                          <th className="border-b border-border px-3 py-5" />
                        </tr>
                      </thead>
                      <tbody>
                        {promocodes.map((p) => {
                          const turnover = p.turnover ?? 0;
                          const activation = p.activationCount ?? 0;

                          return (
                            <tr
                              key={p.id}
                              className="group transition-colors cursor-pointer hover:bg-gray-50/50"
                              onClick={() => setEditPromocode(p)}
                            >
                              <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary">
                                {p.id}
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary whitespace-nowrap">
                                {formatDate(p.createdAt)}
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top">
                                <div className="flex items-center gap-2">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(p.name);
                                      toast.success("Промокод скопирован");
                                    }}
                                    className="cursor-pointer hover:opacity-70 transition-opacity"
                                  >
                                    <PromocodeIcon className="w-5 h-5 flex-shrink-0 text-[#478EFF]" />
                                  </div>
                                  <span className="whitespace-nowrap text-[16px] font-bold text-[#478EFF] hover:underline decoration-2 underline-offset-4">
                                    {p.name}
                                  </span>
                                </div>
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top">
                                <p className="max-w-[150px] text-[14px] leading-relaxed text-text-secondary">
                                  {p.technicalName || "-"}
                                </p>
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top">
                                {(() => {
                                  const shop = p.shop;
                                  const name = shop?.name || "SHOPLY";
                                  const photoUrl = shop?.photoId ? getImageUrl({ id: shop.photoId }) : null;

                                  return (
                                    <div className="flex items-center gap-2">
                                      {photoUrl ? (
                                        <Image
                                          src={photoUrl}
                                          alt={name}
                                          width={24}
                                          height={24}
                                          className="rounded-full object-cover border border-[#ececf1]"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-[#55CB00]/10 flex items-center justify-center text-[#55CB00] text-[11px] font-bold border border-[#55CB00]/20">
                                          {name === "SHOPLY"
                                            ? "S"
                                            : name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="text-[16px] text-text-primary font-medium whitespace-nowrap">
                                        {name}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] font-medium text-text-primary">
                                {formatCurrency(turnover)}
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-secondary whitespace-nowrap">
                                {getConditionsLabel(p)}
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-primary font-medium whitespace-nowrap">
                                {getContentLabel(p)}
                              </td>
                              <td className="border-b border-border px-3 py-5 align-top text-[16px] text-text-primary font-medium">
                                {activation}
                              </td>
                              <td className="border-b border-border px-3 py-5 text-right align-top">
                                <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                              </td>
                            </tr>
                          );
                        })}

                        {/* Summary row */}
                        {promocodes.length > 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-5 text-[14px] text-text-secondary font-medium"
                            >
                              {promocodes.length} промокодов
                            </td>
                            <td className="px-3 py-5" />
                            <td className="whitespace-nowrap px-3 py-5 text-[16px] font-semibold text-text-primary">
                              {formatCurrency(totalTurnover)}
                            </td>
                            <td className="px-3 py-5" />
                            <td className="px-3 py-5" />
                            <td className="px-3 py-5 text-[16px] text-text-primary font-semibold">
                              {totalActivations}
                            </td>
                            <td className="px-3 py-5" />
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {promocodes.length === 0 && (
                    <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
                      <MarketingEmptyTicketIcon className="h-[36px] w-[36px] text-[#09091D]" />
                      <div className="text-[14px] text-[#8e90a0]">
                        Еще пока нет созданных промокодов
                      </div>
                    </div>
                  )}
                  </>
                )}
              </>
            )}
            </>
          )}

          {section === "push" && (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="py-1.5 text-[18px] font-semibold leading-[18px] text-text-primary">
                    Push уведомления
                  </div>

                  {/* Separator */}
                  <div className="h-8 w-px bg-[#DCDCE6]/60" />

                  {/* Search */}
                  <label className="relative block w-[225px]">
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
              />
              {pushes.length === 0 ? (
                <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
                  <MarketingEmptyBellIcon className="h-[36px] w-[36px] text-[#09091D]" />
                  <div className="text-[14px] text-[#8e90a0]">
                    Еще пока нет созданных уведомлений
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto px-3 pb-2">
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
                            {formatDate(p.createdAt)}
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
                            {p.sent}
                          </td>
                          <td className="whitespace-nowrap border-b border-border px-3 py-5 align-top text-[16px] text-text-primary">
                            {p.author}
                          </td>
                          <td className="border-b border-border px-3 py-5 text-right align-top">
                            <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                          </td>
                        </tr>
                      ))}

                      {/* Summary row */}
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-5 text-[14px] font-medium text-text-secondary"
                        >
                          {pushes.length} уведомлений
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {section === "banners" && (
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
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="py-1.5 text-[18px] font-semibold leading-[18px] text-text-primary">
                    Список баннеров
                  </div>

                  {/* Separator */}
                  <div className="h-8 w-px bg-[#DCDCE6]/60" />

                  {/* Search */}
                  <label className="relative block w-[225px]">
                    <input
                      value={bannerSearch}
                      onChange={(e) => setBannerSearch(e.target.value)}
                      placeholder="Поиск"
                      className="h-[26px] w-full border-0 border-b border-[#09091D40] bg-transparent py-[4px] pl-0 pr-[22px] text-[14px] font-normal leading-[18px] text-[#0E0F27] outline-none transition-colors placeholder:text-[#8e90a0]"
                    />
                    <MarketingSearchIcon className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#09091D]" />
                  </label>

                  {/* Status filter */}
                  <div className="flex items-center gap-[8px]">
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
                <div className="flex-1 overflow-x-auto px-3 pb-2">
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
                      {bannersData.map((b) => {
                        const previewUrl = getImageUrl(b.cover ?? b.image ?? null);

                        return (
                          <tr
                            key={b.id}
                            className="group cursor-pointer transition-colors hover:bg-gray-50/50"
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
                            <td className="border-b border-border px-3 py-5 text-right align-top">
                              <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                            </td>
                          </tr>
                        );
                      })}

                      {/* Summary row */}
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-5 text-[14px] font-medium text-text-secondary"
                        >
                          {bannersData.length} баннеров
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
