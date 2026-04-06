import React from "react";
import { FlattenedProduct } from "./types";
import { ProductListItem } from "./ProductListItem";

interface ProductsListProps {
  products: FlattenedProduct[];
  selectedUniqueKeys: string[];
  shopId: string | undefined;
  onUpdated: (product: FlattenedProduct) => void;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => void;
  onCopyArticle: (text: string | null | undefined, e: React.MouseEvent) => void;
}

export function ProductsList({
  products,
  selectedUniqueKeys,
  shopId,
  onUpdated,
  onToggle,
  onClick,
  onCopyArticle,
}: ProductsListProps) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {products.map((product) => {
        const isSelected = selectedUniqueKeys.includes(product.uniqueKey);
        return (
          <ProductListItem
            key={product.uniqueKey}
            product={product}
            isSelected={isSelected}
            shopId={shopId}
            onUpdated={onUpdated}
            onToggle={onToggle}
            onClick={onClick}
            onCopyArticle={onCopyArticle}
          />
        );
      })}
    </div>
  );
}
