import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/theme";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 p-1 rounded-xl">
      <button
        onClick={() => onViewModeChange("list")}
        className={cn(
          "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
          viewMode === "list"
            ? "bg-white shadow-sm text-primary-main"
            : "text-gray-500"
        )}
      >
        <List className="w-4 h-4" /> Список
      </button>
      <button
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
          viewMode === "grid"
            ? "bg-white shadow-sm text-primary-main"
            : "text-gray-500"
        )}
      >
        <LayoutGrid className="w-4 h-4" /> Карточки
      </button>
    </div>
  );
}
