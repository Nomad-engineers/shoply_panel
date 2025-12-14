'use client'

import { useState } from 'react';
import SearchCourier from '@/components/couriers/searchCourier';
import CourierInfo from '@/components/couriers/courierInfo';
import PeriodSelector from '@/components/couriers/periodSelector';
import DateRangePicker from '@/components/couriers/dateRangePicker';
import CalculateButton from '@/components/couriers/calculateButton';
import PayoutsTable from '@/components/couriers/payoutsTable';
import InfoPanel from '@/components/couriers/infoPanel';
import ExportTable from '@/components/layout/export-table';
import { CalculateDays } from '@/components/helpers/date-range';
import { useCourier } from '@/components/hooks/useCourier';
import { usePayouts } from '@/components/hooks/usePayouts';



const DeliveryPayoutsPage = () => {
  const [courierId, setCourierId] = useState('');
  const [activePeriod, setActivePeriod] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { courier, loading: courierLoading, fetchCourierData } = useCourier();
  const { payouts, loading: payoutsLoading, fetchPayoutsData } = usePayouts();
  const periods = [
    { id: 'day', label: 'Сегодняшний день' },
    { id: 'month', label: 'Текущий месяц' },
    { id: 'period', label: 'Период' },
  ];

  const handleSearchCourier = () => {
    if (!courierId) return;
    fetchCourierData(courierId);
  };

  const handleCalculate = () => {
    if (!courierId || !activePeriod || !courier) return;
    fetchPayoutsData({ courierId, period: activePeriod, startDate, endDate });
  };

  const handlePeriodChange = (periodId: string) => setActivePeriod(periodId);

  const isCalculateDisabled = () => {
    if (!courierId || !activePeriod || !courier) return true;
    if (activePeriod === 'period') return !startDate || !endDate;
    return false;
  };
  const payoutsExist = !!payouts;

  const dateRange =
    payouts?.date?.dateFrom && payouts?.date?.dateTo
      ? CalculateDays(payouts.date.dateFrom, payouts.date.dateTo)
      : 0;
  return (
    <div className="bg-white rounded-3xl p-6 min-h-screen">
      <SearchCourier
        courierId={courierId}
        setCourierId={setCourierId}
        onSearch={handleSearchCourier}
        isLoading={courierLoading}
      />
      {courier && <CourierInfo courierData={courier} />}
      <PeriodSelector
        periods={periods}
        activePeriod={activePeriod}
        onChange={handlePeriodChange}
        disabled={!courier}
      />
      {activePeriod === 'period' && courier && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      )}
      <div className="flex justify-start mt-6">
        <CalculateButton
          onClick={handleCalculate}
          disabled={isCalculateDisabled()}
          isLoading={payoutsLoading}
        />
      </div>
      {payoutsExist && <PayoutsTable payoutsData={payouts} />}
      {courier && payoutsExist && (
        <InfoPanel
          courierData={courier}
          payoutsData={payouts}
          activePeriod={activePeriod}
          dateRange={dateRange}
        />
      )}
      {payoutsExist && <ExportTable data={payouts.orders} />}
    </div>
  );
};

export default DeliveryPayoutsPage;
