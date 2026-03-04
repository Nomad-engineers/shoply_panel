"use client";

import React from "react";
import { Download, Archive, Edit3, RotateCcw } from "lucide-react";
import { cn } from "@/lib/theme";

interface SelectionActionsProps {
  selectedCount: number;
  onExport?: () => void;
  activeTab: "active" | "archived";
  onArchive?: () => void;
  onEditMenu: () => void;
  modal: "allCategories" | "singleCategory";
}

export const SelectionButtons = ({
  selectedCount,
  activeTab,
  onExport,
  onArchive,
  onEditMenu,
  modal,
}: SelectionActionsProps) => {
  const isVisible = selectedCount >= 1;
  const isArchivedTab = activeTab === "archived";
  return (
    <div
      className={cn(
        "flex items-center gap-3 transition-all duration-300 ease-in-out",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      {/* Скрываем Экспорт и Редактирование, если мы в архиве */}
      {!isArchivedTab && (
        <>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#F2F7FF] text-[#0066FF] rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Экспорт данных</span>
          </button>

          {modal == "singleCategory" && (
            <button
              onClick={onEditMenu}
              className="flex items-center gap-2 px-6 py-2 bg-[#0066FF] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
            >
              <Edit3 size={18} />
              <span>Групповое редактирование</span>
            </button>
          )}
        </>
      )}

      {/* Кнопка Архив / Вернуть из архива */}
      <button
        onClick={onArchive}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          isArchivedTab
            ? "bg-[#55CB00]/10 text-[#55CB00] hover:bg-[#55CB00]/20" // Стили для возврата (зеленоватые)
            : "bg-[#F5F5F5] text-gray-500 hover:bg-gray-200"
        )}
      >
        {isArchivedTab ? (
          <>
            <RotateCcw size={18} />
            <span>Вернуть из архива</span>
          </>
        ) : (
          <>
            <Archive size={18} />
            <span>В архив</span>
          </>
        )}
      </button>
    </div>
  );
};