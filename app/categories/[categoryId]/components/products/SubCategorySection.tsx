import React, { useMemo } from "react";
import { cn } from "@/lib/theme";
import { SubCategoryHeader } from "./SubCategoryHeader";
import { ProductsList } from "./ProductsList";
import { ProductsGrid } from "./ProductsGrid";
import { FlattenedProduct, SubCategoryWithFlattened } from "./types";
import { useSearchParams } from "next/navigation";

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
  onProductClick: (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => void;
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
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "active";

  const displayedProducts = useMemo(() => {
    if (!sub.products) return [];
    return sub.products.filter((p) => {
      const isArchived = !!p.activeShopProduct.archivedAt;
      return activeTab === "archived" ? isArchived : !isArchived;
    });
  }, [sub.products, activeTab]);

  return (
    <div className="mb-6 border-b border-gray-50 pb-4 last:border-0">
      <SubCategoryHeader
        name={sub.name}
        displayCount={displayedProducts.length}
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
              products={displayedProducts}
              selectedUniqueKeys={selectedUniqueKeys}
              shopId={shopId}
              onToggle={onProductToggle}
              onClick={onProductClick}
              onCopyArticle={onCopyArticle}
            />
          ) : (
            <ProductsGrid
              products={displayedProducts}
              selectedUniqueKeys={selectedUniqueKeys}
              onToggle={onProductToggle}
              onClick={onProductClick}
              shopId={shopId}
            />
          )}
        </div>
      )}
    </div>
  );
}
