import React from "react";
import { ProductListItem } from "./ProductListItem";
import { FlattenedProduct } from "./types";

interface ProductsListProps {
  products: FlattenedProduct[];
  selectedUniqueKeys: string[];
  shopId: string | undefined;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (shopId: number, shopProductId: number) => void;
  onCopyArticle: (text: string | null | undefined, e: React.MouseEvent) => void;
}

export function ProductsList({
  products,
  selectedUniqueKeys,
  shopId,
  onToggle,
  onClick,
  onCopyArticle,
}: ProductsListProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => {
        const isSelected = selectedUniqueKeys.includes(product.uniqueKey);
        return (
          <ProductListItem
            key={product.uniqueKey}
            product={product}
            isSelected={isSelected}
            shopId={shopId}
            onToggle={onToggle}
            onClick={onClick}
            onCopyArticle={onCopyArticle}
          />
        );
      })}
    </div>
  );
}
