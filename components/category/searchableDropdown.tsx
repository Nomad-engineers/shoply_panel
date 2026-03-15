"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdown";

interface Option {
  label: string;
  value: string | number;
  subLabel?: string;
}

interface SearchableDropdownProps {
  label: string;
  value: string | number | "" | null;
  options: Option[];
  onSelect: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableDropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  disabled = false,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!disabled) return;

    setIsOpen(false);
    setSearch("");
  }, [disabled]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const s = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(s) ||
        opt.subLabel?.toLowerCase().includes(s)
    );
  }, [options, search]);

  return (
    <div className="relative w-full group">
      <div className="relative">
        <CategoryBaseDropdown
          label={label}
          value={isOpen ? "" : value}
          options={filteredOptions}
          isOpen={isOpen}
          placeholder={placeholder}
          disabled={disabled}
          onToggle={() => {
            if (disabled) return;

            setIsOpen(!isOpen);
            setSearch("");
          }}
          onSelect={(val) => {
            onSelect(val);
            setIsOpen(false);
            setSearch("");
          }}
        />

        {isOpen && !disabled && (
          <div className="absolute inset-0 top-[22px] px-4 flex items-center pointer-events-none">
            <input
              autoFocus
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-800 pointer-events-auto"
              placeholder={selectedOption?.label || placeholder}
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
