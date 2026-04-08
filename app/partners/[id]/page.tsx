"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  Package,
  Store,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  usePartners,
  type V2CategorySummaryDto,
} from "@/components/hooks/usePartners";
import { Spinner } from "@/components/ui";
import { cn, getImageUrl } from "@/lib/utils";

type PartnerSection = "store" | "products" | "categories" | "employees";
type ViewMode = "list" | "grid";

const sectionItems: Array<{
  key: PartnerSection;
  label: string;
  icon: typeof Store;
}> = [
  { key: "store", label: "Страница магазина", icon: Store },
  { key: "products", label: "Товары", icon: Package },
  { key: "categories", label: "Категории", icon: LayoutGrid },
  { key: "employees", label: "Сотрудники", icon: Users },
];

function getCategoryPreview(category: V2CategorySummaryDto) {
  if (category.photoId) {
    return (
      <img
        src={getImageUrl({ id: category.photoId }, { width: 96, height: 96, fit: "cover" })}
        alt={category.name}
        className="h-16 w-16 rounded-[16px] object-cover"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#f4f5fb] text-[18px] font-semibold text-[#9fa3b7]">
      {category.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function PartnerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [activeSection] = useState<PartnerSection>("categories");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [periodLabel, setPeriodLabel] = useState("Сегодня");

  const { partners, loading, error } = usePartners();

  const partner = useMemo(
    () => partners.find((item) => item.id === Number(params.id)) ?? null,
    [params.id, partners],
  );

  const totalProducts = useMemo(
    () =>
      partner?.categories.reduce(
        (total, category) => total + category.productsCount,
        0,
      ) ?? 0,
    [partner],
  );

  if (loading) {
    return (
      <DashboardLayout headerClassName="pl-4 pr-8" contentClassName="min-h-0 p-0">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !partner) {
    return (
      <DashboardLayout headerClassName="pl-4 pr-8" contentClassName="min-h-0 p-0">
        <div className="flex min-h-0 flex-1 items-center justify-center text-[16px] text-[#E26D5C]">
          {error ? `Ошибка загрузки магазина: ${error}` : "Магазин не найден"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerClassName="pl-4 pr-8" contentClassName="min-h-0 p-0">
      <section className="flex min-h-0 flex-1 gap-3">
        <aside className="flex w-[240px] shrink-0 flex-col overflow-hidden rounded-[24px] border border-border bg-white">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <button
              type="button"
              onClick={() => router.push("/partners")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1f2333] transition-colors hover:bg-[#f4f5fb]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {partner.photoId ? (
                <img
                  src={getImageUrl({ id: partner.photoId }, { width: 64, height: 64, fit: "cover" })}
                  alt={partner.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5fb] text-[#9fa3b7]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              )}
              <span className="truncate text-[16px] font-semibold text-[#1f2333]">
                {partner.name}
              </span>
            </div>
          </div>

          <nav className="flex flex-col px-3 py-3">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeSection;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-3 py-3 text-left text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-[#f1f3fb] text-[#1f2333]"
                      : "text-[#303448] hover:bg-[#f7f8fc]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <button
              type="button"
              onClick={() => router.push("/partners")}
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#303448]"
            >
              <ArrowLeft className="h-5 w-5" />
              Назад
            </button>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-[14px] bg-[#f3f4fb] px-4 text-[14px] font-medium text-[#303448]"
            >
              {periodLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[18px] border border-border bg-white">
                  {partner.photoId ? (
                    <img
                      src={getImageUrl({ id: partner.photoId }, { width: 96, height: 96, fit: "cover" })}
                      alt={partner.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-7 w-7 text-[#b4b8c8]" />
                  )}
                </div>
                <h1 className="text-[28px] font-bold leading-none text-[#1b2030]">
                  Все категории
                </h1>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-3 text-[16px] text-[#4b5166]"
                >
                  <span className="inline-flex h-5 w-5 rounded-full border border-[#b8bdcc]" />
                  Выбрать все
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[14px] text-[#a3a7b7]">
                  {totalProducts.toLocaleString("ru-RU")} товаров
                </span>
                <div className="inline-flex rounded-[14px] border border-border bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
                      viewMode === "list"
                        ? "bg-[#f3f4fb] text-[#25293a]"
                        : "text-[#6f7486]",
                    )}
                  >
                    <List className="h-4 w-4" />
                    Список
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
                      viewMode === "grid"
                        ? "bg-[#f3f4fb] text-[#25293a]"
                        : "text-[#6f7486]",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Карточки
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              {partner.categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    router.push(`/partners/${partner.id}/categories/${category.id}`)
                  }
                  className="flex items-center gap-3 border-b border-border py-4 text-left transition-colors hover:bg-[#fafbfe]"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 rounded-full border border-[#b8bdcc]" />
                  <div className="shrink-0">{getCategoryPreview(category)}</div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="truncate text-[16px] font-medium text-[#2a2f41]">
                        {category.name}
                      </span>
                      <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#eef0f7] px-1.5 text-[12px] font-semibold text-[#9ca1b2]">
                        {category.productsCount}
                      </span>
                    </div>
                  </div>

                  <span className="text-[14px] text-[#a3a7b7]">
                    {(category.subCategories?.length ?? 0).toLocaleString("ru-RU")} суб категории
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#8f94a7]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
