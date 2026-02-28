import React from "react";
import { cn } from "@/lib/theme";
import { SubCategoryHeader } from "./SubCategoryHeader";
import { ProductsList } from "./ProductsList";
import { ProductsGrid } from "./ProductsGrid";
import { FlattenedProduct, SubCategoryWithFlattened } from "./types";

interface SubCategorySectionProps {
  sub: SubCategoryWithFlattened;
  isOpen: boolean;
  selectedUniqueKeys: string[];
  shopId: string | undefined;
  viewMode: "list" | "grid";
  isPartiallySelected: boolean;
  isFullySelected: boolean;
  onToggleProducts: (subId: number, e: React.MouseEvent) => void;
  onToggleOpen: () => void;
  onProductToggle: (key: string, e: React.MouseEvent) => void;
  onProductClick: (shopId: number, shopProductId: number) => void;
  onCopyArticle: (text: string | null | undefined, e: React.MouseEvent) => void;
}

export function SubCategorySection({
  sub,
  isOpen,
  selectedUniqueKeys,
  shopId,
  viewMode,
  isPartiallySelected,
  isFullySelected,
  onToggleProducts,
  onToggleOpen,
  onProductToggle,
  onProductClick,
  onCopyArticle,
}: SubCategorySectionProps) {
  return (
    <div className="mb-6 border-b border-gray-50 pb-4 last:border-0">
      <SubCategoryHeader
        name={sub.name}
        displayCount={sub.displayCount}
        isOpen={isOpen}
        isFullySelected={isFullySelected}
        isPartiallySelected={isPartiallySelected}
        onToggleProducts={onToggleProducts}
        onToggleOpen={onToggleOpen}
        subCategoryId={sub.id}
      />

      {isOpen && (
        <div className="mt-6">
          {viewMode === "list" ? (
            <ProductsList
              products={sub.products}
              selectedUniqueKeys={selectedUniqueKeys}
              shopId={shopId}
              onToggle={onProductToggle}
              onClick={onProductClick}
              onCopyArticle={onCopyArticle}
            />
          ) : (
            <ProductsGrid
              products={sub.products}
              selectedUniqueKeys={selectedUniqueKeys}
              onToggle={onProductToggle}
              onClick={onProductClick}
            />
          )}
        </div>
      )}
    </div>
  );
}
