'use client'
import {  SearchIcon } from "lucide-react";
import { Input } from "../ui";
import { Button } from "../ui";

type Props = {
  courierId: string;
  setCourierId: (id: string) => void;
  onSearch: () => void;
  isLoading: boolean;
};

const SearchCourier: React.FC<Props> = ({ courierId, setCourierId, onSearch, isLoading }) => (
  <div className="flex items-center gap-6 mb-6">
    <Input
      type="text"
      value={courierId}
      onChange={(e) => /^\d*$/.test(e.target.value) && setCourierId(e.target.value)}
      placeholder="Введите ID курьера"
      className="w-[354px] h-[48px] bg-[#EEEEF4]/50 rounded-[12px] px-4 py-3"
      iconPosition="left"
    />
    
     <div onClick={onSearch} className="flex items-center">
       <SearchIcon  />
       <Button
        variant="custom-transparent"
        disabled={!courierId || isLoading}
        size="sm"
        className="flex items-center gap-3"
      >
        {isLoading ? "Поиск..." : "поиск"}
      </Button>
     </div>
    
  </div>
);

export default SearchCourier;
