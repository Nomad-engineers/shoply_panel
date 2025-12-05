"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function ShopsPaymentsPage() {
  const [activePeriod, setActivePeriod] = useState("month");
  const [shopId, setShopId] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const periods = [
    { id: "today", label: "Сегодняшний день" },
    { id: "month", label: "Текущий месяц" },
    { id: "custom", label: "Период" },
  ];
  return (
    <div className="bg-white rounded-[24px] p-6">
      {/* Shop ID Input */}
      <div className="flex items-center gap-6 mb-6">
        <input
          type="text"
          placeholder="Введите ID магазина"
          value={shopId}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only numbers (including empty string for clearing)
            if (/^\d*$/.test(value)) {
              setShopId(value);
            }
          }}
          className="px-4 py-3 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#55CB00] focus:border-transparent"
          style={{
            width: '354px',
            height: '48px',
            backgroundColor: 'rgba(238, 238, 244, 0.5)',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontStyle: 'medium',
            fontSize: '16px',
            lineHeight: '18px',
            letterSpacing: '0%',
          }}
        />

        <button
          className="flex items-center gap-3 px-6 py-3 text-white rounded-[12px] hover:bg-[#4DA900] transition-colors duration-200"
          style={{
            backgroundColor: '#55CB00',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontStyle: 'medium',
            fontSize: '16px',
            lineHeight: '18px',
            letterSpacing: '0%',
          }}
        >
          <Search size={24} />
          поиск
        </button>
      </div>

      {/* Divider */}
      <div className="h-px mb-6" style={{ backgroundColor: 'rgba(220, 220, 230, 1)' }}></div>

      {/* Period Radio Buttons */}
      <div className="flex space-x-6 mb-6">
        {periods.map((period) => (
          <label key={period.id} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="period"
              value={period.id}
              checked={activePeriod === period.id}
              onChange={(e) => setActivePeriod(e.target.value)}
              className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 focus:ring-blue-500
        -   focus:ring-2"
            />
            <span className="ml-2 text-gray-700">{period.label}</span>
          </label>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {activePeriod === "custom" && (
        <div className="mb-6 p-4 bg-gray-50 rounded-[12px]">
          <DateTimePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
      )}

      {/* Divider */}
      <div className="h-px mb-6" style={{ backgroundColor: 'rgba(220, 220, 230, 1)' }}></div>

      {/* Calculation Button */}
      <div className="flex justify-start mt-6">
        <button
          className="px-6 py-2 text-white rounded-[12px] transition-colors duration-200"
          disabled={!shopId || !activePeriod || (activePeriod === 'custom' && (!startDate || !endDate))}
          style={{
            backgroundColor: shopId && activePeriod && (activePeriod !== 'custom' || (startDate && endDate)) ? '#55CB00' : 'rgba(9, 9, 29, 0.25)',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '18px',
            letterSpacing: '0%',
            textAlign: 'center',
            cursor: shopId && activePeriod && (activePeriod !== 'custom' || (startDate && endDate)) ? 'pointer' : 'not-allowed',
            opacity: shopId && activePeriod && (activePeriod !== 'custom' || (startDate && endDate)) ? 1 : 0.6
          }}
        >
          Расчет
        </button>
      </div>
    </div>
  );
}