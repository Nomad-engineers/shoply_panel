import React from "react";
import { Category } from "@/types/category.types";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridViewProps {
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number, e: React.MouseEvent) => void;
  onClick: (id: number, name: string) => void;
}

export function CategoryGridView({
  categories,
  selectedIds,
  onToggle,
  onClick,
}: CategoryGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
      {categories.map((cat: Category, index) => {
        const isSelected = selectedIds.includes(cat.id);
        return (
          <CategoryCard
            key={`${cat.id}-${index}`}
            category={cat}
            isSelected={isSelected}
            onToggle={onToggle}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
}
