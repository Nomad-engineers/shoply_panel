'use client'

type Period = { id: string; label: string };

type Props = {
  periods: Period[];
  activePeriod: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

const PeriodSelector: React.FC<Props> = ({ periods, activePeriod, onChange, disabled }) => (
  <div className="flex space-x-6 mb-6">
    {periods.map(period => (
      <label key={period.id} className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="period"
          value={period.id}
          checked={activePeriod === period.id}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-6 h-6 accent-green-600"
        />
        <span className="ml-2 text-gray-700">{period.label}</span>
      </label>
    ))}
  </div>
);

export default PeriodSelector;
