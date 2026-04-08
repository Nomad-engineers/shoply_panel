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
} from "@/types/category.types";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdown";
import { CategorySubcategorySelector } from "@/components/category/categorySubcategorySelector";
import {
  EditableProductData,
  useProductForm,
} from "@/components/hooks/category/useEditProduct";
import { useAuth } from "@/components/hooks/useLogin";
import { toast } from "sonner";

interface SearchSubCategoryResponse {
  id: number;
  name: string;
  productsCount: number;
}

interface SearchCategoryResponse {
  id: number;
  name: string;
  customOrderId?: number;
  productsCount: number;
  subCategories?: SearchSubCategoryResponse[];
}

interface V2UpdatedProductResponse {
  timestamp: string;
  data: {
    productId: number;
    createdAt: string;
    shopId: number;
    name: string;
    price: number;
    inStock: boolean;
    archivedAt?: string | null;
    article: string | null;
    weight: number;
    measure: string;
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
    categoryName: string;
    photos: string[];
    barcodes: string[];
  };
}

export default function EditProductPage() {
  const { shopProductId, categoryId, subCategoryId } = useParams();
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [seedProduct, setSeedProduct] = useState<EditableProductData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopIdFromQuery = searchParams.get("shopId");
  const { fetchWithSession, refreshSession } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawValue = window.sessionStorage.getItem(
      `shoply:edit-product:${shopProductId}`
    );

    if (!rawValue) return;

    try {
      setSeedProduct(JSON.parse(rawValue) as EditableProductData);
    } catch {
      setSeedProduct(null);
    }
  }, [shopProductId]);

  const resolvedShopProduct = seedProduct;
  const effectiveShopId =
    shopIdFromQuery ?? (resolvedShopProduct ? String(resolvedShopProduct.shopId) : null);

  // Определяем, находится ли товар в архиве
  const isArchived = !!resolvedShopProduct?.archivedAt;
  const { data: categoriesData = [] } = useApiData<SearchCategoryResponse>(
    effectiveShopId ? `v2/shop/${effectiveShopId}/search/categories` : null,
    {
      searchParams: { withSubCategories: "true" },
    }
  );
  const categories: Category[] = useMemo(
    () =>
      categoriesData.map((category) => ({
        id: category.id,
        name: category.name,
        customOrderId: category.customOrderId ?? 0,
        subCategory:
          category.subCategories?.map((subCategory) => ({
            id: subCategory.id,
            name: subCategory.name,
            customOrderId: 0,
            category: {
              id: category.id,
              name: category.name,
              customOrderId: category.customOrderId ?? 0,
            },
          })) ?? [],
      })),
    [categoriesData]
  );

  const {
    formData,
    setFormData,
    photos,
    setPhotos,
    handleFinanceChange,
    isDirty,
    handleAddExtraBarcode,
    generateEAN13,
    handleGenerateMainBarcode,
    handleDeletePhoto,
    handleFileChange,
    sanitize,
    handleReset,
  } = useProductForm(
    resolvedShopProduct ?? undefined,
    Number(subCategoryId),
    effectiveShopId
  );

  const measureOptions = useMemo(
    () =>
      Object.entries(measureLabels).map(([value, label]) => ({
        label: label,
        value: value,
      })),
    []
  );

  const handleArchiveToggle = async () => {
    toast.message("Архивация пока отключена", {
      description: "Новые запросы добавим по шагам.",
    });
  };

  const handleSave = async () => {
    if (!resolvedShopProduct || !effectiveShopId) {
      return;
    }

    setIsSaving(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (!token) {
        toast.error("Ошибка авторизации");
        return;
      }

      const backendPurchasePrice =
        Number(formData.markup) > 0 ? Number(formData.purchasePrice) || 0 : 0;
      const backendPrice =
        Number(formData.markup) > 0
          ? Math.ceil(
              backendPurchasePrice +
                (backendPurchasePrice * Number(formData.markup || 0)) / 100
            )
          : Number(formData.purchasePrice) || 0;

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("subCategoryId", String(Number(formData.subCategoryId)));
      payload.append("purchasePrice", String(backendPurchasePrice));
      payload.append("price", String(backendPrice));
      payload.append("weight", String(Number(formData.weight) || 0));
      payload.append("measure", String(formData.measure));
      payload.append("inStock", String(formData.inStock));

      [formData.mainBarcode, ...formData.extraBarcodes]
        .filter((value) => value.trim() !== "")
        .forEach((barcode) => {
          payload.append("barcodes", barcode.trim());
        });

      const uploadFiles = await Promise.all(
        photos.map((photo) => buildUploadFileFromPhoto(photo))
      );

      uploadFiles.forEach((file) => {
        payload.append("photos", file);
      });

      const response = await fetchWithSession(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/shop/${effectiveShopId}/product/${shopProductId}`,
        () => token,
        refreshSession,
        {
          method: "PATCH",
          body: payload,
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось сохранить товар");
      }

      const result = (await response.json()) as V2UpdatedProductResponse;
      const product = result.data;

      const nextSeed: EditableProductData = {
        productId: product.productId,
        createdAt: product.createdAt,
        shopId: product.shopId,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        subCategoryName: product.subCategoryName,
        name: product.name,
        purchasePrice: backendPurchasePrice,
        price: product.price,
        inStock: product.inStock,
        archivedAt: product.archivedAt || null,
        weight: product.weight,
        measure: product.measure as typeof formData.measure,
        article: product.article || "",
        barcodes: product.barcodes || [],
        photos:
          product.photos?.map((photoId, index) => ({
            id:
              resolvedShopProduct.photos?.find((photo) => photo.url?.includes(photoId))
                ?.id ?? index,
            fileId: photoId,
            url: `${process.env.NEXT_PUBLIC_API_URL}/files/${photoId}`,
          })) ?? [],
      };

      window.sessionStorage.setItem(
        `shoply:edit-product:${shopProductId}`,
        JSON.stringify(nextSeed)
      );
      setSeedProduct(nextSeed);
      toast.success("Изменения сохранены");
    } catch (error: any) {
      toast.error(error.message ?? "Не удалось сохранить товар");
    } finally {
      setIsSaving(false);
    }
  };

  const sellingPrice = useMemo(() => {
    const purchase = Number(formData.purchasePrice) || 0;
    const markup = Number(formData.markup) || 0;
    const result = purchase + (purchase * markup) / 100;
    return result > 0 ? Math.ceil(result).toLocaleString() : "0";
  }, [formData.purchasePrice, formData.markup]);

  const createdAtLabel = resolvedShopProduct?.createdAt
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(resolvedShopProduct.createdAt))
    : "—";

  if (!resolvedShopProduct) return null;

  const inputBase =
    "w-full h-[54px] px-4 bg-[#F1F2F6] rounded-xl border-none outline-none font-medium text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed";
  const labelBase = "text-xs font-bold text-gray-400 uppercase ml-1";
  const renderBarcodeField = ({
    label,
    value,
    onChange,
    onGenerate,
    onRemove,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onGenerate?: () => void;
    onRemove?: () => void;
  }) => (
    <div className="space-y-1.5 relative">
      <div className="flex justify-between items-center pr-1">
        <label className={labelBase}>{label}</label>
        {!isArchived && onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {!isArchived && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-300 transition-colors hover:text-red-500"
              aria-label="Удалить штрихкод"
            >
              <X size={18} />
            </button>
          )}
          <Barcode className="text-gray-400" size={20} />
        </div>
      </div>
    </div>
  );

  const handlePhotoDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsPhotoDragOver(false);

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      return;
    }

    const newFiles = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setPhotos((prev) => [...prev, ...newFiles]);
  };

  const buildUploadFileFromPhoto = async (photo: {
    url: string;
    file?: File;
  }) => {
    if (photo.file) {
      return photo.file;
    }

    const response = await fetch(photo.url);
    if (!response.ok) {
      throw new Error("Не удалось подготовить фото к сохранению");
    }

    const blob = await response.blob();
    const extension = blob.type.split("/")[1] || "jpg";

    return new File([blob], `photo-${crypto.randomUUID()}.${extension}`, {
      type: blob.type || "image/jpeg",
    });
  };

  return (
    <div className="min-h-screen rounded-4xl bg-white">
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
          <div className="flex items-center gap-10 pl-4 text-[14px] text-[#8f93a3]">
            <span>Создан: {createdAtLabel}</span>
            <span>Product ID: {resolvedShopProduct.productId}</span>
          </div>
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
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsPhotoDragOver(true);
                }}
                onDragLeave={() => setIsPhotoDragOver(false)}
                onDrop={handlePhotoDrop}
                className={cn(
                  "w-38 h-38 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors",
                  isPhotoDragOver && "bg-blue-50 border-blue-400"
                )}
              >
                <Plus size={24} />
                <span className="font-bold text-[10px] uppercase">
                  Добавить фото
                </span>
                <span className="mt-2 text-[10px] text-blue-400">
                  или перетащите сюда
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

          {renderBarcodeField({
            label: "Штрихкод",
            value: formData.mainBarcode,
            onChange: (value) =>
              setFormData({ ...formData, mainBarcode: value }),
            onGenerate: handleGenerateMainBarcode,
          })}

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
            <React.Fragment key={i}>
              {renderBarcodeField({
                label: `Доп. штрихкод ${i + 1}`,
                value: bc,
                onChange: (value) => {
                  const bcs = [...formData.extraBarcodes];
                  bcs[i] = value;
                  setFormData({ ...formData, extraBarcodes: bcs });
                },
                onGenerate: () => {
                  const bcs = [...formData.extraBarcodes];
                  bcs[i] = generateEAN13();
                  setFormData({ ...formData, extraBarcodes: bcs });
                },
                onRemove: () =>
                  setFormData((p) => ({
                    ...p,
                    extraBarcodes: p.extraBarcodes.filter(
                      (_, idx) => idx !== i
                    ),
                  })),
              })}
            </React.Fragment>
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

          <div className="col-span-2 flex items-center justify-end gap-3 pt-1">
            <span className="text-[14px] font-medium text-gray-500">
              Итоговая цена для клиента
            </span>
            <span className="text-[16px] font-semibold text-[#1f2333]">
              {sellingPrice} ₽
            </span>
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
              disabled={!isDirty || isSaving}
              className={cn(
                "px-12 py-4 text-white font-bold rounded-2xl shadow-lg transition-all",
                isDirty && !isSaving
                  ? "bg-[#55CB00] hover:brightness-95"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              {isSaving ? "Сохраняем..." : "Сохранить изменения"}
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
