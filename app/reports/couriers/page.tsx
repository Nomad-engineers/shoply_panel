'use client'
import { useState } from 'react';
import SearchCourier from '@/components/couriers/searchCourier';
import CourierInfo from '@/components/couriers/courierInfo';
import PeriodSelector from '@/components/couriers/periodSelector';
import DateRangePicker from '@/components/couriers/dateRangePicker';
import CalculateButton from '@/components/couriers/calculateButton';
import PayoutsTable from '@/components/couriers/payoutsTable';
import InfoPanel from '@/components/couriers/infoPanel';
import { CourierData } from '@/types/courier-info';
import { CalculateDays } from '@/components/helpers/date-range';
import { fetchCourier, fetchPayouts } from '@/components/utils/courier-api';
import ExportTable from '@/components/layout/export-table';
const DeliveryPayoutsPage = () => {
  const [courierId, setCourierId] = useState('');
  const [activePeriod, setActivePeriod] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [courierFound, setCourierFound] = useState(false);
  const [courierData, setCourierData] = useState<CourierData | null>(null);
  const [payoutsData, setPayoutsData] = useState<any | null>(null);

  const periods = [
    { id: 'day', label: 'Сегодняшний день' },
    { id: 'month', label: 'Текущий месяц' },
    { id: 'period', label: 'Период' },
  ];
  const handleSearchCourier = async () => {
    if (!courierId) return;
    setIsLoading(true);
    try {
      const data = await fetchCourier(courierId);
      if (data) {
        setCourierFound(true);
        setCourierData(data);
        setPayoutsData(null);
      } else {
        setCourierFound(false);
        setCourierData(null);
        setPayoutsData(null);
      }
    } catch {
      setCourierFound(false);
      setCourierData(null);
      setPayoutsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= РАСЧЕТ ВЫПЛАТ =================
  const handleCalculate = async () => {
    if (!courierId || !activePeriod || !courierFound) return;
    setIsLoading(true);
    try {
      const data = await fetchPayouts(courierId, activePeriod, startDate, endDate);
      setPayoutsData(data);
    } catch {
      setPayoutsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (periodId: string) => setActivePeriod(periodId);
  const isCalculateDisabled = () => {
    if (!courierId || !activePeriod || !courierFound) return true;
    if (activePeriod === 'period') return !startDate || !endDate;
    return false;
  };
 
  const dateRange = payoutsData?.date.dateFrom && payoutsData?.date?.dateTo
    ? CalculateDays(payoutsData.date.dateFrom, payoutsData.date.dateTo)
    : 0;
  return (
    <div className="bg-white rounded-[24px] p-6 min-h-screen">
      <SearchCourier courierId={courierId} setCourierId={setCourierId} onSearch={handleSearchCourier} isLoading={isLoading} />
      {courierFound && courierData && <CourierInfo courierData={courierData} />}
      <PeriodSelector periods={periods} activePeriod={activePeriod} onChange={handlePeriodChange} disabled={!courierFound} />
      {activePeriod === 'period' && courierFound && (
        <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      )}
      <div className="flex justify-start mt-6">
        <CalculateButton onClick={handleCalculate} disabled={isCalculateDisabled()} isLoading={isLoading} />
      </div>
      {payoutsData && <PayoutsTable payoutsData={payoutsData} />}
      {courierFound && courierData && payoutsData && (
        <InfoPanel courierData={courierData} payoutsData={payoutsData} activePeriod={activePeriod} dateRange={dateRange} />
      )}
      {payoutsData && <ExportTable data={payoutsData.orders}/>}
    </div>
  );
};

export default DeliveryPayoutsPage;
