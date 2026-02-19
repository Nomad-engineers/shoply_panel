import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, ProductMeasure } from "@/types/category.types";

interface PhotoState {
  id?: number;
  url: string;
  file?: File;
}

export function useEditProductForm(product: Product | undefined, initialSubCategoryId: number) {
  const [photos, setPhotos] = useState<PhotoState[]>([]);

  // 2. Состояние полей формы
  const [formData, setFormData] = useState({
    subCategoryId: initialSubCategoryId,
    name: "",
    mainBarcode: "",
    extraBarcodes: [] as string[],
    purchasePrice: 0 as number | "",
    price: 0 as number | "",
    markup: 0 as number | "",
    weight: 0 as number | "",
    measure: ProductMeasure.PIECE as ProductMeasure,
    inStock: true,
  });

  // Инициализация при загрузке данных продукта
  useEffect(() => {
    if (product) {
      const pPrice = product.purchasePrice || 0;
      const sPrice = product.price || 0;

      setPhotos(product.photos?.map(p => ({ id: p.id, url: p.file.url })) || []);

      setFormData({
        subCategoryId: product.subCategory?.id || Number(initialSubCategoryId),
        name: product.name || "",
        mainBarcode: (product.barcodes || [])[0] || "",
        extraBarcodes: (product.barcodes || []).slice(1),
        purchasePrice: pPrice,
        price: sPrice,
        markup: pPrice > 0 ? Number(((sPrice - pPrice) / pPrice * 100).toFixed(2)) : 0,
        weight: product.weight || 0,
        measure: (product.measure as ProductMeasure) || ProductMeasure.PIECE,
        inStock: product.inStock ?? true,
      });
    }
  }, [product, initialSubCategoryId]);

  // --- Логика штрихкодов ---
  const generateEAN13 = useCallback(() => {
    let code = "29" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    const checkSum = (10 - (sum % 10)) % 10;
    return code + checkSum;
  }, []);

   const handleGenerateMainBarcode = () => {
    setFormData(prev => ({ ...prev, mainBarcode: generateEAN13() }));
  };

  const handleAddExtraBarcode = () => {
    setFormData(prev => ({ ...prev, extraBarcodes: [...prev.extraBarcodes, generateEAN13()] }));
  };

  const handleRemoveExtraBarcode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extraBarcodes: prev.extraBarcodes.filter((_, i) => i !== index)
    }));
  };
  const sanitize = (v: string) => {
    const clean = v.replace(/[^\d.]/g, "");
    return clean === "" ? "" : Number(clean);
  };
  // --- Логика финансов ---
  const handleFinanceChange = (field: "price" | "markup" | "purchasePrice", val: string) => {

    const num = sanitize(val);
    const pPrice = field === "purchasePrice" ? (num === "" ? 0 : num) : (Number(formData.purchasePrice) || 0);
    
    let updates: any = { [field]: num };

    if (field === "purchasePrice") {
      const currentMarkup = Number(formData.markup) || 0;
      updates.price = num === "" ? "" : Number((num + (num * (currentMarkup / 100))).toFixed(2));
    } else if (field === "markup") {
      updates.price = pPrice > 0 && num !== "" 
        ? Number((pPrice + (pPrice * (num / 100))).toFixed(2)) 
        : formData.price;
    } else if (field === "price") {
      updates.markup = pPrice > 0 && num !== "" 
        ? Number(((num - pPrice) / pPrice * 100).toFixed(2)) 
        : 0;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // --- Проверка на "грязную" форму (изменения) ---
  const isDirty = useMemo(() => {
    if (!product) return false;

    const initialBarcodes = product.barcodes || [];
    const currentBarcodes = [formData.mainBarcode, ...formData.extraBarcodes].filter(Boolean);

    const hasFormChanged = 
      formData.name !== product.name ||
      formData.subCategoryId !== product.subCategory?.id ||
      Number(formData.price) !== product.price ||
      Number(formData.purchasePrice) !== (product.purchasePrice || 0) ||
      Number(formData.weight) !== product.weight ||
      formData.measure !== product.measure ||
      formData.inStock !== product.inStock ||
      JSON.stringify(initialBarcodes) !== JSON.stringify(currentBarcodes);

    const initialPhotoUrls = product.photos?.map(p => p.file.url) || [];
    const currentPhotoUrls = photos.map(p => p.url);
    const hasPhotosChanged = JSON.stringify(initialPhotoUrls) !== JSON.stringify(currentPhotoUrls);

    return hasFormChanged || hasPhotosChanged;
  }, [formData, photos, product]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files).map(file => ({
          url: URL.createObjectURL(file),
          file: file
        }));
        setPhotos(prev => [...prev, ...newFiles]);
      }
    };
  
    const handleDeletePhoto = (index: number) => {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleReset = () => {
    if (!product) return;

    // Сбрасываем фотографии к начальному состоянию из API
    setPhotos(product.photos?.map(p => ({ id: p.id, url: p.file.url })) || []);

    // Сбрасываем поля формы
    setFormData({
      subCategoryId: product.subCategory?.id || initialSubCategoryId,
      name: product.name || "",
      mainBarcode: (product.barcodes || [])[0] || "",
      extraBarcodes: (product.barcodes || []).slice(1),
      purchasePrice: product.purchasePrice || 0,
      price: product.price || 0,
      markup: product.purchasePrice 
        ? Number(((product.price - product.purchasePrice) / product.purchasePrice * 100).toFixed(2)) 
        : 0,
      weight: product.weight || 0,
      measure: (product.measure as ProductMeasure) || ProductMeasure.PIECE,
      inStock: product.inStock ?? true,
    });
  };
  

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
    handleReset
  };
}