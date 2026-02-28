import { useState } from "react";
import { Product } from "@/types/category.types";
import { calculatePrice } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/AuthProvider";

interface UseBulkUpdateProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBulkProductUpdate = ({ onSuccess, onError }: UseBulkUpdateProps = {}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { fetchWithSession, refreshSession } = useAuthContext();

  const saveProducts = async (
    selectedProducts: any[],
    changes: any,
    individualOverrides: Record<string, any>,
    isFieldUnique: (id: string | number, field: string) => boolean
  ) => {
    setIsUpdating(true);
    try {
      // Используем map, так как activeShopProduct — это объект, а не массив
      const updatePromises = selectedProducts.map((product) => {
        const sp = product.activeShopProduct;
        const uKey = product.uniqueKey; // Ключ для уникальных полей магазина
        const pId = product.id;         // Ключ для глобальных полей продукта (объем/ед.изм)

        if (!sp) return null;

        let finalPrice: number;
        const shopProductPrice = Number(sp.price || 0);
        const purchasePrice = Number(sp.purchasePrice || 0);

        // Расчет цены
        if (isFieldUnique(uKey, "price")) {
          finalPrice = Number(individualOverrides[uKey]?.price ?? shopProductPrice);
        } else {
          if (changes.markup !== 0) {
            const baseForCalculation = purchasePrice || shopProductPrice || 0;
            const basePrice = calculatePrice(baseForCalculation, changes.markup);
            finalPrice = basePrice + Number(changes.priceOffset || 0);
          } else {
            finalPrice = shopProductPrice + Number(changes.priceOffset || 0);
          }
        }

        // Формирование Payload
        const payload = {
          price: Math.max(0, finalPrice),
          weight: isFieldUnique(pId, "volume")
            ? Number(individualOverrides[uKey]?.volume ?? product.weight)
            : (changes.volume !== "" ? Number(changes.volume) : product.weight),
          measure: isFieldUnique(pId, "measure")
            ? (individualOverrides[uKey]?.measure ?? product.measure)
            : (changes.measure || product.measure),
          inStock: isFieldUnique(uKey, "stock")
            ? (individualOverrides[uKey]?.inStock ?? sp.inStock)
            : (changes.inStock !== null ? changes.inStock : sp.inStock)
        };

        return fetchWithSession(
          `${process.env.NEXT_PUBLIC_API_URL}/shop/update/shopProduct/${sp.id}`,
          () => localStorage.getItem('access_token'),
          refreshSession,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }).filter(Boolean); // Убираем пустые промисы

      const responses = await Promise.all(updatePromises);
      const allOk = responses.every((res: any) => res && res.ok);

      if (allOk) {
        onSuccess?.();
      } else {
        throw new Error("Bulk update failed");
      }
    } catch (err) {
      console.error(err);
      onError?.(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return { saveProducts, isUpdating };
};