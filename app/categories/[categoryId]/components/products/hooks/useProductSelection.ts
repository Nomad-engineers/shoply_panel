import { useState, useMemo } from "react";
import { FlattenedProduct, SubCategoryWithFlattened } from "../types";

interface UseProductSelectionParams {
  subCategories: SubCategoryWithFlattened[];
}

interface UseProductSelectionReturn {
  selectedUniqueKeys: string[];
  isAllSelected: boolean;
  selectedProducts: FlattenedProduct[];
  toggleProduct: (key: string, e: React.MouseEvent) => void;
  toggleSubCategoryProducts: (subId: number, e: React.MouseEvent) => void;
  toggleAll: () => void;
}

export function useProductSelection({
  subCategories,
}: UseProductSelectionParams): UseProductSelectionReturn {
  const [selectedUniqueKeys, setSelectedUniqueKeys] = useState<string[]>([]);

  const allKeys = useMemo(
    () => subCategories.flatMap((s) => s.products.map((p) => p.uniqueKey)),
    [subCategories]
  );

  const isAllSelected =
    allKeys.length > 0 && selectedUniqueKeys.length === allKeys.length;

  const selectedProducts = useMemo(() => {
    return subCategories
      .flatMap((sub) => sub.products)
      .filter((p) => selectedUniqueKeys.includes(p.uniqueKey));
  }, [subCategories, selectedUniqueKeys]);

  const toggleProduct = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUniqueKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSubCategoryProducts = (subId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const sub = subCategories.find((s) => s.id === subId);
    if (!sub) return;
    const subKeys = sub.products.map((p) => p.uniqueKey);
    const allPresent = subKeys.every((k) => selectedUniqueKeys.includes(k));
    setSelectedUniqueKeys((prev) =>
      allPresent
        ? prev.filter((k) => !subKeys.includes(k))
        : Array.from(new Set([...prev, ...subKeys]))
    );
  };

  const toggleAll = () => setSelectedUniqueKeys(isAllSelected ? [] : allKeys);

  return {
    selectedUniqueKeys,
    isAllSelected,
    selectedProducts,
    toggleProduct,
    toggleSubCategoryProducts,
    toggleAll,
  };
}
