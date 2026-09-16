import React from "react";
import { cn } from "@/lib/theme";
import { ProductIcon, ShopIcon } from "@/components/layout/icons";

type UploadMode = "products" | "prices";

interface UploadModeToggleProps {
  mode: UploadMode;
  onModeChange: (mode: UploadMode) => void;
}

export function UploadModeToggle({ mode, onModeChange }: UploadModeToggleProps) {
  return (
    <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
      <button
        onClick={() => {
          onModeChange("products");
        }}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
          mode === "products"
            ? "bg-white text-primary-main shadow-sm"
            : "text-gray-500"
        )}
      >
        <ProductIcon className="w-5 h-5" />
        Номенклатура
      </button>
      <button
        onClick={() => {
          onModeChange("prices");
        }}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
          mode === "prices"
            ? "bg-white text-primary-main shadow-sm"
            : "text-gray-500"
        )}
      >
        <ShopIcon className="w-5 h-5" />
        Прайс-лист
      </button>
    </div>
  );
}
