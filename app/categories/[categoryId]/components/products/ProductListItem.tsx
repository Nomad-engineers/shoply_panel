import React from "react";
import Image from "next/image";
import { CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/theme";
import { measureLabels } from "@/types/category.types";
import { FlattenedProduct } from "./types";

interface ProductListItemProps {
  product: FlattenedProduct;
  isSelected: boolean;
  shopId: string | undefined;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (shopId: number, shopProductId: number) => void;
  onCopyArticle: (text: string | null | undefined, e: React.MouseEvent) => void;
}

export function ProductListItem({
  product,
  isSelected,
  shopId,
  onToggle,
  onClick,
  onCopyArticle,
}: ProductListItemProps) {
  const sp = product.activeShopProduct;
  const measureText =
    product.measure && measureLabels[product.measure]
      ? measureLabels[product.measure]
      : "шт";

  return (
    <div
      onClick={() => onClick(sp.shop.id, sp.id)}
      className="flex items-center justify-between py-2 hover:bg-gray-50/50 rounded-lg cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1">
        <div onClick={(e) => onToggle(product.uniqueKey, e)}>
          <CheckCircle2
            className={cn(
              "w-5 h-5",
              isSelected ? "text-[#55CB00]" : "text-gray-200"
            )}
          />
        </div>
        <div className="w-12 h-12 bg-[#F5F7F9] rounded-xl relative overflow-hidden">
          {product.photos?.[0]?.file?.url && (
            <div
              style={{
                backgroundImage: `url("${product.photos[0].file.url}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "absolute",
                width: "120px",
                height: "70px",
              }}
              className="transition-all"
              aria-hidden="true"
            />
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium">{product.name}</h4>
          {shopId ? (
            ""
          ) : (
            <p className="text-[10px] text-blue-600 font-bold uppercase">
              {sp.shop?.name}
            </p>
          )}
          <p className="text-[10px] text-gray-400">ID: {sp.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-12 text-sm">
        <span className="text-blue-500 text-xs flex items-center gap-1">
          <Package
            size={14}
            onClick={(e) => onCopyArticle(product.article, e)}
          />
          {product.article || "---"}
        </span>
        <span className="w-20">
          {product.weight} {measureText}
        </span>
        <span className="w-16 font-semibold">{sp.price} ₽</span>
        <span
          className={cn(
            "text-xs w-24",
            sp.inStock ? "text-[#55CB00]" : "text-red-500"
          )}
        >
          {sp.inStock ? "В наличии" : "Нет в наличии"}
        </span>
      </div>
    </div>
  );
}
