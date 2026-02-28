import React from "react";
import { ProductGridCard } from "./ProductGridCard";
import { FlattenedProduct } from "./types";

interface ProductsGridProps {
  products: FlattenedProduct[];
  selectedUniqueKeys: string[];
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (shopId: number, shopProductId: number) => void;
}

export function ProductsGrid({
  products,
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
          />
        );
      })}
    </div>
  );
}
