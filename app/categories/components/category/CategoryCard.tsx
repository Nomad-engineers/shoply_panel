import React from "react";
import { CheckCircle2 } from "lucide-react";
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
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-colors",
            isSelected ? "border-[#55CB00]" : "border-gray-200"
          )}
        >
          <CheckCircle2
            className={cn(
              "w-5 h-5",
              isSelected ? "text-[#55CB00]" : "text-gray-300"
            )}
          />
        </div>
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
