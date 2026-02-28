import React from "react";
import { Category } from "@/types/category.types";
import { CategoryListItem } from "./CategoryListItem";

interface CategoryListViewProps {
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number, e: React.MouseEvent) => void;
  onClick: (id: number, name: string) => void;
}

export function CategoryListView({
  categories,
  selectedIds,
  onToggle,
  onClick,
}: CategoryListViewProps) {
  return (
    <div className="space-y-2">
      {categories.map((cat: Category) => {
        const isSelected = selectedIds.includes(cat.id);
        return (
          <CategoryListItem
            key={cat.id}
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
