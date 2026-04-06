import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/theme";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex rounded-[14px] border border-border bg-white p-1">
      <button
        onClick={() => onViewModeChange("list")}
        className={cn(
          "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
          viewMode === "list"
            ? "bg-[#f3f4fb] text-[#25293a]"
            : "text-[#6f7486]"
        )}
      >
        <List className="w-4 h-4" /> Список
      </button>
      <button
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
          viewMode === "grid"
            ? "bg-[#f3f4fb] text-[#25293a]"
            : "text-[#6f7486]"
        )}
      >
        <LayoutGrid className="w-4 h-4" /> Карточки
      </button>
    </div>
  );
}
