"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, Star } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Switch } from "@/components/ui";
import { cn } from "@/lib/theme";

type PartnerType = "Магазины" | "Рестораны" | "Сервисы";
type PartnerStatusTone = "open" | "closed" | "draft" | "archived";

interface PartnerRow {
  id: number;
  name: string;
  type: PartnerType;
  itemCount: number;
  rating: number;
  statusLabel: string;
  statusTone: PartnerStatusTone;
  archived?: boolean;
}

const partnerTypes: { label: PartnerType; count: number }[] = [
  { label: "Магазины", count: 48 },
  { label: "Рестораны", count: 12 },
  { label: "Сервисы", count: 5 },
];

const partnerRows: PartnerRow[] = [
  {
    id: 12,
    name: "Большак",
    type: "Магазины",
    itemCount: 450,
    rating: 4.4,
    statusLabel: "Открыт до 22:00",
    statusTone: "open",
  },
  {
    id: 72,
    name: "Южная Кухня",
    type: "Рестораны",
    itemCount: 12,
    rating: 4.9,
    statusLabel: "Закрыт до 7 мая, 11:00",
    statusTone: "closed",
  },
  {
    id: 12,
    name: "Сауран",
    type: "Магазины",
    itemCount: 48,
    rating: 4.3,
    statusLabel: "Архив",
    statusTone: "archived",
    archived: true,
  },
  {
    id: 12,
    name: "Арсенал",
    type: "Магазины",
    itemCount: 120,
    rating: 4.8,
    statusLabel: "Открыт до 22:00",
    statusTone: "open",
  },
  {
    id: 72,
    name: "Ван Корона",
    type: "Сервисы",
    itemCount: 1250,
    rating: 4.9,
    statusLabel: "Открыт до 22:00",
    statusTone: "open",
  },
  {
    id: 12,
    name: "TEN HOUSE",
    type: "Рестораны",
    itemCount: 120,
    rating: 4.9,
    statusLabel: "Открыт до 22:00",
    statusTone: "open",
  },
  {
    id: 9,
    name: "Gastro Hub",
    type: "Рестораны",
    itemCount: 0,
    rating: 0,
    statusLabel: "Черновик",
    statusTone: "draft",
  },
];

const statusClassNames: Record<PartnerStatusTone, string> = {
  open: "text-[#71B84D]",
  closed: "text-[#E26D5C]",
  draft: "text-[#B29A32]",
  archived: "text-[#6A8EE5]",
};

export default function PartnersPage() {
  const [activeType, setActiveType] = useState<PartnerType>("Магазины");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [periodLabel, setPeriodLabel] = useState("Месяц");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

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
  }, [activeType, searchQuery, showArchived]);

  const header = (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-text-primary">
            Партнеры
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
        {partnerTypes.map((item) => {
          const isActive = item.label === activeType;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveType(item.label)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#f3f8ec] text-text-primary"
                  : "text-text-secondary hover:bg-[#f6f6fa] hover:text-text-primary",
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                  isActive
                    ? "bg-white text-text-secondary"
                    : "bg-[#f1f1f5] text-text-secondary",
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

  return (
    <DashboardLayout header={header}>
      <section className="flex min-h-[70vh] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="relative block w-[230px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск"
                className="h-9 w-full rounded-full border border-[#ececf1] bg-[#f8f8fb] pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary/80"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <Switch checked={showArchived} onCheckedChange={setShowArchived} />
              <span>Показать архивные</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPeriodOpen((open) => !open)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-[#ececf1] bg-[#f8f8fb] px-4 text-sm font-medium text-text-primary"
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
                <div className="absolute right-0 top-11 z-10 min-w-[148px] rounded-2xl border border-border bg-white p-1 shadow-lg">
                  {["День", "Неделя", "Месяц"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPeriodLabel(option);
                        setIsPeriodOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors",
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
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#74cd4b] px-4 text-sm font-semibold text-white shadow-sm transition-transform hover:translate-y-[-1px]"
            >
              <Plus className="h-4 w-4" />
              Создать магазин
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-text-secondary">
                <th className="border-b border-border px-4 py-4 font-medium">ID</th>
                <th className="border-b border-border px-4 py-4 font-medium">Название</th>
                <th className="border-b border-border px-4 py-4 font-medium">Кол-во товаров</th>
                <th className="border-b border-border px-4 py-4 font-medium">Рейтинг</th>
                <th className="border-b border-border px-4 py-4 font-medium">Статус</th>
                <th className="border-b border-border px-4 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredPartners.map((partner) => (
                <tr
                  key={`${partner.type}-${partner.id}-${partner.name}`}
                  className="group cursor-pointer transition-colors hover:bg-[#fafafe]"
                >
                  <td className="border-b border-border px-4 py-4 text-sm text-text-secondary">
                    {partner.id}
                  </td>
                  <td className="border-b border-border px-4 py-4 text-sm font-medium text-text-primary">
                    {partner.name}
                  </td>
                  <td className="border-b border-border px-4 py-4 text-sm text-text-secondary">
                    {partner.itemCount.toLocaleString("ru-RU")} товаров
                  </td>
                  <td className="border-b border-border px-4 py-4 text-sm text-text-primary">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-[#F7BF35] text-[#F7BF35]" />
                      {partner.rating > 0 ? partner.rating.toFixed(1) : "—"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "border-b border-border px-4 py-4 text-sm",
                      statusClassNames[partner.statusTone],
                    )}
                  >
                    {partner.statusLabel}
                  </td>
                  <td className="border-b border-border px-4 py-4 text-right">
                    <ChevronRight className="ml-auto h-4 w-4 text-[#b9bbc6] transition-transform group-hover:translate-x-0.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-16 text-sm text-text-secondary">
            По текущим фильтрам партнеры не найдены.
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
