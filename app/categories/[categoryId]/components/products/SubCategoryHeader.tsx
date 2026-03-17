import React from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/theme";

interface SubCategoryHeaderProps {
  name: string;
  displayCount: number;
  isOpen: boolean;
  isFullySelected: boolean;
  isPartiallySelected: boolean;
  onToggleProducts: (subId: number, e: React.MouseEvent) => void;
  onToggleOpen: () => void;
  subCategoryId: number;
}

export function SubCategoryHeader({
  name,
  displayCount,
  isOpen,
  isFullySelected,
  isPartiallySelected,
  onToggleProducts,
  onToggleOpen,
  subCategoryId,
}: SubCategoryHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 cursor-pointer">
      <div className="flex items-center gap-3 flex-1">
        <div onClick={(e) => onToggleProducts(subCategoryId, e)}>
          <CheckCircle2
            className={cn(
              "w-5 h-5",
              isFullySelected
                ? "text-[#55CB00]"
                : isPartiallySelected
                  ? "text-[#55CB00]/50"
                  : "text-gray-300"
            )}
          />
        </div>
        <div className="flex items-center gap-3 flex-1" onClick={onToggleOpen}>
          <h2 className="text-md font-semibold">{name}</h2>
          <span className="bg-[#F5F7F9] px-2 py-0.5 rounded-full text-[10px] text-gray-400 font-bold">
            {displayCount}
          </span>
        </div>
      </div>
      <ChevronDown
        className={cn(
          "w-5 h-5 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )}
      />
    </div>
  );
}
