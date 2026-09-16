import { useState, useEffect } from "react";
import { SubCategoryWithFlattened } from "../types";

interface UseSubCategoryExpansionParams {
  subCategories: SubCategoryWithFlattened[];
  searchQuery: string;
}

interface UseSubCategoryExpansionReturn {
  openSubCategoryIds: number[];
  toggleSubCategory: (id: number) => void;
}

export function useSubCategoryExpansion({
  subCategories,
  searchQuery,
}: UseSubCategoryExpansionParams): UseSubCategoryExpansionReturn {
  const [openSubCategoryIds, setOpenSubCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const ids = subCategories
        .filter((sub) => sub.products.length > 0)
        .map((sub) => sub.id);
      setOpenSubCategoryIds(ids);
      return;
    }

    if (subCategories.length > 0 && openSubCategoryIds.length === 0) {
      setOpenSubCategoryIds([subCategories[0].id]);
    }
  }, [searchQuery, subCategories, openSubCategoryIds.length]);

  const toggleSubCategory = (id: number) => {
    setOpenSubCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return {
    openSubCategoryIds,
    toggleSubCategory,
  };
}
