import React from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/theme";
import { measureLabels } from "@/types/category.types";
import { FlattenedProduct } from "./types";
import { Button, Input } from "@/components/ui";
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { toast } from "sonner";

interface ProductListItemProps {
  product: FlattenedProduct;
  isSelected: boolean;
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

export function ProductListItem({
  product,
  isSelected,
  shopId,
  onUpdated,
  onToggle,
  onClick,
  onCopyArticle,
}: ProductListItemProps) {
  const { mutate, isLoading } = useApiMutation();
  const sp = product.activeShopProduct;
  const measureText =
    product.measure && measureLabels[product.measure]
      ? measureLabels[product.measure]
      : "шт";
  const editorFieldClassName =
    "h-auto rounded-none border-0 border-b border-[#d9ddea] bg-transparent px-0 py-0 text-[14px] text-[#1f2333] shadow-none focus-visible:border-[#b8bdcc] focus-visible:ring-0 focus-visible:ring-offset-0";
  const [isEditing, setIsEditing] = React.useState(false);
  const buildDraft = React.useCallback(
    () => ({
      name: product.name,
      barcode: product.barcodes[0] || "",
      weight: String(product.weight),
      measure: product.measure || "pc",
      price: String(sp.price),
      inStock: sp.inStock,
    }),
    [product.barcodes, product.measure, product.name, product.weight, sp.inStock, sp.price],
  );
  const [draft, setDraft] = React.useState({
    name: product.name,
    barcode: product.barcodes[0] || "",
    weight: String(product.weight),
    measure: product.measure || "pc",
    price: String(sp.price),
    inStock: sp.inStock,
  });
  const [showUnsavedWarning, setShowUnsavedWarning] = React.useState(false);
  const isDirty =
    draft.name !== product.name ||
    draft.barcode !== (product.barcodes[0] || "") ||
    draft.weight !== String(product.weight) ||
    draft.measure !== (product.measure || "pc") ||
    draft.price !== String(sp.price) ||
    draft.inStock !== sp.inStock;

  React.useEffect(() => {
    setDraft(buildDraft());
  }, [buildDraft, product.uniqueKey]);

  const handleSave = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!shopId) {
      return;
    }

    try {
      await mutate(`v2/shop/${shopId}/product/${sp.id}`, {
        method: "PATCH",
        body: {
          name: draft.name.trim(),
          barcodes: draft.barcode.trim() ? [draft.barcode.trim()] : [],
          weight: Number(draft.weight) || 0,
          measure: draft.measure,
          price: Number(draft.price) || 0,
          inStock: draft.inStock,
        },
      });
      toast.success("Товар обновлен");
      onUpdated({
        ...product,
        name: draft.name.trim(),
        barcodes: draft.barcode.trim() ? [draft.barcode.trim()] : [],
        weight: Number(draft.weight) || 0,
        measure: draft.measure as typeof product.measure,
        activeShopProduct: {
          ...product.activeShopProduct,
          price: Number(draft.price) || 0,
          inStock: draft.inStock,
        },
      });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message ?? "Не удалось обновить товар");
    }
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDraft(buildDraft());
    setIsEditing(false);
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setDraft(buildDraft());
      setIsEditing(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      await handleSave(event as unknown as React.MouseEvent);
    }
  };

  const handleToggleEditMode = () => {
    if (isEditing) {
      if (isDirty) {
        setShowUnsavedWarning(true);
        window.setTimeout(() => {
          setShowUnsavedWarning(false);
        }, 1000);
        return;
      }

      setDraft(buildDraft());
      setIsEditing(false);
      return;
    }

    setIsEditing(true);
  };

  return (
    <div
      onClick={() => {
        if (!isEditing) {
          onClick(product.subCategoryId, shopId, sp.id);
        }
      }}
      onDoubleClick={handleToggleEditMode}
      className="grid cursor-pointer grid-cols-[22px_2.3fr_170px_100px_80px_110px_44px] items-center gap-4 py-2.5 hover:bg-gray-50/40"
    >
      <div onClick={(e) => onToggle(product.uniqueKey, e)}>
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
            isSelected
              ? "border-[#55CB00] bg-[#55CB00]/10"
              : "border-[#b8bdcc] bg-white"
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              isSelected ? "bg-[#55CB00]" : "bg-transparent"
            )}
          />
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0 overflow-hidden rounded-[12px] bg-[#F5F7F9]">
          {product.photos?.[0]?.file?.url ? (
            <img
              src={product.photos[0].file.url}
              alt={product.name}
              className="block h-[48px] w-[48px] object-cover"
            />
          ) : (
            <div className="flex h-[48px] w-[48px] items-center justify-center text-gray-400">
              <span className="text-[9px]">Нет фото</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              className={cn(
                editorFieldClassName,
                "w-full text-[16px] leading-[1.2] font-normal"
              )}
            />
          ) : (
            <h4 className="truncate text-[16px] font-normal leading-[1.2] text-[#1f2333]">
              {product.name}
            </h4>
          )}
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[#a3a7b7]">
            <span>12.02.2025</span>
            <span>ID: {sp.id}</span>
          </div>
        </div>
      </div>

      {isEditing ? (
        <>
          <Input
            value={draft.barcode}
            onChange={(event) =>
              setDraft((current) => ({ ...current, barcode: event.target.value }))
            }
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={handleKeyDown}
            className={editorFieldClassName}
            placeholder="Штрихкод"
          />

          <div
            className="flex items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Input
              value={draft.weight}
              onChange={(event) =>
                setDraft((current) => ({ ...current, weight: event.target.value }))
              }
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              className={cn(editorFieldClassName, "w-[52px] text-right")}
            />
            <select
              value={draft.measure}
              onChange={(event) =>
                setDraft((current) => ({ ...current, measure: event.target.value }))
              }
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              className="h-auto appearance-none rounded-none border-0 border-b border-[#d9ddea] bg-transparent px-0 py-0 text-[14px] text-[#2a2f41] outline-none"
            >
              {Object.entries(measureLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Input
            value={draft.price}
            onChange={(event) =>
              setDraft((current) => ({ ...current, price: event.target.value }))
            }
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={handleKeyDown}
            className={cn(editorFieldClassName, "font-medium")}
          />

          <div
            className="flex items-center justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#2a2f41]">
              <input
                type="checkbox"
                checked={draft.inStock}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    inStock: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#55CB00]"
              />
              В наличии
            </label>
          </div>
          <div
            className="flex items-center justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              size="xs"
              variant="success"
              onClick={handleSave}
              disabled={isLoading}
              className={cn(
                "h-8 rounded-[10px] px-3 transition-all",
                showUnsavedWarning &&
                  "animate-[shake_0.2s_ease-in-out_3] bg-[#dc2626] text-white hover:bg-[#b91c1c]"
              )}
              aria-label="Сохранить изменения"
            >
              {isLoading ? "..." : <Check className="h-4 w-4" />}
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="flex items-center gap-2 text-[14px] text-[#2a2f41]">
            <button
              type="button"
              onClick={(e) => onCopyArticle(product.barcodes[0], e)}
              onDoubleClick={(e) => e.stopPropagation()}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-[#5f8cff] transition-colors hover:bg-[#eef4ff] hover:text-[#3f7cff]"
              aria-label="Скопировать штрихкод"
            >
              <Copy size={14} className="shrink-0" />
            </button>
            <span className="truncate">{product.barcodes[0] || "---"}</span>
          </span>

          <span className="text-[14px] text-[#2a2f41]">
            {product.weight} {measureText}
          </span>

          <span className="text-[14px] font-medium text-[#2a2f41]">
            {sp.price} ₽
          </span>

          <span
            className={cn(
              "text-[14px] font-medium",
              sp.inStock ? "text-[#71B84D]" : "text-[#E26D5C]"
            )}
          >
            {sp.inStock ? "В наличии" : "Нет в наличии"}
          </span>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleEditMode();
              }}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-[#f3f5fb] hover:text-text-primary",
                "text-[#b9bbc6]"
              )}
              aria-label="Редактировать строку"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
