import React from "react";
import { ChevronDown } from "lucide-react";
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
    <div className="flex cursor-pointer items-center justify-between py-2">
      <div className="flex flex-1 items-center gap-3">
        <div onClick={(e) => onToggleProducts(subCategoryId, e)}>
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
              isFullySelected
                ? "border-[#55CB00] bg-[#55CB00]/10"
                : isPartiallySelected
                  ? "border-[#55CB00]/60 bg-[#55CB00]/5"
                  : "border-[#b8bdcc] bg-white"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                isFullySelected
                  ? "bg-[#55CB00]"
                  : isPartiallySelected
                    ? "bg-[#55CB00]/60"
                    : "bg-transparent"
              )}
            />
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5" onClick={onToggleOpen}>
          <h2 className="text-[16px] font-normal">{name}</h2>
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
