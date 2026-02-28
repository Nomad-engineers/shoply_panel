import React from "react";
import { Hash } from "lucide-react";
import { SearchableDropdown } from "@/components/category/searchableDropdown";

interface ProductBasicInfoProps {
  formData: {
    name: string;
    article: string;
    subCategoryId: number;
  };
  setFormData: (data: any) => void;
  subCategoryOptions: Array<{ label: string; value: number; subLabel?: string }>;
  onGenerateArticle: () => void;
  inputClasses: string;
  labelClasses: string;
  articleError?: string;
}

export function ProductBasicInfo({
  formData,
  setFormData,
  subCategoryOptions,
  onGenerateArticle,
  inputClasses,
  labelClasses,
  articleError,
}: ProductBasicInfoProps) {
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <>
      <div className="space-y-1.5">
        <label className={labelClasses}>Название*</label>
        <input
          className={inputClasses}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center pr-1">
          <label className={labelClasses}>Артикул</label>
          <button
            type="button"
            onClick={onGenerateArticle}
            className="text-[10px] text-blue-500 font-bold uppercase hover:underline"
          >
            Сгенерировать
          </button>
        </div>
        <div className="relative">
          <input
            className={inputClasses}
            value={formData.article}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, article: val });
            }}
            placeholder="Напр. 425231734"
            maxLength={10}
          />
          <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {articleError && (
          <p className="text-red-500 text-xs mt-1 ml-1">{articleError}</p>
        )}
      </div>

      <SearchableDropdown
        label="Подкатегория"
        value={formData.subCategoryId}
        options={subCategoryOptions}
        onSelect={(val: number) => setFormData({ ...formData, subCategoryId: val })}
      />
    </>
  );
}
