"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  ChevronLeft,
  Archive,
  Plus,
  Barcode,
  X,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiData } from "@/components/hooks/useApiData";
import {
  Category,
  ProductMeasure,
  measureLabels,
  ShopProduct,
} from "@/types/category.types";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdown";
import { CategorySubcategorySelector } from "@/components/category/categorySubcategorySelector";
import { useProductForm } from "@/components/hooks/category/useEditProduct";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useApiMutation } from "@/components/hooks/useApiMutation";
import { ROLES } from "@/middleware";

export default function EditProductPage() {
  const { shopProductId, categoryId, subCategoryId } = useParams();
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);
  const userRole = Cookies.get("user_role");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { refreshSession, fetchWithSession } = useAuthContext();
  const { mutate } = useApiMutation();

  const {
    singleItem: shopProduct,
    loading,
    refetch,
  } = useApiData<ShopProduct>(`products/shopProduct/${shopProductId}`, {
    searchParams: { search: JSON.stringify({ shop: { id: shopId } }) },
    relations: ["product.photos.file", "product.subCategory.category", "shop"],
  });

  // Определяем, находится ли товар в архиве
  const isArchived = !!shopProduct?.archivedAt;
  const userShopId = Cookies.get("current_shop_id");

  const categorySearchParams = useMemo<
    Record<string, string> | undefined
  >(() => {
    if (userRole !== ROLES.SHOP_OWNER) return undefined;

    return {
      search: JSON.stringify({ "shop.id": userShopId }),
    };
  }, [userRole]);

  const { data: categories = [] } = useApiData<Category>("category", {
    relations: ["subCategory"],
    searchParams: categorySearchParams,
  });

  const {
    formData,
    setFormData,
    photos,
    handleFinanceChange,
    isDirty,
    handleAddExtraBarcode,
    handleGenerateMainBarcode,
    handleDeletePhoto,
    handleFileChange,
    sanitize,
    handleReset,
  } = useProductForm(shopProduct, Number(subCategoryId), shopId);

  const measureOptions = useMemo(
    () =>
      Object.entries(measureLabels).map(([value, label]) => ({
        label: label,
        value: value,
      })),
    []
  );

  const handleArchiveToggle = async () => {
    const endpoint = isArchived
      ? `shop/shopProduct/${shopProductId}/unArchive`
      : `shop/shopProduct/${shopProductId}/archive`;

    try {
      await mutate(endpoint, { method: "PATCH", body: { shopId: userShopId } });
      await refetch();
      alert(isArchived ? "Товар восстановлен" : "Товар перемещен в архив");
    } catch (e: any) {
      alert("Ошибка: " + e.message);
    }
  };

  const handleSave = async () => {
    if (isArchived) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (!token) return alert("Ошибка авторизации");
      if (!formData.subCategoryId) return alert("Выберите подкатегорию");

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const barcodes = [formData.mainBarcode, ...formData.extraBarcodes].filter(
        (b) => b.trim() !== ""
      );

      const updatePayload = {
        name: formData.name,
        subCategoryId: Number(formData.subCategoryId),
        purchasePrice: Number(formData.purchasePrice) || 0,
        price: Number(formData.price) || 0,
        weight: Number(formData.weight) || 0,
        measure: formData.measure,
        inStock: formData.inStock,
        barcodes: barcodes,
      };

      const tasks: Promise<any>[] = [];

      tasks.push(
        fetchWithSession(
          `${apiBase}/shop/update/shopProduct/${shopProductId}`,
          () => token,
          refreshSession,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          }
        )
      );

      const baseProductId = shopProduct?.id;

      if (shopProduct.product?.photos) {
        const currentPhotoIds = photos.map((p) => p.id).filter(Boolean);
        const photosToDelete = shopProduct.product.photos.filter(
          (p) => !currentPhotoIds.includes(p.id)
        );

        photosToDelete.forEach((p) => {
          tasks.push(
            fetchWithSession(
              `${apiBase}/shop/product/photo/${p.id}`,
              () => token,
              refreshSession,
              {
                method: "DELETE",
              }
            )
          );
        });
      }

      const newFiles = photos.filter((p) => p.file).map((p) => p.file as File);

      if (newFiles.length > 0) {
        const realProductId = shopProduct.product?.id;

        if (realProductId) {
          const photoFormData = new FormData();
          photoFormData.append("productId", String(realProductId));

          newFiles.forEach((file) => {
            photoFormData.append("photos", file);
          });

          tasks.push(
            fetchWithSession(
              `${apiBase}/shop/product/photos`,
              () => token,
              refreshSession,
              {
                method: "POST",
                body: photoFormData,
              }
            )
          );
        }
      }
      const responses = await Promise.all(tasks);
      if (responses.every((res) => res.ok)) {
        await refetch();

        if (
          Number(categoryId) !== formData.categoryId ||
          Number(subCategoryId) !== Number(formData.subCategoryId)
        ) {
          const params = new URLSearchParams(searchParams.toString());
          const nextUrl = `/categories/${formData.categoryId}/subCategory/${formData.subCategoryId}/product/${shopProductId}${params.toString() ? `?${params.toString()}` : ""}`;

          router.replace(nextUrl);
        }

        alert("Изменения сохранены успешно");
      }
    } catch (error) {
      alert("Произошла ошибка при сохранении");
    }
  };

  const sellingPrice = useMemo(() => {
    const purchase = Number(formData.purchasePrice) || 0;
    const markup = Number(formData.markup) || 0;
    const result = purchase + (purchase * markup) / 100;
    return result > 0 ? result.toLocaleString() : "0";
  }, [formData.purchasePrice, formData.markup]);

  if (loading || !shopProduct) return null;

  const inputBase =
    "w-full h-[54px] px-4 bg-[#F1F2F6] rounded-xl border-none outline-none font-medium text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed";
  const labelBase = "text-xs font-bold text-gray-400 uppercase ml-1";

  return (
    <div className="min-h-screen rounded-4xl bg-white px-8 py-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {isArchived ? "Просмотр архивного товара" : "Редактирование товара"}
          </h1>
        </div>

        <button
          onClick={handleArchiveToggle}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 font-semibold rounded-xl transition-colors",
            isArchived
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
              : "bg-[#F1F2F6] hover:bg-gray-200"
          )}
        >
          {isArchived ? (
            <>
              <RefreshCcw size={18} /> Вернуть из архива
            </>
          ) : (
            <>
              <Archive size={18} /> Архивировать
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Фотографии */}
        <div className="flex gap-4 flex-wrap">
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative w-38 h-38 group rounded-2xl border-3"
            >
              <div
                style={{
                  backgroundImage: `url("${p.url}")`,
                  backgroundSize: "cover",
                }}
                className="absolute inset-0 rounded-xl"
              />
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(i)}
                  className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {!isArchived && (
            <>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-38 h-38 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50"
              >
                <Plus size={24} />
                <span className="font-bold text-[10px] uppercase">
                  Добавить фото
                </span>
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 items-end">
          <div className="space-y-1.5">
            <label className={labelBase}>Название*</label>
            <input
              disabled={isArchived}
              className={inputBase}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <CategorySubcategorySelector
            categories={categories}
            categoryId={formData.categoryId}
            subCategoryId={formData.subCategoryId}
            disabled={isArchived}
            onCategorySelect={(nextCategoryId) =>
              setFormData((prev) => ({
                ...prev,
                categoryId: nextCategoryId,
                subCategoryId:
                  prev.categoryId === nextCategoryId ? prev.subCategoryId : 0,
              }))
            }
            onSubCategorySelect={(nextSubCategoryId) =>
              setFormData((prev) => ({
                ...prev,
                subCategoryId: nextSubCategoryId,
              }))
            }
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className={labelBase}>Штрихкод*</label>
              {!isArchived && (
                <button
                  type="button"
                  onClick={handleGenerateMainBarcode}
                  className="text-[10px] text-blue-500 font-bold uppercase"
                >
                  Сгенерировать
                </button>
              )}
            </div>
            <div className="relative">
              <input
                disabled={isArchived}
                className={inputBase}
                value={formData.mainBarcode}
                onChange={(e) =>
                  setFormData({ ...formData, mainBarcode: e.target.value })
                }
              />
              <Barcode
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {!isArchived ? (
            <button
              type="button"
              onClick={handleAddExtraBarcode}
              className="w-full h-[54px] border-2 border-blue-200 rounded-xl text-blue-500 font-bold flex items-center justify-between px-4 hover:bg-blue-50"
            >
              <span>Доп. штрих код</span> <Plus size={20} />
            </button>
          ) : (
            <div />
          )}

          {formData.extraBarcodes.map((bc, i) => (
            <div key={i} className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Доп. штрихкод {i + 1}
              </label>
              <input
                disabled={isArchived}
                className={inputBase}
                value={bc}
                onChange={(e) => {
                  const bcs = [...formData.extraBarcodes];
                  bcs[i] = e.target.value;
                  setFormData({ ...formData, extraBarcodes: bcs });
                }}
              />
              {!isArchived && (
                <X
                  className="absolute right-4 top-11 text-gray-300 cursor-pointer hover:text-red-500"
                  size={18}
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      extraBarcodes: p.extraBarcodes.filter(
                        (_, idx) => idx !== i
                      ),
                    }))
                  }
                />
              )}
            </div>
          ))}

          <div className="space-y-1.5">
            <label className={labelBase}>Цена*</label>
            <div className="relative">
              <input
                disabled={isArchived}
                type="number"
                className={inputBase}
                value={formData.purchasePrice}
                onChange={(e) =>
                  handleFinanceChange("purchasePrice", e.target.value)
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                Руб
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelBase}>Накрутка*</label>
            <div className="relative">
              <input
                disabled={isArchived}
                type="number"
                className={inputBase}
                value={formData.markup}
                onChange={(e) => handleFinanceChange("markup", e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                %
              </span>
            </div>
          </div>

          <div className="space-y-1.5 opacity-80">
            <label className={cn(labelBase, "text-blue-600")}>
              Итоговая цена продажи (авто)
            </label>
            <div className="relative">
              <input
                readOnly
                type="text"
                className={cn(
                  inputBase,
                  "bg-blue-50/50 border border-blue-100 text-blue-700 cursor-default"
                )}
                value={sellingPrice}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-sm font-bold">
                Руб
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelBase}>Объем \ вес*</label>
            <input
              disabled={isArchived}
              type="number"
              className={inputBase}
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: sanitize(e.target.value) })
              }
            />
          </div>

          <CategoryBaseDropdown
            label="Единица измерения"
            disabled={isArchived}
            value={formData.measure}
            options={measureOptions}
            isOpen={isMeasureOpen && !isArchived}
            onToggle={() => !isArchived && setIsMeasureOpen(!isMeasureOpen)}
            onSelect={(val) => {
              setFormData({ ...formData, measure: val as ProductMeasure });
              setIsMeasureOpen(false);
            }}
          />
        </div>

        <div className="flex items-center gap-4 py-4 border-t">
          <button
            disabled={isArchived}
            type="button"
            onClick={() =>
              setFormData({ ...formData, inStock: !formData.inStock })
            }
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              formData.inStock ? "bg-[#55CB00]" : "bg-gray-300",
              isArchived && "opacity-50"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                formData.inStock ? "left-7" : "left-1"
              )}
            />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            Товар в наличии
          </span>
        </div>

        {!isArchived && (
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={cn(
                "px-12 py-4 text-white font-bold rounded-2xl shadow-lg transition-all",
                isDirty
                  ? "bg-[#55CB00] hover:brightness-95"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              Сохранить изменения
            </button>
            {isDirty && (
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200"
              >
                Отменить изменения
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
