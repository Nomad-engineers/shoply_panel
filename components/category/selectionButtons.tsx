"use client";

import React from "react";
import { Download, Archive, Edit3 } from "lucide-react";
import { cn } from "@/lib/theme";

interface SelectionActionsProps {
  selectedCount: number;
  onExport?: () => void;
  onArchive?: () => void;
  onEditMenu: () => void;
}

export const SelectionButtons = ({ 
  selectedCount, 
  onExport, 
  onArchive, 
  onEditMenu 
}: SelectionActionsProps) => {
  
  const isVisible = selectedCount > 2;

  return (
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300 ease-in-out",
      isVisible 
        ? "opacity-100 translate-y-0 pointer-events-auto" 
        : "opacity-0 translate-y-2 pointer-events-none"
    )}>
      {/* Кнопка Экспорт */}
      <button 
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-[#F2F7FF] text-[#0066FF] rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
      >
        <Download size={18} /> 
        <span className="hidden sm:inline">Экспорт данных</span>
      </button>
      
      {/* Кнопка Архив */}
      <button 
        onClick={onArchive}
        className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        <Archive size={18} /> 
        <span className="hidden sm:inline">В архив</span>
      </button>
      
      {/* Кнопка Групповое редактирование */}
      <button 
        onClick={onEditMenu}
        className="flex items-center gap-2 px-6 py-2 bg-[#0066FF] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
      >
        <Edit3 size={18} /> 
        <span>Групповое редактирование</span>
      </button>
    </div>
  );
};