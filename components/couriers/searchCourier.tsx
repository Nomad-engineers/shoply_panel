'use client'
import { Search } from 'lucide-react';

type Props = {
  courierId: string;
  setCourierId: (id: string) => void;
  onSearch: () => void;
  isLoading: boolean;
};

const SearchCourier: React.FC<Props> = ({ courierId, setCourierId, onSearch, isLoading }) => (
  <div className="flex items-center gap-6 mb-6">
    <input
      type="text"
      value={courierId}
      onChange={(e) => /^\d*$/.test(e.target.value) && setCourierId(e.target.value)}
      placeholder="Введите ID курьера"
      className="px-4 py-3 border border-gray-300 rounded-[12px]"
      style={{ width: '354px', height: '48px', backgroundColor: 'rgba(238, 238, 244, 0.5)' }}
    />
    <button
      onClick={onSearch}
      disabled={!courierId || isLoading}
      className="flex items-center gap-3 px-6 py-3 text-gray-950 rounded-[12px]"
    >
      <Search size={24} />
      {isLoading ? 'Поиск...' : 'поиск'}
    </button>
  </div>
);

export default SearchCourier;
