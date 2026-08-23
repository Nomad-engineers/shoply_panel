"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthFetcher } from "../providers/QueryProvider";

export interface DashboardStatusCounts {
  inWork: number;
  delivered: number;
  cancelled: number;
  pending: number;
  assembling: number;
  ready: number;
  delivery: number;
}

export interface DashboardDayStat {
  date: string;
  day: number;
  weekday: string;
  completed: number;
  cancelled: number;
  active: number;
}

export interface DashboardChart {
  days: DashboardDayStat[];
  total: number;
  completed: number;
  cancelled: number;
  cancelledPercent: number;
  ordersPerDay: number;
}

export interface DashboardUsersQuarter {
  total: number;
  totalPercent: number;
  newCount: number;
  newPercent: number;
  activePercent: number;
}

export interface DashboardClientsMonth {
  total: number;
  newCount: number;
  lost: number;
}

export interface DashboardRevenue {
  total: number;
  courierPayouts: number;
  companyIncome: number;
  partnerIncome: number;
  sellerTurnover: number;
}

export interface DashboardPaymentMethods {
  cash: number;
  sbp: number;
  kaspi: number;
}

export interface DashboardAvgTimes {
  closeMinutes: number | null;
  deliveryMinutes: number | null;
  assemblyMinutes: number | null;
  confirmMinutes: number | null;
}

export interface DashboardData {
  loading: boolean;
  error: string | null;
  today: DashboardStatusCounts | null;
  chart: DashboardDayStat[];
  chartTotals: DashboardChart | null;
  usersQuarter: DashboardUsersQuarter | null;
  clientsMonth: DashboardClientsMonth | null;
  revenue: DashboardRevenue | null;
  payments: DashboardPaymentMethods | null;
  avgTimes: DashboardAvgTimes | null;
  refetch: () => void;
}

interface DashboardResponse {
  data: {
    today: DashboardStatusCounts;
    chart: DashboardChart & { days: { date: string; completed: number; cancelled: number; active: number }[] };
    usersQuarter: DashboardUsersQuarter;
    clientsMonth: DashboardClientsMonth;
    revenue: DashboardRevenue;
    payments: DashboardPaymentMethods;
    avgTimes: DashboardAvgTimes;
  };
}

const withDayLabels = (
  days: DashboardResponse["data"]["chart"]["days"],
): DashboardDayStat[] =>
  days.map((d) => {
    const date = new Date(`${d.date}T00:00:00`);
    return {
      ...d,
      day: date.getDate(),
      weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", ""),
    };
  });

export const useDashboardData = (options: { skip?: boolean } = {}): DashboardData => {
  const fetcher = useAuthFetcher();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-statistic"],
    queryFn: () => fetcher<DashboardResponse>("/v2/admin/statistic/dashboard").then((j) => j.data),
    enabled: !options.skip,
  });

  return {
    loading: isLoading,
    error: (error as Error | null)?.message ?? null,
    today: data?.today ?? null,
    chart: data ? withDayLabels(data.chart.days) : [],
    chartTotals: data ? data.chart : null,
    usersQuarter: data?.usersQuarter ?? null,
    clientsMonth: data?.clientsMonth ?? null,
    revenue: data?.revenue ?? null,
    payments: data?.payments ?? null,
    avgTimes: data?.avgTimes ?? null,
    refetch: () => refetch(),
  };
};
