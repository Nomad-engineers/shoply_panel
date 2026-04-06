import React from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";

interface CategoryListItemProps {
  category: Category;
  isSelected: boolean;
  onToggle: (id: number, e: React.MouseEvent) => void;
  onClick: (id: number, name: string) => void;
}

export function CategoryListItem({ category, isSelected, onToggle, onClick }: CategoryListItemProps) {
  const subCategoryCount = category.subCategory?.length || 0;

  return (
    <div className="flex w-full items-center gap-[18px]">
      <div
        onClick={(e) => onToggle(category.id, e)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#b8bdcc] bg-white transition-colors"
      >
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            isSelected ? "bg-[#55CB00]" : "bg-transparent"
          )}
        />
      </div>
      <div
        onClick={() => onClick(category.id, category.name)}
        className="flex items-center w-full justify-between border-b px-0 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-[18px]">
          <div className="relative">
            {category.photo?.url ? (
              <div
                style={{
                  backgroundImage: `url("${category.photo.url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: "90px",
                  height: "54px",
                }}
                className="rounded-xl transition-all object-cover"
                aria-label={category.name}
              />
            ) : (
              <div className="h-[54px] w-[90px] rounded-xl flex items-center justify-center text-[8px] bg-gray-200 text-gray-400 font-bold uppercase">
                Нет фото
              </div>
            )}
          </div>
          <span className="text-sm transition-colors">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {subCategoryCount > 0 && (
            <p className="text-xs text-gray-400">
              {subCategoryCount} суб категории
            </p>
          )}
          <ChevronRight
            size={18}
            className={cn(
              "transition-colors",
              isSelected ? "text-[#55CB00]" : "text-gray-500"
            )}
          />
        </div>
      </div>
    </div>
  );
}
