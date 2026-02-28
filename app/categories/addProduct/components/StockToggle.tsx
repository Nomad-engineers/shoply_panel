import React from "react";
import { cn } from "@/lib/utils";

interface StockToggleProps {
  inStock: boolean;
  onToggle: () => void;
}

export function StockToggle({ inStock, onToggle }: StockToggleProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-t">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors",
          inStock ? "bg-[#55CB00]" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
            inStock ? "left-7" : "left-1"
          )}
        />
      </button>
      <span className="text-sm font-semibold text-gray-700">Товар в наличии</span>
    </div>
  );
}
