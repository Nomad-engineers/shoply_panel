export function CalculateDays(dateFrom: string, dateTo: string) {
  const from = new Date(dateFrom).getTime();
  const to = new Date(dateTo).getTime();

  // Разница в миллисекундах
  const diffTime = to - from;

  // Переводим в дни
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
