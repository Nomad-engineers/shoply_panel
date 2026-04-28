"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Grid2x2,
  List,
  Plus,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { usePartners } from "@/components/hooks/usePartners";
import {
  usePartnerCategoryProducts,
  type V2PartnerCategoryProductDto,
  type V2PartnerSubCategoryDto,
} from "@/components/hooks/usePartnerCategoryProducts";
import { cn, getImageUrl } from "@/lib/utils";

type ProductsTab = "products" | "archive";
type ViewMode = "list" | "grid";

function formatMeasure(product: V2PartnerCategoryProductDto) {
  const value = Number.isInteger(product.weight)
    ? String(product.weight)
    : product.weight.toLocaleString("ru-RU");

  switch (product.measure) {
    case "liter":
      return `${value} литр`;
    case "kg":
      return `${value} кг`;
    case "gram":
      return `${value} г`;
    case "ml":
      return `${value} мл`;
    case "pc":
    case "unit":
      return `${value} шт`;
    default:
      return `${value} ${product.measure}`;
  }
}

function ProductRow({ product }: { product: V2PartnerCategoryProductDto }) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1.6fr)_1fr_120px_110px_120px] items-center gap-4 border-b border-border py-3">
      <span className="inline-flex h-5 w-5 rounded-full border border-[#b8bdcc]" />

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#f4f5fb]">
          {product.photos?.[0] ? (
            <img
              src={getImageUrl({ id: product.photos[0] }, { width: 80, height: 80, fit: "cover" })}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle,_#eceef6_1px,_transparent_1px)] [background-size:4px_4px]" />
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-[16px] font-medium text-[#2a2f41]">
            {product.name}
          </div>
          <div className="mt-0.5 text-[12px] text-[#a3a7b7]">
            12.02.2025&nbsp;&nbsp; ID: {product.productId}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[14px] text-[#2a2f41]">
        <Copy className="h-4 w-4 text-[#5f8cff]" />
        <span>{product.barcodes[0] ?? "—"}</span>
      </div>

      <div className="text-[14px] text-[#2a2f41]">{formatMeasure(product)}</div>
      <div className="text-[14px] font-medium text-[#2a2f41]">
        {product.price.toLocaleString("ru-RU")} ₽
      </div>
      <div
        className={cn(
          "text-[14px] font-medium",
          product.inStock ? "text-[#71B84D]" : "text-[#E26D5C]",
        )}
      >
        {product.inStock ? "В наличии" : "Нет в наличии"}
      </div>
    </div>
  );
}

function SubCategorySection({
  section,
  expanded,
  onToggle,
}: {
  section: V2PartnerSubCategoryDto;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <span className="inline-flex h-5 w-5 rounded-full border border-[#b8bdcc]" />
        <span className="text-[16px] font-medium text-[#2a2f41]">{section.name}</span>
        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#eef0f7] px-1.5 text-[12px] font-semibold text-[#9ca1b2]">
          {section.products.length}
        </span>
        <span className="ml-auto">{expanded ? <ChevronUp className="h-4 w-4 text-[#7b8094]" /> : <ChevronDown className="h-4 w-4 text-[#7b8094]" />}</span>
      </button>

      {expanded && (
        <div>
          {section.products.map((product) => (
            <ProductRow key={`${section.id}-${product.productId}`} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartnerCategoryProductsPage() {
  const router = useRouter();
  const params = useParams<{ id: string; categoryId: string }>();
  const [activeTab, setActiveTab] = useState<ProductsTab>("products");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const shopId = Number(params.id);
  const categoryId = Number(params.categoryId);

  const { partners, loading: partnersLoading } = usePartners();
  const {
    categoryData,
    loading: productsLoading,
    error,
  } = usePartnerCategoryProducts(shopId, categoryId);

  const partner = useMemo(
    () => partners.find((item) => item.id === shopId) ?? null,
    [partners, shopId],
  );

  const archivedCount = useMemo(
    () =>
      categoryData?.subCategories.reduce(
        (total, subCategory) =>
          total +
          subCategory.products.filter((product) => Boolean(product.archivedAt)).length,
        0,
      ) ?? 0,
    [categoryData],
  );

  const activeCount = useMemo(
    () =>
      categoryData?.subCategories.reduce(
        (total, subCategory) =>
          total +
          subCategory.products.filter((product) => !product.archivedAt).length,
        0,
      ) ?? 0,
    [categoryData],
  );

  const visibleSections = useMemo(() => {
    if (!categoryData) {
      return [];
    }

    return categoryData.subCategories
      .map((subCategory) => ({
        ...subCategory,
        products: subCategory.products.filter((product) =>
          activeTab === "archive" ? Boolean(product.archivedAt) : !product.archivedAt,
        ),
      }))
      .filter((subCategory) => subCategory.products.length > 0);
  }, [activeTab, categoryData]);

  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const resolvedExpandedIds = useMemo(() => {
    if (expandedIds.length > 0) {
      return expandedIds;
    }

    return visibleSections.map((section) => section.id);
  }, [expandedIds, visibleSections]);

  const toggleSection = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const header = (
    <div className="flex w-full items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <h1 className="text-[28px] font-bold leading-none text-[#111322]">Товары</h1>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={cn(
              "inline-flex items-center gap-2 text-[20px] font-semibold",
              activeTab === "products" ? "text-[#1f2333]" : "text-[#52576b]",
            )}
          >
            <span className="relative after:absolute after:-bottom-[8px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']">
              Товары
            </span>
            <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e5e6ee] px-1.5 text-[12px] font-semibold text-[#9a9dab]">
              {activeCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("archive")}
            className={cn(
              "inline-flex items-center gap-2 text-[20px] font-semibold",
              activeTab === "archive" ? "text-[#1f2333]" : "text-[#52576b]",
            )}
          >
            <span className="relative">{`Архив`}</span>
            <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e5e6ee] px-1.5 text-[12px] font-semibold text-[#9a9dab]">
              {archivedCount}
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#d9ddea] bg-white px-4 text-[14px] font-medium text-[#3b4052]"
        >
          Импорт товаров
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#55CB00] px-4 text-[14px] font-semibold text-white"
        >
          Добавить товар
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (partnersLoading || productsLoading) {
    return (
      <DashboardLayout header={header} headerClassName="pl-4 pr-8" contentClassName="min-h-0 p-0">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !partner || !categoryData) {
    return (
      <DashboardLayout header={header} headerClassName="pl-4 pr-8" contentClassName="min-h-0 p-0">
        <div className="flex min-h-0 flex-1 items-center justify-center text-[16px] text-[#E26D5C]">
          {error ? `Ошибка загрузки товаров: ${error}` : "Категория не найдена"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/partners/${partner.id}`)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1f2333] transition-colors hover:bg-[#f4f5fb]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-[28px] font-bold leading-none text-[#1b2030]">
                  {categoryData.category.name}
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-[14px] text-[#4b5166]"
                >
                  <Search className="h-4 w-4" />
                  Фильтр
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[14px] text-[#a3a7b7]">
                  {categoryData.meta.total.toLocaleString("ru-RU")} товаров
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
                    <Grid2x2 className="h-4 w-4" />
                    Карточки
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mb-2 inline-flex items-center gap-3 text-[16px] text-[#4b5166]"
            >
              <span className="inline-flex h-5 w-5 rounded-full border border-[#b8bdcc]" />
              Выбрать все
            </button>

            <div className="flex flex-col">
              {visibleSections.map((section) => (
                <SubCategorySection
                  key={section.id}
                  section={section}
                  expanded={resolvedExpandedIds.includes(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
