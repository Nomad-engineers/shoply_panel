import React from "react";
import Image from "next/image";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";

interface CategoryListItemProps {
  category: Category;
  isSelected: boolean;
  onToggle: (id: number, e: React.MouseEvent) => void;
  onClick: (id: number, name: string) => void;
}

export function CategoryListItem({ category, isSelected, onToggle, onClick }: CategoryListItemProps) {
  return (
    <div className="flex items-center w-full">
      <div
        onClick={(e) => onToggle(category.id, e)}
        className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
      >
        <CheckCircle2
          className={cn(
            "w-4 h-4 transition-colors",
            isSelected ? "text-[#55CB00]" : "text-gray-300"
          )}
        />
      </div>
      <div
        onClick={() => onClick(category.id, category.name)}
        className="flex items-center w-full justify-between p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            {category.photo ? (
              <Image
                src={category.photo.url}
                alt={category.name}
                width={120}
                height={50}
                className="object-cover rounded-xl transition-all"
              />
            ) : (
              <div className="w-[120px] h-[70px] rounded-xl flex items-center justify-center text-[8px] bg-gray-200 text-gray-400 font-bold">
                Нет фото
              </div>
            )}
          </div>
          <span className="text-sm transition-colors">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">
            {category.subCategory?.length || 0} суб категории
          </p>
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
