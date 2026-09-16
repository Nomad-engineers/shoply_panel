import React from "react";

interface ProductFinanceInfoProps {
  purchasePrice: string | number;
  markup: string | number;
  onFinanceChange: (field: "price" | "markup" | "purchasePrice", value: string) => void;
  inputClasses: string;
  labelClasses: string;
}

export function ProductFinanceInfo({
  purchasePrice,
  markup,
  onFinanceChange,
  inputClasses,
  labelClasses,
}: ProductFinanceInfoProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className={labelClasses}>Цена закупки*</label>
        <div className="relative">
          <input
            type="number"
            className={inputClasses}
            value={purchasePrice === "" ? "" : purchasePrice}
            onChange={(e) => onFinanceChange("purchasePrice", e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            Руб
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClasses}>Накрутка*</label>
        <div className="relative">
          <input
            type="number"
            className={inputClasses}
            value={markup === "" ? "" : markup}
            onChange={(e) => onFinanceChange("markup", e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
        </div>
      </div>
    </>
  );
}
