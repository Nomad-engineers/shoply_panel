import { useState, useEffect, useMemo, useCallback } from "react";
import { ProductMeasure } from "@/types/category.types";
import { calculatePrice } from "@/lib/utils";

interface PhotoState {
  id?: number;
  fileId?: string;
  url: string;
  file?: File;
}

export interface EditableProductData {
  product?: {
    id: number;
    name: string;
    weight: number;
    measure: ProductMeasure;
    article: string;
    barcodes: string[];
    subCategory: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
      };
    };
    photos: Array<{
      id: number;
      file: { url: string };
    }>;
  };

  shop?: {
    id: number;
    name: string;
  };
  productId: number;
  createdAt: string;
  shopId: number;
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  name: string;
  purchasePrice: number;
  price: number;
  inStock: boolean;
  archivedAt: string | null;
  weight: number;
  measure: ProductMeasure;
  article: string;
  barcodes: string[];
  photos?: Array<{
    id: number;
    fileId?: string;
    url?: string | null;
  }>;
}

function toFormSeed(
  product: EditableProductData | undefined,
  initialSubCategoryId: number,
) {
  if (!product) {
    return {
      categoryId: 0,
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
    };
  }

  const persistedPurchasePrice = Number(product.purchasePrice) || 0;
  const persistedPrice = Number(product.price) || 0;
  const hasMarkup = persistedPurchasePrice > 0;
  const editableBasePrice = hasMarkup ? persistedPurchasePrice : persistedPrice;
  const sellingPrice = hasMarkup ? persistedPrice : editableBasePrice;
  const markup =
    hasMarkup && editableBasePrice > 0
      ? Number(
          (((sellingPrice - editableBasePrice) / editableBasePrice) * 100).toFixed(
            2
          )
        )
      : 0;

  return {
    categoryId: product.categoryId || 0,
    subCategoryId: product.subCategoryId || Number(initialSubCategoryId),
    name: product.name || "",
    mainBarcode: (product.barcodes || [])[0] || "",
    extraBarcodes: (product.barcodes || []).slice(1),
    purchasePrice: editableBasePrice,
    price: sellingPrice,
    markup,
    weight: product.weight || 0,
    article: product.article || "",
    measure: (product.measure as ProductMeasure) || ProductMeasure.PIECE,
    inStock: product.inStock ?? true,
  };
}

export function useProductForm(
  shopProduct: EditableProductData | undefined,
  initialSubCategoryId: number,
  shopId: string | null
) {
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [formData, setFormData] = useState(() =>
    toFormSeed(shopProduct, initialSubCategoryId)
  );

  // Инициализация данных из локального editable DTO
  useEffect(() => {
    if (shopProduct) {
      setPhotos(
        shopProduct.photos?.map((p) => ({
          id: p.id,
          fileId: p.fileId,
          url: p.url || "",
        })) || []
      );

      setFormData(toFormSeed(shopProduct, initialSubCategoryId));
    }
  }, [shopProduct, initialSubCategoryId]);

  const generateEAN13 = useCallback(() => {
    let code = "29";

    for (let i = 0; i < 10; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = Number.parseInt(code[i], 10);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkSum = (10 - (sum % 10)) % 10;

    return `SP-${code}${checkSum}`;
  }, []);

  const handleGenerateMainBarcode = () => {
    setFormData((prev) => ({ ...prev, mainBarcode: generateEAN13() }));
  };

  const handleAddExtraBarcode = () => {
    setFormData((prev) => ({
      ...prev,
      extraBarcodes: [...prev.extraBarcodes, ""],
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
      const currentMarkup =
        field === "markup" ? numVal : Number(prev.markup) || 0;

      if (field === "purchasePrice") {
        updates.price =
          currentMarkup > 0 ? calculatePrice(numVal, currentMarkup) : numVal;
      } else if (field === "markup") {
        updates.price =
          numVal > 0
            ? calculatePrice(currentPurchasePrice, numVal)
            : currentPurchasePrice;
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

    const initialBarcodes = shopProduct.barcodes || [];
    const currentBarcodes = [
      formData.mainBarcode,
      ...formData.extraBarcodes,
    ].filter(Boolean);
    const initialSeed = toFormSeed(shopProduct, initialSubCategoryId);

    const hasFormChanged =
      formData.name !== shopProduct.name ||
      formData.subCategoryId !== shopProduct.subCategoryId ||
      Number(formData.price) !== Number(initialSeed.price || 0) ||
      Number(formData.purchasePrice) !== Number(initialSeed.purchasePrice || 0) ||
      Number(formData.weight) !== (shopProduct.weight || 0) ||
      formData.measure !== shopProduct.measure ||
      formData.inStock !== (shopProduct.inStock ?? true) ||
      formData.article !== (shopProduct.article || "") ||
      Number(formData.markup) !== Number(initialSeed.markup || 0) ||
      JSON.stringify(initialBarcodes) !== JSON.stringify(currentBarcodes);

    const initialPhotoUrls = shopProduct.photos?.map((p) => p.url) || [];
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

    setPhotos(
      shopProduct.photos?.map((p) => ({
        id: p.id,
        fileId: p.fileId,
        url: p.url || "",
      })) || []
    );

    setFormData(toFormSeed(shopProduct, initialSubCategoryId));
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
