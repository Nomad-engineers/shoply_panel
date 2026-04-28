import React from "react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onToggle: (id: number, e: React.MouseEvent) => void;
  onClick: (id: number, name: string) => void;
}

export function CategoryCard({ category, isSelected, onToggle, onClick }: CategoryCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center rounded-[24px] cursor-pointer bg-white"
      onClick={() => onClick(category.id, category.name)}
    >
      <div
        onClick={(e) => onToggle(category.id, e)}
        className={cn(
          "absolute top-2 left-2 transition-all z-10",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
            isSelected
              ? "border-[#55CB00] bg-[#55CB00]/10"
              : "border-[#b8bdcc] bg-white"
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              isSelected ? "bg-[#55CB00]" : "bg-transparent"
            )}
          />
        </span>
      </div>

      <div
        className={cn(
          "relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 transition-all border-2",
          isSelected ? "border-[#55CB00]" : "border-transparent"
        )}
        style={{
          backgroundImage: category.photo?.url
            ? `url(${category.photo.url})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {!category.photo && (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 text-[10px] font-bold uppercase">
            Нет фото
          </div>
        )}
      </div>

      <h3 className="text-xs text-center px-2 leading-snug transition-colors">
        {category.name}
      </h3>
    </div>
  );
}
