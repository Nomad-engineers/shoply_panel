// Возвращает сегодняшнюю дату в формате YYYY-MM-DD
export const getToday = (): string => new Date().toISOString().split("T")[0];

export const buildPeriodUrl = (
  baseUrl: string,
  period: string,
  startDate?: string,
  endDate?: string
) => {
  let url = baseUrl;
  if (period === "day" || period === "month") url += `&dateFrom=${getToday()}`;
  if (period === "period" && startDate && endDate)
    url += `&dateFrom=${startDate}&dateTo=${endDate}`;
  return url;
};
