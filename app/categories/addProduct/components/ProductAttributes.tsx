import React from "react";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdown";
import { ProductMeasure } from "@/types/category.types";

interface ProductAttributesProps {
  weight: string | number;
  measure: ProductMeasure;
  isMeasureOpen: boolean;
  setIsMeasureOpen: (open: boolean) => void;
  measureOptions: Array<{ label: string; value: string }>;
  onWeightChange: (value: string) => void;
  onMeasureChange: (value: ProductMeasure) => void;
  inputClasses: string;
  labelClasses: string;
}

export function ProductAttributes({
  weight,
  measure,
  isMeasureOpen,
  setIsMeasureOpen,
  measureOptions,
  onWeightChange,
  onMeasureChange,
  inputClasses,
  labelClasses,
}: ProductAttributesProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className={labelClasses}>Объем \ вес*</label>
        <input
          type="number"
          className={inputClasses}
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
        />
      </div>

      <CategoryBaseDropdown
        label="Единица измерения"
        placeholder="Выберите ед. изм."
        value={measure}
        options={measureOptions}
        isOpen={isMeasureOpen}
        onToggle={() => setIsMeasureOpen(!isMeasureOpen)}
        onSelect={(val) => {
          onMeasureChange(val as ProductMeasure);
          setIsMeasureOpen(false);
        }}
      />
    </>
  );
}
