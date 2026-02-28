"use client";

import React, { useState, useMemo } from "react";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdown";

interface Option {
  label: string;
  value: string | number;
  subLabel?: string;
}

interface SearchableDropdownProps {
  label: string;
  value: string | number;
  options: Option[];
  onSelect: (value: any) => void;
  placeholder?: string;
}

export const SearchableDropdown = ({
  label,
  value,
  options,
  onSelect,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value), 
  [options, value]);

  const filteredOptions = useMemo(() => {
    const s = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(s) ||
        opt.subLabel?.toLowerCase().includes(s)
    );
  }, [options, search]);

  const displayValue = isOpen ? search : (selectedOption?.label || "");

  return (
    <div className="relative w-full group">
      <div className="relative">
          <CategoryBaseDropdown
            label={label}
            // ИСПРАВЛЕНИЕ: Если поиск открыт, передаем пустую строку, 
            // чтобы компонент не рисовал старый текст под инпутом
            value={isOpen ? "" : value} 
            options={filteredOptions}
            isOpen={isOpen}
            onToggle={() => {
              setIsOpen(!isOpen);
              setSearch("");
            }}
            onSelect={(val) => {
              onSelect(val);
              setIsOpen(false);
              setSearch("");
            }}
          />
          
          {isOpen && (
            <div className="absolute inset-0 top-[22px] px-4 flex items-center pointer-events-none">
              <input
                autoFocus
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-800 pointer-events-auto"
                // ПЛЮС: можно старое значение показать как placeholder (серым цветом)
                placeholder={selectedOption?.label}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
    </div>
  );
};