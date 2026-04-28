import React from "react";
import { ProductGridCard } from "./ProductGridCard";
import { FlattenedProduct } from "./types";

interface ProductsGridProps {
  products: FlattenedProduct[];
  selectedUniqueKeys: string[];
  shopId: string | undefined;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => void;
}

export function ProductsGrid({
  products,
  shopId,
  selectedUniqueKeys,
  onToggle,
  onClick,
}: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {products.map((product) => {
        const isSelected = selectedUniqueKeys.includes(product.uniqueKey);
        return (
          <ProductGridCard
            key={product.uniqueKey}
            product={product}
            isSelected={isSelected}
            onToggle={onToggle}
            onClick={onClick}
            shopId={shopId}
          />
        );
      })}
    </div>
  );
}
