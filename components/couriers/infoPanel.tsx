'use client'
import { CourierData } from '@/types/courier-info';
import { formatDate } from '../helpers/date-form';

type Props = {
  courierData: CourierData;
  payoutsData: any;
  activePeriod: string;
  dateRange: number;
};

const InfoPanel: React.FC<Props> = ({ courierData, payoutsData, activePeriod, dateRange }) => {
  const getPeriodText = () => {
    const today = new Date();
    if (activePeriod === 'day') return `${formatDate(today.toISOString())} — ${formatDate(today.toISOString())}`;
    if (activePeriod === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return `${formatDate(firstDay.toISOString())} — ${formatDate(today.toISOString())}`;
    }
    return `${formatDate(payoutsData.date.dateFrom)} — ${formatDate(payoutsData.date.dateTo)}`;
  };
  const courierName =
  courierData?.user?.firstName && courierData?.user?.lastName
    ? `${courierData.user.firstName} ${courierData.user.lastName}`
    : `Курьер ${courierData?.id}`;
  const deliveryRate=payoutsData.orders.reduce((sum:number,order:any)=>sum+order.deliveryRate,0)
  const commission=payoutsData.orders.reduce((sum:number,order:any)=>sum+order.subtotalPrice * order.deliveryCommission / 100,0)
  return (
    <div className="mt-10 w-full border-gray-200 flex items-center justify-between text-sm text-gray-900">
      <div>
        <p className="text-gray-500 text-xs mb-1">Период</p>
        <p className="font-bold text-lg">{getPeriodText()}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Дней</p>
        <p className="font-bold text-lg">{dateRange}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Курьер</p>
        <p className="font-bold text-lg">
          {courierName}
        </p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Delivery ID</p>
        <p className="font-bold text-lg">{courierData.id}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">User ID</p>
        <p className="font-bold text-lg">{courierData.user?.id}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Заказов</p>
        <p className="font-bold text-lg">{payoutsData.orders.length || 0}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Ставка</p>
        <p className="font-bold text-lg">
          {deliveryRate} ₽
        </p>
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-1">Комиссия</p>
        <p className="font-bold text-lg">
         {commission} ₽
        </p>
      </div>
    </div>
  );
};

export default InfoPanel;
