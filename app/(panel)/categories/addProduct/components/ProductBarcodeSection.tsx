import React from "react";
import { Plus, X, Barcode } from "lucide-react";

interface ProductBarcodeSectionProps {
  mainBarcode: string;
  extraBarcodes: string[];
  onMainBarcodeChange: (value: string) => void;
  onGenerateMainBarcode: () => void;
  onAddExtraBarcode: () => void;
  onExtraBarcodeChange: (index: number, value: string) => void;
  onRemoveExtraBarcode: (index: number) => void;
  inputClasses: string;
  labelClasses: string;
}

export function ProductBarcodeSection({
  mainBarcode,
  extraBarcodes,
  onMainBarcodeChange,
  onGenerateMainBarcode,
  onAddExtraBarcode,
  onExtraBarcodeChange,
  onRemoveExtraBarcode,
  inputClasses,
  labelClasses,
}: ProductBarcodeSectionProps) {
  return (
    <>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center pr-1">
          <label className={labelClasses}>Штрихкод*</label>
          <button
            type="button"
            onClick={onGenerateMainBarcode}
            className="text-[10px] text-blue-500 font-bold uppercase hover:underline"
          >
            Сгенерировать
          </button>
        </div>
        <div className="relative">
          <input
            className={inputClasses}
            value={mainBarcode}
            onChange={(e) => onMainBarcodeChange(e.target.value)}
          />
          <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <button
        type="button"
        onClick={onAddExtraBarcode}
        className="w-full h-[54px] border-2 border-blue-200 rounded-xl text-blue-500 font-bold flex items-center justify-between px-4 hover:bg-blue-50 transition-colors"
      >
        <span>Доп. штрих код</span> <Plus size={20} />
      </button>

      {extraBarcodes.map((bc, i) => (
        <div key={i} className="space-y-1.5 relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Доп. штрихкод {i + 1}
          </label>
          <input
            className={inputClasses}
            value={bc}
            onChange={(e) => onExtraBarcodeChange(i, e.target.value)}
          />
          <X
            className="absolute right-4 top-11 text-gray-300 cursor-pointer hover:text-red-500"
            size={18}
            onClick={() => onRemoveExtraBarcode(i)}
          />
        </div>
      ))}
    </>
  );
}
