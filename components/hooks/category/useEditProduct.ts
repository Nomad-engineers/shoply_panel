import { useState, useEffect, useMemo, useCallback } from "react";
import { ProductMeasure, ShopProduct } from "@/types/category.types";
import { calculatePrice } from "@/lib/utils";

interface PhotoState {
  id?: number;
  url: string;
  file?: File;
}

export function useProductForm(
  shopProduct: ShopProduct | undefined,
  initialSubCategoryId: number,
  shopId: string | null
) {
  const [photos, setPhotos] = useState<PhotoState[]>([]);

  const [formData, setFormData] = useState({
    subCategoryId: initialSubCategoryId,
    name: "",
    article: "",
    mainBarcode: "",
    extraBarcodes: [] as string[],
    purchasePrice: 0 as number | "",
    price: 0 as number | "",
    markup: 0 as number | "",
    weight: 0 as number | "",
    measure: ProductMeasure.PIECE as ProductMeasure,
    inStock: true,
  });

  // Инициализация данных из ShopProduct
  useEffect(() => {
    if (shopProduct) {
      const baseProduct = shopProduct.product;
      const pPrice = shopProduct.purchasePrice || 0;
      const sPrice = shopProduct.price || 0;

      setPhotos(
        baseProduct?.photos?.map((p) => ({
          id: p.id,
          url: p.file?.url || "",
        })) || []
      );

      setFormData({
        subCategoryId:
          baseProduct?.subCategory?.id || Number(initialSubCategoryId),
        name: baseProduct?.name || "",
        mainBarcode: (baseProduct?.barcodes || [])[0] || "",
        extraBarcodes: (baseProduct?.barcodes || []).slice(1),
        purchasePrice: pPrice,
        price: sPrice,
        markup:
          pPrice > 0
            ? Number((((sPrice - pPrice) / pPrice) * 100).toFixed(2))
            : 0,
        weight: baseProduct?.weight || 0,
        article: baseProduct?.article || "",
        measure:
          (baseProduct?.measure as ProductMeasure) || ProductMeasure.PIECE,
        inStock: shopProduct.inStock ?? true,
      });
    }
  }, [shopProduct, initialSubCategoryId]);

  const generateEAN13 = useCallback(() => {
    let code =
      "29" +
      Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
    let sum = 0;
    for (let i = 0; i < 12; i++)
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    const checkSum = (10 - (sum % 10)) % 10;
    return code + checkSum;
  }, []);

  const handleGenerateMainBarcode = () => {
    setFormData((prev) => ({ ...prev, mainBarcode: generateEAN13() }));
  };

  const handleAddExtraBarcode = () => {
    setFormData((prev) => ({
      ...prev,
      extraBarcodes: [...prev.extraBarcodes, generateEAN13()],
    }));
  };

  const handleRemoveExtraBarcode = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extraBarcodes: prev.extraBarcodes.filter((_, i) => i !== index),
    }));
  };

  const sanitize = (v: string) => {
    const clean = v.replace(/[^\d.]/g, "");
    return clean === "" ? "" : Number(clean);
  };

  const handleFinanceChange = (
    field: "price" | "markup" | "purchasePrice",
    val: string
  ) => {
    const num = sanitize(val);
    const numVal = num === "" ? 0 : Number(num);

    setFormData((prev) => {
      const updates: any = { [field]: num };
      const currentPurchasePrice =
        field === "purchasePrice" ? numVal : Number(prev.purchasePrice) || 0;
      const currentPrice = field === "price" ? numVal : Number(prev.price) || 0;
      const currentMarkup =
        field === "markup" ? numVal : Number(prev.markup) || 0;

      if (field === "purchasePrice") {
        updates.price = calculatePrice(numVal, currentMarkup);
      } else if (field === "markup") {
        updates.price = calculatePrice(currentPurchasePrice, numVal);
      } else if (field === "price") {
        updates.markup =
          currentPurchasePrice > 0
            ? Number(
                (
                  ((numVal - currentPurchasePrice) / currentPurchasePrice) *
                  100
                ).toFixed(2)
              )
            : 0;
      }

      return { ...prev, ...updates };
    });
  };

  const isDirty = useMemo(() => {
    if (!shopProduct) return false;

    const baseProduct = shopProduct.product;
    const initialBarcodes = baseProduct?.barcodes || [];
    const currentBarcodes = [
      formData.mainBarcode,
      ...formData.extraBarcodes,
    ].filter(Boolean);

    const hasFormChanged =
      formData.name !== baseProduct?.name ||
      formData.subCategoryId !== baseProduct?.subCategory?.id ||
      Number(formData.price) !== (shopProduct.price || 0) ||
      Number(formData.purchasePrice) !== (shopProduct.purchasePrice || 0) ||
      Number(formData.weight) !== (baseProduct?.weight || 0) ||
      formData.measure !== baseProduct?.measure ||
      formData.inStock !== (shopProduct.inStock ?? true) ||
      formData.article !== (baseProduct?.article || "") ||
      JSON.stringify(initialBarcodes) !== JSON.stringify(currentBarcodes);

    const initialPhotoUrls = baseProduct?.photos?.map((p) => p.file?.url) || [];
    const currentPhotoUrls = photos.map((p) => p.url);
    const hasPhotosChanged =
      JSON.stringify(initialPhotoUrls) !== JSON.stringify(currentPhotoUrls);

    return hasFormChanged || hasPhotosChanged;
  }, [formData, photos, shopProduct]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
      }));
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (!shopProduct) return;
    const baseProduct = shopProduct.product;
    const pPrice = shopProduct.purchasePrice || 0;
    const sPrice = shopProduct.price || 0;

    setPhotos(
      baseProduct?.photos?.map((p) => ({
        id: p.id,
        url: p.file?.url || "",
      })) || []
    );

    setFormData({
      subCategoryId: baseProduct?.subCategory?.id || initialSubCategoryId,
      name: baseProduct?.name || "",
      mainBarcode: (baseProduct?.barcodes || [])[0] || "",
      extraBarcodes: (baseProduct?.barcodes || []).slice(1),
      purchasePrice: pPrice,
      price: sPrice,
      article: baseProduct?.article || "",
      markup:
        pPrice > 0
          ? Number((((sPrice - pPrice) / pPrice) * 100).toFixed(2))
          : 0,
      weight: baseProduct?.weight || 0,
      measure: (baseProduct?.measure as ProductMeasure) || ProductMeasure.PIECE,
      inStock: shopProduct.inStock ?? true,
    });
  };

  const handleGenerateArticle = useCallback(() => {
    const generated = Math.floor(
      100000000 + Math.random() * 900000000
    ).toString();
    setFormData((prev) => ({ ...prev, article: generated }));
  }, []);

  return {
    formData,
    setFormData,
    photos,
    setPhotos,
    handleFinanceChange,
    generateEAN13,
    handleAddExtraBarcode,
    handleRemoveExtraBarcode,
    isDirty,
    handleDeletePhoto,
    handleFileChange,
    handleGenerateMainBarcode,
    sanitize,
    handleReset,
    handleGenerateArticle,
  };
}