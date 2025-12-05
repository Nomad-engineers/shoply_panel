"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function DateTimePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateTimePickerProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">От:</label>
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd.MM.yy"
          className="px-3 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#55CB00] focus:border-transparent"
          calendarClassName="shadow-lg border-0"
        />
      </div>

      <div className="flex items-center justify-center h-10">
        <span className="text-gray-500">-</span>
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">До:</label>
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd.MM.yy"
          className="px-3 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#55CB00] focus:border-transparent"
          calendarClassName="shadow-lg border-0"
        />
      </div>
    </div>
  );
}