"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Archive, Plus, Barcode, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiData } from "@/components/hooks/useApiData";
import { Product, ProductPhoto, SubCategory, ProductMeasure, measureLabels } from "@/types/category.types";
import Image from "next/image";
import { CategoryBaseDropdown } from "@/components/ui/category/commonDropdowm";
import { useEditProductForm } from "@/components/hooks/category/useEditProduct";

export default function EditProductPage() {
  const { productId,categoryId,subCategoryId } = useParams();
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { singleItem: product, loading,refetch } = useApiData<Product>(`products/${productId}`, {
    relations: ["photos", "photos.file"]
  });

  const { data: subcategories = [] } = useApiData<SubCategory>(`subcategory`, {
    searchParams: { search: JSON.stringify({ category: { id: Number(categoryId) } }) },
  });

   const { 
    formData, setFormData, 
    photos, setPhotos, 
    handleFinanceChange, 
    isDirty, 
    handleAddExtraBarcode,
    handleGenerateMainBarcode,
    handleDeletePhoto,
    handleFileChange,
    sanitize,
    handleReset
  } = useEditProductForm(product, Number(subCategoryId));

  const measureOptions = useMemo(() => 
    Object.entries(measureLabels).map(([value, label]) => ({
      label: label, 
      value: value  
    })), 
  []);

  
  const subCategoryOptions = useMemo(() => 
    subcategories.map(sub => ({ label: sub.name, value: sub.id, subLabel: sub.category?.name })), 
  [subcategories]);


  useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = ""; 
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);

  const handleSave = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('access_token') : null;
      if (!token) return alert("Ошибка авторизации");

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const headers = { 'Authorization': `Bearer ${token}` };

      const barcodes = [formData.mainBarcode, ...formData.extraBarcodes].filter(b => b.trim() !== "");
      
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

      // Задача 1: Обновление текстовых данных
      tasks.push(
        fetch(`${apiBase}/shop/change/product/${productId}`, {
          method: "PATCH",
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        })
      );

      // Задача 2: Удаление фото, которые были убраны
      if (product?.photos) {
        const currentPhotoIds = photos.map(p => p.id).filter(Boolean);
        const photosToDelete = product.photos.filter(p => !currentPhotoIds.includes(p.id));
        
        photosToDelete.forEach(p => {
          tasks.push(
            fetch(`${apiBase}/shop/product/photo/${p.id}`, {
              method: "DELETE",
              headers
            })
          );
        });
      }

      const newFiles = photos.filter(p => p.file).map(p => p.file as File);
      if (newFiles.length > 0) {
        const photoFormData = new FormData();
        photoFormData.append("productId", String(productId));
        newFiles.forEach(file => photoFormData.append("photos", file));

        tasks.push(
          fetch(`${apiBase}/shop/product/photos`, {
            method: "POST",
            headers, 
            body: photoFormData,
          })
        );
      }

      const responses = await Promise.all(tasks);
      
      const hasError = responses.some(res => !res.ok);

      if (!hasError) {
        await refetch()
        alert("Изменения сохранены успешно");
        router.refresh();
      } else {
        alert("Некоторые данные не удалось сохранить. Проверьте консоль.");
      }

    } catch (error) {
      console.error("Save error:", error);
      alert("Произошла критическая ошибка при сохранении");
    }
  };

  if (loading || !product) return null;

  const inputBase = "w-full h-[54px] px-4 bg-[#F1F2F6] rounded-xl border-none outline-none font-medium text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const labelBase = "text-xs font-bold text-gray-400 uppercase ml-1";
  const blockInvalidChars = (e: React.KeyboardEvent) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  return (
    <div className="min-h-screen rounded-4xl bg-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="text-xl font-bold">Редактирование товара</h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#F1F2F6] font-semibold rounded-xl hover:bg-gray-200"><Archive size={18} /> Архивировать</button>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Photos Section */}
        <div className="flex gap-4 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative w-38 h-38 group rounded-2xl border-3">
              <Image src={p.url} alt="product" fill className="object-cover rounded-xl" />
              <button 
                type="button"
                onClick={() => handleDeletePhoto(i)}
                className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-38 h-38 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50"
          >
            <Plus size={24} /><span className="font-bold text-[10px] uppercase">Добавить фото</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 items-end">
          <div className="space-y-1.5">
            <label className={labelBase}>Название*</label>
            <input className={inputBase} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <CategoryBaseDropdown
            label="Подкатегория"
            value={formData.subCategoryId} 
            options={subCategoryOptions}   
            isOpen={isSubCategoryOpen}     
            onToggle={() => setIsSubCategoryOpen(!isSubCategoryOpen)}
            onSelect={val => { setFormData({ ...formData, subCategoryId: val }); setIsSubCategoryOpen(false); }}
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className={labelBase}>Штрихкод*</label>
              <button type="button" onClick={handleGenerateMainBarcode} className="text-[10px] text-blue-500 font-bold uppercase hover:underline">Сгенерировать</button>
            </div>
            <div className="relative">
              <input className={inputBase} value={formData.mainBarcode} onChange={e => setFormData({...formData, mainBarcode: e.target.value})} />
              <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <button type="button" onClick={handleAddExtraBarcode} className="w-full h-[54px] border-2 border-blue-200 rounded-xl text-blue-500 font-bold flex items-center justify-between px-4 hover:bg-blue-50 transition-colors">
            <span>Доп. штрих код</span> <Plus size={20} />
          </button>

          {formData.extraBarcodes.map((bc, i) => (
            <div key={i} className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Доп. штрихкод {i + 1}</label>
              <input className={inputBase} value={bc} onChange={e => {
                const bcs = [...formData.extraBarcodes]; bcs[i] = e.target.value; setFormData({...formData, extraBarcodes: bcs});
              }} />
              <X className="absolute right-4 top-11 bottom-4 text-gray-300 cursor-pointer hover:text-red-500" size={18} 
                 onClick={() => setFormData(p => ({...p, extraBarcodes: p.extraBarcodes.filter((_, idx) => idx !== i)}))} />
            </div>
          ))}

          {[
            { label: "Цена*", field: "price", unit: "Руб" },
            { label: "Накрутка*", field: "markup", unit: "%" }
          ].map(f => (
            <div key={f.field} className="space-y-1.5">
              <label className={labelBase}>{f.label}</label>
              <div className="relative">
                <input type="number" className={inputBase} value={formData[f.field as "price"|"markup"]} 
                  onKeyDown={blockInvalidChars}
                  onChange={e => handleFinanceChange(f.field as any, e.target.value)} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">{f.unit}</span>
              </div>
            </div>
          ))}

          <div className="space-y-1.5">
            <label className={labelBase}>Объем \ вес*</label>
            <input type="number" className={inputBase} value={formData.weight} onKeyDown={blockInvalidChars}
              onChange={e => setFormData({...formData, weight: sanitize(e.target.value)})} />
          </div>

          <CategoryBaseDropdown
            label="Единица измерения"
            placeholder="Выберите ед. изм."
            value={formData.measure}
            options={measureOptions}
            isOpen={isMeasureOpen}
            onToggle={() => setIsMeasureOpen(!isMeasureOpen)}
            onSelect={(val) => {
              setFormData({ ...formData, measure: val as ProductMeasure });
              setIsMeasureOpen(false);
            }}
          />
        </div>

        <div className="flex items-center gap-4 py-4 border-t">
          <button type="button" onClick={() => setFormData({...formData, inStock: !formData.inStock})}
            className={cn("w-12 h-6 rounded-full relative transition-colors", formData.inStock ? "bg-[#55CB00]" : "bg-gray-300")}>
            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", formData.inStock ? "left-7" : "left-1")} />
          </button>
          <span className="text-sm font-semibold text-gray-700">Товар в наличии</span>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button 
            onClick={handleSave} 
            disabled={!isDirty} // Кнопка неактивна, если изменений нет
            className={cn(
              "px-12 py-4 text-white font-bold rounded-2xl shadow-lg transition-all",
              isDirty ? "bg-[#55CB00] hover:brightness-95" : "bg-gray-300 cursor-not-allowed"
            )}
          >
            Сохранить изменения
          </button>

          {isDirty && (
            <button 
              onClick={handleReset}
              className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Отменить изменения
            </button>
          )}
        </div>
      </div>
    </div>
  );
}