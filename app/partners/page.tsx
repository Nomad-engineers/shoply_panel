"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  Store,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Spinner, Switch } from "@/components/ui";
import { usePartners } from "@/components/hooks/usePartners";
import { cn, getImageUrl } from "@/lib/utils";

type PartnerType = "Магазины" | "Рестораны" | "Сервисы";
type PartnerStatusTone = "open" | "closed" | "draft" | "archived";
type PartnerSortField = "id" | "name" | "itemCount" | "rating" | "status";
type SortDirection = "asc" | "desc";

interface PartnerRow {
  id: number;
  name: string;
  type: PartnerType;
  itemCount: number;
  rating: number | null;
  statusLabel: string;
  statusTone: PartnerStatusTone;
  photoId?: string | null;
  archived?: boolean;
}

const statusClassNames: Record<PartnerStatusTone, string> = {
  open: "text-[#71B84D]",
  closed: "text-[#E26D5C]",
  draft: "text-[#B29A32]",
  archived: "text-[#6A8EE5]",
};

function mapPartnerType(type: "shop" | "restaurant" | "service"): PartnerType {
  if (type === "restaurant") {
    return "Рестораны";
  }

  if (type === "service") {
    return "Сервисы";
  }

  return "Магазины";
}

function formatClosedUntil(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Временно закрыт";
  }

  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `Закрыт до ${dateLabel}, ${timeLabel}`;
}

function formatWorkTime(value: string) {
  return value.slice(0, 5);
}

export default function PartnersPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<PartnerType>("Магазины");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [periodLabel, setPeriodLabel] = useState("Месяц");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [sortField, setSortField] = useState<PartnerSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { partners, loading, error } = usePartners();

  const partnerRows = useMemo<PartnerRow[]>(
    () =>
      partners.map((partner) => {
        const itemCount = partner.categories.reduce(
          (total, category) => total + category.productsCount,
          0,
        );

        if (partner.tempClosedFrom || partner.tempClosedUntil) {
          return {
            id: partner.id,
            name: partner.name,
            type: mapPartnerType(partner.type),
            itemCount,
            rating: null,
            statusLabel: partner.tempClosedUntil
              ? formatClosedUntil(partner.tempClosedUntil)
              : "Временно закрыт",
            statusTone: "closed",
            photoId: partner.photoId,
          };
        }

        return {
          id: partner.id,
          name: partner.name,
          type: mapPartnerType(partner.type),
          itemCount,
          rating: null,
          statusLabel: `Открыт до ${formatWorkTime(partner.workTimeEnd)}`,
          statusTone: "open",
          photoId: partner.photoId,
        };
      }),
    [partners],
  );

  const filteredPartners = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return partnerRows.filter((partner) => {
      if (partner.type !== activeType) {
        return false;
      }

      if (!showArchived && partner.archived) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return partner.name.toLowerCase().includes(normalizedQuery);
    });
  }, [activeType, partnerRows, searchQuery, showArchived]);

  const partnerTypes = useMemo(
    () =>
      (["Магазины", "Рестораны", "Сервисы"] as PartnerType[]).map((label) => ({
        label,
        count: partnerRows.filter((partner) => partner.type === label).length,
      })),
    [partnerRows],
  );

  const sortedPartners = useMemo(() => {
    const rows = [...filteredPartners];

    rows.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "id":
          comparison = a.id - b.id;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name, "ru");
          break;
        case "itemCount":
          comparison = a.itemCount - b.itemCount;
          break;
        case "rating":
          comparison = (a.rating ?? -1) - (b.rating ?? -1);
          break;
        case "status":
          comparison = a.statusLabel.localeCompare(b.statusLabel, "ru");
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return rows;
  }, [filteredPartners, sortDirection, sortField]);

  const filteredPartnersLabel = useMemo(() => {
    const count = sortedPartners.length;
    const noun =
      activeType === "Магазины"
        ? count === 1
          ? "магазин"
          : count >= 2 && count <= 4
            ? "магазина"
            : "магазинов"
        : count === 1
          ? "партнер"
          : count >= 2 && count <= 4
            ? "партнера"
            : "партнеров";

    return `${count} ${noun}`;
  }, [activeType, sortedPartners.length]);

  const handleSort = (field: PartnerSortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const header = (
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Партнеры
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        {partnerTypes.map((item) => {
          const isActive = item.label === activeType;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveType(item.label)}
              className={cn(
                "inline-flex items-center gap-1.5 px-0 text-[20px] font-semibold leading-none transition-colors",
                isActive
                  ? "text-text-primary"
                  : "text-[#23263a] hover:text-text-primary",
              )}
            >
              <span
                className={cn(
                  "relative inline-flex items-center",
                  isActive &&
                    "after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold leading-none",
                  isActive
                    ? "bg-[#e5e6ee] text-[#9a9dab]"
                    : "bg-[#e5e6ee] text-[#9a9dab]",
                )}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSortHeader = (label: string, field: PartnerSortField) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            sortDirection === "asc" && "rotate-180",
          )}
        />
      )}
    </button>
  );

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
            <div className="flex flex-wrap items-center gap-6">
              <label className="relative block w-[225px]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Поиск"
                  className="h-[32px] w-full border-0 border-b border-[#09091d40] bg-transparent pl-0 pr-8 text-[14px] text-text-primary outline-none transition-colors placeholder:text-[#8e90a0] focus:border-[#55CB00]"
                />
                <Search className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              </label>

              <label className="inline-flex items-center gap-2 text-[14px] font-medium text-text-secondary">
                <Switch checked={showArchived} onCheckedChange={setShowArchived} />
                <span>Показать архивные</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPeriodOpen((open) => !open)}
                  className="inline-flex h-8 items-center gap-1 rounded-xl border border-[#ececf1] bg-[#f6f6fa] px-3 text-[14px] font-medium text-text-primary"
                >
                  {periodLabel}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-text-secondary transition-transform",
                      isPeriodOpen && "rotate-180",
                    )}
                  />
                </button>

                {isPeriodOpen && (
                  <div className="absolute right-0 top-10 z-10 min-w-[132px] rounded-2xl border border-border bg-white p-1 shadow-lg">
                    {["День", "Неделя", "Месяц"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setPeriodLabel(option);
                          setIsPeriodOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center rounded-xl px-3 py-2 text-left text-[14px] transition-colors",
                          option === periodLabel
                            ? "bg-[#f3f8ec] text-text-primary"
                            : "text-text-secondary hover:bg-[#f7f7fa] hover:text-text-primary",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#55CB00] px-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#4abb00]"
              >
                <Plus className="h-3.5 w-3.5" />
                Создать магазин
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto px-3 pb-2">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[14px] text-text-secondary">
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("ID", "id")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Название", "name")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Кол-во товаров", "itemCount")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Рейтинг", "rating")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Статус", "status")}
                  </th>
                  <th className="border-b border-border px-3 py-3" />
                </tr>
              </thead>

              <tbody>
                {sortedPartners.map((partner) => (
                  <tr
                    key={`${partner.type}-${partner.id}-${partner.name}`}
                    onClick={() => router.push(`/partners/${partner.id}`)}
                    className="group cursor-pointer transition-colors hover:bg-[#fafafe]"
                  >
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {partner.id}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] font-medium text-text-primary">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ececf1] bg-[#f7f7fa] text-[#b7b8c5]">
                          {partner.photoId ? (
                            <img
                              src={getImageUrl({ id: partner.photoId }, { width: 48, height: 48, fit: "cover" })}
                              alt={partner.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <Store className="h-3.5 w-3.5" />
                          )}
                        </span>
                        {partner.name}
                      </span>
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {partner.itemCount.toLocaleString("ru-RU")} товаров
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-primary">
                      {partner.rating !== null ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#F7BF35] text-[#F7BF35]" />
                          {partner.rating.toFixed(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={cn(
                        "border-b border-border px-3 py-3 text-[16px] font-medium",
                        statusClassNames[partner.statusTone],
                      )}
                    >
                      {partner.statusLabel}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-right">
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
              <Spinner size={32} />
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-sm text-[#E26D5C]">
              Ошибка загрузки партнеров: {error}
            </div>
          )}

          {!loading && !error && sortedPartners.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-sm text-text-secondary">
              По текущим фильтрам партнеры не найдены.
            </div>
          )}

          {!loading && !error && sortedPartners.length > 0 && (
            <div className="px-6 py-4 text-center text-xs text-[#b7b8c5]">{filteredPartnersLabel}</div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
