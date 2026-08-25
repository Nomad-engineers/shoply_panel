export enum OrderLogAction {
  CREATED = 'created',
  ASSEMBLING = 'assembling',
  READY = 'ready',
  COURIER_ASSIGNED = 'courier_assigned',
  COMPLETED = 'completed',
  UPDATED = 'updated',
  CANCELLED = 'cancelled',
  RETURNED_TO_WORK = 'returned_to_work',
  FORCE_COMPLETED = 'force_completed',
  COSTS_ADDED = 'costs_added',
}

export function getOrderLogActionTranslation(action: OrderLogAction): string {
  const translations: Record<OrderLogAction, string> = {
    [OrderLogAction.CREATED]: 'Заказ создан',
    [OrderLogAction.ASSEMBLING]: 'Передан в сборку',
    [OrderLogAction.READY]: 'Сборка завершена',
    [OrderLogAction.COURIER_ASSIGNED]: 'Назначен курьер',
    [OrderLogAction.COMPLETED]: 'Заказ завершён',
    [OrderLogAction.UPDATED]: 'Заказ обновлён',
    [OrderLogAction.CANCELLED]: 'Заказ отменён',
    [OrderLogAction.RETURNED_TO_WORK]: 'Возвращён в работу',
    [OrderLogAction.FORCE_COMPLETED]: 'Принудительно завершён',
    [OrderLogAction.COSTS_ADDED]: 'Добавлены расходы',
  };
  return translations[action] || action;
}
