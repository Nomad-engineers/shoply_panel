import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/theme";
import { FlattenedProduct } from "./types";

interface ProductGridCardProps {
  product: FlattenedProduct;
  isSelected: boolean;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (shopId: number, shopProductId: number) => void;
}

export function ProductGridCard({
  product,
  isSelected,
  onToggle,
  onClick,
}: ProductGridCardProps) {
  const sp = product.activeShopProduct;

  return (
    <div
      onClick={() => onClick(sp.shop.id, sp.id)}
      className="relative cursor-pointer"
    >
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => onToggle(product.uniqueKey, e)}
      >
        <CheckCircle2
          className={cn(
            "w-6 h-6 rounded-full bg-white shadow-md",
            isSelected ? "text-[#55CB00]" : "text-gray-300"
          )}
        />
      </div>
      <div className="aspect-square bg-gray-100 rounded-[24px] mb-3 relative overflow-hidden">
        {product.photos?.[0]?.file?.url && (
          <Image src={product.photos[0].file.url} alt="" fill className="object-cover" />
        )}
      </div>
      <h4 className="text-md font-semibold leading-tight mb-1">
        {product.name}
      </h4>
      <p className="text-[10px] text-blue-600 font-bold uppercase">
        {sp.shop?.name}
      </p>
      <p className="text-sm font-bold">{sp.price} ₽</p>
    </div>
  );
}
