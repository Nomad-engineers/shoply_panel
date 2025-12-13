'use client'
import { CourierData } from '@/types/courier-info';

type Props = { courierData: CourierData };

const CourierInfo: React.FC<Props> = ({ courierData }) => (
  <div className="mb-10">
    <p className="text-sm text-gray-500 mb-2">Найдено</p>
    <p className="text-lg font-semibold text-gray-900 mb-3">
      {courierData?.user?.firstName && courierData?.user?.lastName
        ? `${courierData.user.firstName} ${courierData.user.lastName}`
        : `Курьер ${courierData.id}`}
    </p>
    <p><b>user id:</b> {courierData.user?.id}</p>
    <p><b>delivery id:</b> {courierData.id}</p>
  </div>
);

export default CourierInfo;
