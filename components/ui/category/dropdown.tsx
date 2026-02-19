import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/theme"; 
import { ProductMeasure } from "@/types/category.types";

interface MeasureDropDownProps {
  product: any;
  measureUnique: boolean;
  activeDropdown: number | null;
  setActiveDropdown: (id: number | null) => void;
  toggleFieldUnique: (id: number, field: string) => void;
  changes: { measure: string };
  onMeasureSelect?: (measure: string, productId: number) => void;
}

export const MeasureDropDown = ({
  toggleFieldUnique,
  activeDropdown,
  measureUnique,
  product,
  changes,
  setActiveDropdown,
  onMeasureSelect
}: MeasureDropDownProps) => {
  return (
    <div className="relative">
      <div
        onClick={() => toggleFieldUnique(product.id, "measure")}
        className={cn(
          "rounded-md px-3 py-2 border text-xs transition-all cursor-pointer relative",
          measureUnique
            ? "!border-purple-400 text-purple-600 bg-white"
            : "border-2 border-gray-200 text-gray-700 bg-white"
        )}
      >
        <div className="flex items-center justify-center w-full gap-1.5">
          <span className="truncate">
            {measureUnique
              ? product.measure || "Литр"
              : changes.measure || product.measure || "Литр"}
          </span>

          {measureUnique && (
            <div className="w-1 h-1 bg-purple-600 rounded-full" />
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === product.id ? null : product.id);
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronDown
              size={14}
              className={measureUnique ? "text-purple-400" : "text-gray-400"}
            />
          </div>
        </div>
      </div>

      {activeDropdown === product.id && (
        <>
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => setActiveDropdown(null)}
          />
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-[120] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            {Object.values(ProductMeasure).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  if (onMeasureSelect) onMeasureSelect(m, product.id);
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2.5 text-left text-[11px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};