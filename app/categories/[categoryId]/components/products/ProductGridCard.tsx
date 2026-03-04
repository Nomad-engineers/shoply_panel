import React from "react";
import Image from "next/image";
import { CheckCircle2, Divide } from "lucide-react";
import { cn } from "@/lib/theme";
import { FlattenedProduct } from "./types";

interface ProductGridCardProps {
  product: FlattenedProduct;
  isSelected: boolean;
  shopId: string | undefined;
  onToggle: (key: string, e: React.MouseEvent) => void;
  onClick: (
    subId: number,
    shopId: string | undefined,
    shopProductId: number
  ) => void;
}

export function ProductGridCard({
  product,
  shopId,
  isSelected,
  onToggle,
  onClick,
}: ProductGridCardProps) {
  const sp = product.activeShopProduct;

  return (
    <div
      onClick={() => onClick(product.subCategoryId, shopId, sp.id)}
      className="relative cursor-pointer group"
    >
      {/* Чекбокс выбора */}
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => onToggle(product.uniqueKey, e)}
      >
        <CheckCircle2
          className={cn(
            "w-6 h-6 rounded-full bg-white shadow-md transition-colors",
            isSelected ? "text-[#55CB00]" : "text-gray-300"
          )}
        />
      </div>

      {/* Контейнер изображения - Квадратный с закруглением 24px */}
      <div className="aspect-square bg-gray-100 rounded-[24px] mb-3 relative overflow-hidden">
        {product.photos?.[0]?.file?.url ? (
          <div
            style={{
              backgroundImage: `url("${product.photos[0].file.url}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "absolute",
              inset: 0,
            }}
            className="transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-[10px] font-bold uppercase">Нет фото</span>
          </div>
        )}
      </div>

      {/* Инфо-блок (теперь он корректно отображается под фото) */}
      <div className="px-1">
        <h4 className="text-md font-semibold leading-tight mb-1 text-gray-900 line-clamp-2">
          {product.name}
        </h4>
        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
          {sp.shop?.name}
        </p>
        <p className="text-sm font-bold text-gray-800">{sp.price} ₽</p>
      </div>
    </div>
  );
}