import { useState } from "react";

import { buildPeriodUrl } from "../helpers/date-picker";
import { useAuth } from "./useLogin";

interface UsePayoutsParams {
  courierId: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

interface PayoutsData {
  date: { dateFrom: string; dateTo: string };
  orders: any[];
}

export const usePayouts = () => {
  const { refreshSession, fetchWithSession } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL
  );
  const [payouts, setPayouts] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayoutsData = async ({
    courierId,
    period,
    startDate,
    endDate,
  }: UsePayoutsParams) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery/${courierId}/payouts?periodType=${period}`;
      url = buildPeriodUrl(url, period, startDate, endDate);

      const res = await fetchWithSession(
        url,
        () => localStorage.getItem("access_token"),
        refreshSession
      );
      if (!res.ok) throw new Error("Ошибка при получении выплат");
      const data = await res.json();
      setPayouts(data.data || null);
    } catch (e: any) {
      setError(e.message);
      setPayouts(null);
    } finally {
      setLoading(false);
    }
  };

  return { payouts, loading, error, fetchPayoutsData };
};
