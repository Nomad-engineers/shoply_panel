import { buildPeriodUrl } from "../helpers/date-picker";
import { fetchWithSession } from "./fetch.util";

// Функция для получения данных курьера
export async function fetchCourier(courierId: string) {
  if (!courierId) return null;
  try {
    const res = await fetchWithSession(
      `http://localhost:3001/admin/deliveryMan/${courierId}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

// Функция для получения выплат
export async function fetchPayouts(
  courierId: string,
  period: string,
  startDate?: string,
  endDate?: string
) {
  if (!courierId) return null;

  let url = `http://localhost:3001/admin/delivery/${courierId}/payouts?periodType=${period}`;
  url = buildPeriodUrl(url, period, startDate, endDate);

  try {
    const res = await fetchWithSession(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}
