import { useState, useMemo } from "react";
import { Category } from "@/types/category.types";

interface UseCategorySelectionParams {
  categories: Category[];
}

interface UseCategorySelectionReturn {
  selectedIds: number[];
  isAllSelected: boolean;
  toggleCategory: (id: number, e: React.MouseEvent) => void;
  toggleAll: () => void;
}

export function useCategorySelection({
  categories,
}: UseCategorySelectionParams): UseCategorySelectionReturn {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const isAllSelected =
    categories.length > 0 && selectedIds.length === categories.length;

  const toggleCategory = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((cat: Category) => cat.id));
    }
  };

  return {
    selectedIds,
    isAllSelected,
    toggleCategory,
    toggleAll,
  };
}
