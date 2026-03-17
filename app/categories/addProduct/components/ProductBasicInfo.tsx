import React from "react";
import { Hash } from "lucide-react";
import { CategorySubcategorySelector } from "@/components/category/categorySubcategorySelector";
import { Category } from "@/types/category.types";

interface ProductBasicInfoProps {
  formData: {
    categoryId: number;
    name: string;
    article: string;
    subCategoryId: number;
  };
  setFormData: (data: any) => void;
  categories: Category[];
  onCategoryChange: (categoryId: number) => void;
  onSubCategoryChange: (subCategoryId: number) => void;
  onGenerateArticle: () => void;
  inputClasses: string;
  labelClasses: string;
  articleError?: string;
}

export function ProductBasicInfo({
  formData,
  setFormData,
  categories,
  onCategoryChange,
  onSubCategoryChange,
  onGenerateArticle,
  inputClasses,
  labelClasses,
  articleError,
}: ProductBasicInfoProps) {
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

      <CategorySubcategorySelector
        categories={categories}
        categoryId={formData.categoryId}
        subCategoryId={formData.subCategoryId}
        onCategorySelect={onCategoryChange}
        onSubCategorySelect={onSubCategoryChange}
      />
    </>
  );
}
