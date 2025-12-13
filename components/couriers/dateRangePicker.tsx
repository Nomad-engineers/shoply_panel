'use client'

type Props = {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
};

const DateRangePicker: React.FC<Props> = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-[12px]">
    <div className="flex gap-4">
      <input type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-[12px]" />
      <input type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-[12px]" />
    </div>
  </div>
);

export default DateRangePicker;
