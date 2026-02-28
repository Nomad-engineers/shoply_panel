"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Cookies from "js-cookie";

import { useApiData } from "@/components/hooks/useApiData";
import { useProductForm } from "@/components/hooks/category/useEditProduct";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { SearchableDropdown } from "@/components/category/searchableDropdown";
import { ProductPhotoUpload } from "./components/ProductPhotoUpload";
import { ProductBasicInfo } from "./components/ProductBasicInfo";
import { ProductBarcodeSection } from "./components/ProductBarcodeSection";
import { ProductFinanceInfo } from "./components/ProductFinanceInfo";
import { ProductAttributes } from "./components/ProductAttributes";
import { StockToggle } from "./components/StockToggle";

import {
  SubCategory,
  measureLabels,
} from "@/types/category.types";
import { Shop } from "@/types/shop";

export default function AddProductPage() {
  const router = useRouter();
  const { refreshSession, fetchWithSession } = useAuthContext();

  const [isMounted, setIsMounted] = useState(false);
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [articleError, setArticleError] = useState("");

  const { data: shops = [] } = useApiData<Shop>("shops");
  const { data: subcategories = [] } = useApiData<SubCategory>(`subcategory`);

  useEffect(() => {
    const shopIdFromCookie = Cookies.get("user_shop_id");
    if (shopIdFromCookie) setSelectedShopId(shopIdFromCookie);
    setIsMounted(true);
  }, []);

  const {
    formData,
    setFormData,
    photos,
    handleFinanceChange,
    handleAddExtraBarcode,
    handleGenerateMainBarcode,
    handleDeletePhoto,
    handleFileChange,
    sanitize,
    handleGenerateArticle
  } = useProductForm(undefined, 0, selectedShopId);

  // Лог для проверки: теперь ты увидишь, как объект наполняется
  useEffect(() => {
    console.log("Текущий formData:", formData);
  }, [formData]);

  const measureOptions = useMemo(
    () =>
      Object.entries(measureLabels).map(([value, label]) => ({
        label: label,
        value: value,
      })),
    []
  );

  const subCategoryOptions = useMemo(
    () =>
      subcategories.map((sub) => ({
        label: sub.name,
        value: sub.id,
        subLabel: sub.category?.name,
      })),
    [subcategories]
  );

  const shopOptions = useMemo(
    () =>
      shops.map((s: any) => ({
        label: s.name,
        value: String(s.id),
      })),
    [shops]
  );

  const handleSave = async () => {
    try {
      setArticleError("");
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) return alert("Ошибка авторизации");
      if (!selectedShopId) return alert("Выберите магазин");
      if (!formData.name) return alert("Введите название товара"); // Важная проверка
      if (!formData.subCategoryId) return alert("Выберите подкатегорию");

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const barcodes = [formData.mainBarcode, ...formData.extraBarcodes].filter(b => String(b).trim() !== "");

      const createPayload = {
        name: formData.name,
        article: formData.article,
        subCategoryId: Number(formData.subCategoryId),
        purchasePrice: Number(formData.purchasePrice) || 0,
        price: Number(formData.price) || 0,
        weight: Number(formData.weight) || 0,
        measure: formData.measure,
        inStock: formData.inStock,
        barcodes: barcodes,
        shopId: Number(selectedShopId),
      };
      console.log(createPayload)
      const res = await fetchWithSession(`${apiBase}/shop/shopProduct`, () => token, refreshSession, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create product" }));
        if (errorData.message && errorData.message.includes("Артикул уже используется")) {
          setArticleError(errorData.message);
          return;
        }
        throw new Error(errorData.message || "Failed to create product");
      }

      const responseData = await res.json();
      const baseProductId = responseData.product?.id || responseData.productId;

      const newFiles = photos.filter((p) => p.file).map((p) => p.file as File);

      if (newFiles.length > 0 && baseProductId) {
        const photoFormData = new FormData();
        photoFormData.append("productId", String(baseProductId));
        newFiles.forEach((file) => photoFormData.append("photos", file));

        await fetchWithSession(`${apiBase}/shop/product/photos`, () => token, refreshSession, {
          method: "POST",
          body: photoFormData,
        });
      }

      alert("Товар успешно создан");
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      alert("Ошибка при создании товара");
    }
  };

  if (!isMounted) return null;

  const inputClasses = "w-full h-[54px] px-4 bg-[#F1F2F6] rounded-xl border-none outline-none font-medium text-gray-800";
  const labelClasses = "text-xs font-bold text-gray-400 uppercase ml-1";

  return (
    <div className="min-h-screen rounded-4xl bg-white px-8 py-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Добавление товара</h1>
      </div>

      <div className="max-w-4xl space-y-8">
        <ProductPhotoUpload
          photos={photos}
          onFileChange={handleFileChange}
          onDeletePhoto={handleDeletePhoto}
        />

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 items-end">
          {!Cookies.get("user_shop_id") && (
            <div className="col-span-2">
              <SearchableDropdown
                label="Магазин"
                value={selectedShopId}
                options={shopOptions}
                onSelect={setSelectedShopId}
                placeholder="Поиск магазина..."
              />
            </div>
          )}

          <ProductBasicInfo
            formData={formData}
            setFormData={setFormData} // Внутри компонента используй setFormData(prev => ...)
            subCategoryOptions={subCategoryOptions}
            onGenerateArticle={handleGenerateArticle}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
            articleError={articleError}
          />

          <ProductBarcodeSection
            mainBarcode={formData.mainBarcode}
            extraBarcodes={formData.extraBarcodes}
            onMainBarcodeChange={(value) => setFormData(p => ({ ...p, mainBarcode: value }))}
            onGenerateMainBarcode={handleGenerateMainBarcode}
            onAddExtraBarcode={handleAddExtraBarcode}
            onExtraBarcodeChange={(index, value) => {
              setFormData(p => {
                const bcs = [...p.extraBarcodes];
                bcs[index] = value;
                return { ...p, extraBarcodes: bcs };
              });
            }}
            onRemoveExtraBarcode={(index) => setFormData(p => ({ ...p, extraBarcodes: p.extraBarcodes.filter((_, idx) => idx !== index) }))}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />

          <ProductFinanceInfo
            purchasePrice={formData.purchasePrice}
            markup={formData.markup}
            onFinanceChange={handleFinanceChange}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />

          <ProductAttributes
            weight={formData.weight}
            measure={formData.measure}
            isMeasureOpen={isMeasureOpen}
            setIsMeasureOpen={setIsMeasureOpen}
            measureOptions={measureOptions}
            onWeightChange={(value) => setFormData(p => ({ ...p, weight: sanitize(value) }))}
            onMeasureChange={(value) => setFormData(p => ({ ...p, measure: value }))}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />
        </div>

        <StockToggle
          inStock={formData.inStock}
          onToggle={() => setFormData(p => ({ ...p, inStock: !p.inStock }))}
        />

        <div className="mt-8">
          <button
            onClick={handleSave}
            className="px-12 py-4 bg-[#55CB00] text-white font-bold rounded-2xl shadow-lg hover:brightness-95 transition-all"
          >
            Создать товар
          </button>
        </div>
      </div>
    </div>
  );
}