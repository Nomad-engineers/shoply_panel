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
import { fetchWithSession } from '@/components/utils/fetch.util';

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

  const getToday = () => new Date().toISOString().split('T')[0];

 

  // ================= ПОИСК КУРЬЕРА =================
  const handleSearchCourier = async () => {
  if (!courierId) return;
  setIsLoading(true);
  try {
    const response = await fetchWithSession(`http://localhost:3001/admin/deliveryMan/${courierId}`);
    if (response.ok) {
      const info = await response.json();
      setCourierFound(true);
      setCourierData(info.data);
      setPayoutsData(null); 
    } else {
      setCourierFound(false);
      setCourierData(null);
      setPayoutsData(null); 
    }
  } catch (error) {
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
      let url = `http://localhost:3001/admin/delivery/${courierId}/payouts?periodType=${activePeriod}`;
      if (activePeriod === 'day') url += `&dateFrom=${getToday()}`;
      else if (activePeriod === 'month') url += `&dateFrom=${getToday()}`;
      else if (activePeriod === 'period' && startDate && endDate) {
        url += `&dateFrom=${startDate}&dateTo=${endDate}`;
      }

      const response = await fetchWithSession(url);
      if (!response.ok) throw new Error('Ошибка при получении выплат');
      const data = await response.json();
      setPayoutsData(data.data);
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

  const dateRange = payoutsData?.date?.dateFrom && payoutsData?.date?.dateTo
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
    </div>
  );
};

export default DeliveryPayoutsPage;
