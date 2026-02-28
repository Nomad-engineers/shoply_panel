"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/theme";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "minimal"; 
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = "Поиск...",
  className,
  variant = "default",
}) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full transition-all outline-none text-sm pr-8",
          // Стили для обычной страницы
          variant === "default" && 
            "pl-10 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100",
          // Стили для модалок (как в твоем EditMenu)
          variant === "minimal" && 
            "pt-2 pb-1.5 bg-transparent border-b border-gray-200 focus:border-gray-400"
        )}
      />
      
      {/* Иконка поиска слева для default, или справа для minimal */}
      <Search 
        className={cn(
          "absolute text-gray-400 pointer-events-none transition-colors",
          variant === "default" ? "left-3 w-4 h-4" : "right-0 w-5 h-5"
        )} 
      />

      {/* Кнопка очистки (появляется если есть текст) */}
      {value && (
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors",
            variant === "default" ? "right-2 w-6 h-6" : "right-6 w-5 h-5"
          )}
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};