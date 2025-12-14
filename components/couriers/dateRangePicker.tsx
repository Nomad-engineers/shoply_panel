'use client'
import { Input } from "../ui/input"; 

type Props = {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
};

const DateRangePicker: React.FC<Props> = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-[12px]">
    <div className="flex gap-4">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="flex-1"
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="flex-1"
      />
    </div>
  </div>
);

export default DateRangePicker;
