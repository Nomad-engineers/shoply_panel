import { useState, useCallback } from "react";
import { fetchWithSession } from "../utils/fetch.util";
import { useAuth } from "./useLogin";

export const useCourier = () => {
  const { refreshSession } = useAuth(process.env.NEXT_PUBLIC_DIRECTUS_URL);
  const [courier, setCourier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourierData = useCallback(
    async (courierId: string) => {
      if (!courierId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetchWithSession(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/deliveryMan/${courierId}`,
          () => localStorage.getItem("access_token"),
          refreshSession
        );
        if (!res.ok) throw new Error("Ошибка при получении курьера");
        const data = await res.json();
        setCourier(data.data);
      } catch (e: any) {
        setError(e.message);
        setCourier(null);
      } finally {
        setLoading(false);
      }
    },
    [refreshSession]
  );

  return { courier, loading, error, fetchCourierData };
};
