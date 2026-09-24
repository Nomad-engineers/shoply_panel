"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";
import type {
  DashboardChart,
  DashboardDayStat,
  DashboardPaymentMethods,
  DashboardRevenue,
  DashboardStatusCounts,
} from "./useDashboardData";

export interface ShopTimingPoint {
  date: string;
  minutes: number | null;
}

export interface ShopTiming {
  /** Среднее за текущие 7 дней, мин. */
  minutes: number | null;
  /** Среднее за предыдущие 7 дней, мин. */
  prevMinutes: number | null;
  /** По дням за текущие 7 дней (от старых к новым). */
  daily: ShopTimingPoint[];
}

export interface ShopTimings {
  assembly: ShopTiming;
  confirm: ShopTiming;
}

export interface ShopProducts {
  /** Активные товары (не в архиве). */
  total: number;
  totalPercent: number;
  /** Добавлено за текущий месяц. */
  added: number;
  addedPercent: number;
  /** Новые SKU за месяц (со штрихкодом или артикулом). */
  sku: number;
  skuPercent: number;
  /** Средняя наценка активных товаров, %. */
  markupPercent: number;
  archived: number;
  outOfStock: number;
}

export interface ShopDashboardData {
  loading: boolean;
  error: string | null;
  today: DashboardStatusCounts | null;
  chart: DashboardDayStat[];
  chartTotals: DashboardChart | null;
  revenue: DashboardRevenue | null;
  payments: DashboardPaymentMethods | null;
  timings: ShopTimings | null;
  products: ShopProducts | null;
  refetch: () => void;
}

interface ShopDashboardResponse {
  data: {
    today: DashboardStatusCounts;
    chart: DashboardChart;
    revenue: DashboardRevenue;
    payments: DashboardPaymentMethods;
    timings: ShopTimings;
    products: ShopProducts;
  };
}

const withDayLabels = (days: DashboardDayStat[]): DashboardDayStat[] =>
  days.map((d) => {
    const date = new Date(`${d.date}T00:00:00`);
    return {
      ...d,
      day: date.getDate(),
      weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", ""),
    };
  });

/**
 * Данные главной панели магазина — GET /v2/shop/statistic/dashboard?shopId=.
 * Форма блоков совпадает с админским useDashboardData (today/chart/revenue/payments),
 * плюс timings — понедельные времена сборки/подтверждения для спарклайнов.
 */
export const useShopDashboardData = (shopId: number | null): ShopDashboardData => {
  const fetcher = useAuthFetcher();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["shop-dashboard-statistic", shopId],
    queryFn: () =>
      fetcher<ShopDashboardResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/shop/statistic/dashboard?shopId=${shopId}`,
      ).then((j) => j.data),
    enabled: !!shopId,
  });

  return {
    loading: isLoading,
    error: (error as Error | null)?.message ?? null,
    today: data?.today ?? null,
    chart: data ? withDayLabels(data.chart.days) : [],
    chartTotals: data?.chart ?? null,
    revenue: data?.revenue ?? null,
    payments: data?.payments ?? null,
    timings: data?.timings ?? null,
    products: data?.products ?? null,
    refetch: () => refetch(),
  };
};
