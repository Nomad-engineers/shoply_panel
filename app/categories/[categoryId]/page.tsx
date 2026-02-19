"use client";

import React, { useState } from "react";
import { List, LayoutGrid, CheckCircle2, ChevronRight, Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/theme";
import { SubCategory, Product, measureLabels } from "@/types/category.types";
import Image from "next/image";
import { useApiData } from "@/components/hooks/useApiData";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";
import { EditMenu } from "@/components/category/editMenu";

export default function SubCategoryPage() {
  const router = useRouter();
  const { categoryId } = useParams();
  const searchParams = useSearchParams();
  const categoryName = searchParams.get("name") || "Молочные продукты";

  const [openSubCategoryIds, setOpenSubCategoryIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const { data: subCategories, loading } = useApiData<SubCategory>('subCategory', { 
    relations: ["photo", "products", "products.photos.file"],
    searchParams: {
      search: JSON.stringify({ "category.id": categoryId })
    }
  });


  const toggleSubCategory = (id: number) => {
    setOpenSubCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };



  const allProductIds = subCategories.flatMap(sub => sub.products?.map(p => p.id) || []);
  const isAllSelected = allProductIds.length > 0 && selectedProductIds.length === allProductIds.length;

  
  const selectedProductsData = subCategories
  .flatMap(sub => sub.products || [])
  .filter(product => selectedProductIds.includes(product.id));
  
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allProductIds);
    }
  };
  
  const toggleSubCategoryProducts = (subId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не срабатывал toggleSubCategory (аккордеон)
    const sub = subCategories.find(s => s.id === subId);
    if (!sub || !sub.products) return;
    
    const subProductIds = sub.products.map(p => p.id);
    const areAllInSubSelected = subProductIds.every(id => selectedProductIds.includes(id));
    
    if (areAllInSubSelected) {
      // Если все уже выбраны — снимаем выделение с этой группы
      setSelectedProductIds(prev => prev.filter(id => !subProductIds.includes(id)));
    } else {
      // Иначе добавляем недостающие ID
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...subProductIds])));
    }
  };
  
  // Выбор одиночного товара
  const toggleProduct = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
};

  const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('kz-KZ');

  const copyToClipboard = (text: string | null | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    alert(`Артикул ${text} скопирован!`);
  };  
  
  const handleProductClick = (productId: number,subCategoryId:number) => {
    const currentPath = window.location.pathname;
    const currentQueries = searchParams.toString();
    
    router.push(`${currentPath}/subCategory/${subCategoryId}/product/${productId}?${currentQueries}`);
  };
  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Загрузка...</div>;
  
  return (
    <div>
      <CategoryHeader />
      <div className="min-h-screen bg-white rounded-4xl">
        {/* Шапка страницы */}
        <div className="p-8 flex items-end flex-col justify-between gap-4">
          <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-1 hover:bg-gray-50 rounded-lg">
              <ChevronRight className="rotate-180 w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#1A1C1E]">{categoryName}</h1>
          </div>

            
            
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                  viewMode === "list" ? "bg-white shadow-sm text-primary-main" : "text-gray-500"
                )}
              >
                <List className="w-4 h-4" /> Список
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                  viewMode === "grid" ? "bg-white shadow-sm text-primary-main" : "text-gray-500"
                )}
              >
                <LayoutGrid className="w-4 h-4" /> Карточки
              </button>
            </div>
            </div>
            <SelectionButtons
              selectedCount={selectedProductIds.length}
              onEditMenu={() => setIsEditMenuOpen(true)}
              onExport={() => console.log("Exporting...", selectedProductIds)}
              onArchive={() => console.log("Archiving...", selectedProductIds)}
            />
        </div>

        <div className="px-8 pb-8">
          {/* Кнопка "Выбрать все товары на странице" */}
          <div className="flex items-center justify-between mb-10 pb-3 border-gray-50">
            <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium transition-colors">
              <CheckCircle2 className={cn("w-5 h-5", isAllSelected ? "text-[#55CB00]" : "text-gray-300")} />
              {isAllSelected ? `Выбрано товаров: ${selectedProductIds.length}` : "Выбрать все товары"}
            </button>
          </div>

          {/* Список подкатегорий (Аккордеоны) */}
          {subCategories.map((sub) => {
            const isOpen = openSubCategoryIds.includes(sub.id);
            const subProductIds = sub.products?.map(p => p.id) || [];
            const isSubPartiallySelected = subProductIds.some(id => selectedProductIds.includes(id));
            const isSubFullySelected = subProductIds.length > 0 && subProductIds.every(id => selectedProductIds.includes(id));

            return (
              <div key={sub.id} className="mb-6 border-b border-gray-50 pb-4 last:border-0">
                {/* Заголовок подкатегории */}
                <div 
                  className="flex items-center justify-between py-2 group cursor-pointer hover:bg-gray-50/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Чекбокс для выбора ВСЕХ товаров данной подкатегории */}
                    <div onClick={(e) => toggleSubCategoryProducts(sub.id, e)} className="p-1 hover:scale-110 transition-transform">
                      <CheckCircle2 className={cn(
                        "w-5 h-5", 
                        isSubFullySelected ? "text-[#55CB00]" : isSubPartiallySelected ? "text-[#55CB00]/50" : "text-gray-300"
                      )} />
                    </div>
                    {/* Клик по названию просто открывает аккордеон */}
                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleSubCategory(sub.id)}>
                        <h2 className="text-md text-[#1A1C1E] font-semibold">{sub.name}</h2>
                        <span className="bg-[#F5F7F9] px-2 py-0.5 rounded-full text-[10px] text-gray-400 font-bold">
                        {sub.products?.length || 0}
                        </span>
                    </div>
                  </div>
                  <ChevronDown 
                    onClick={() => toggleSubCategory(sub.id)} 
                    className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen ? "rotate-180" : "")} 
                  />
                </div>

                {/* Список товаров (Контент аккордеона) */}
                {isOpen && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-1 duration-200">
                    {viewMode === "list" ? (
                      <div className="space-y-4">
                        {sub.products?.map((product: Product) => {
                          const isSelected = selectedProductIds.includes(product.id);
                          return (
                            <div onClick={() => handleProductClick(product.id,sub.id)} key={product.id} className="flex items-center justify-between py-2 group">
                              <div className="flex items-center gap-4 flex-1">
                                <div onClick={(e) => toggleProduct(product.id, e)} className="cursor-pointer">
                                  <CheckCircle2 className={cn("w-5 h-5", isSelected ? "text-[#55CB00]" : "text-gray-200")} />
                                </div>
                                <div className="w-12 h-12 bg-[#F5F7F9] rounded-xl flex-shrink-0 relative overflow-hidden">
                                  {product.photos?.[0]?.file?.url && (
                                    <Image src={product.photos[0].file.url} alt={product.name} fill className="object-cover" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-[#1A1C1E]">{product.name}</h4>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {product.archivedAt ? formatDate(product.archivedAt) : ""} ID: {product.id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-12 text-sm text-[#1A1C1E]">
                                <span className="text-blue-500 text-xs flex items-center gap-1">
                                  <Package size={14} onClick={(e)=>copyToClipboard(product.article,e)} className="cursor-pointer"/> {product.article || 'Нет артикля'}
                                </span>
                                <span className="w-20">{product.weight} {measureLabels[product.measure] || 'шт'}</span>
                                <span className="w-16 ">{product.price} ₽</span>
                                <span className={`text-xs ${product.inStock ? "text-[#55CB00]" : "text-red-500"}`}>
                                    {product.inStock ? "В наличии" : 'Нет в наличии'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Режим сетки (Grid) */
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {sub.products?.map((product: Product) => {
                          const isSelected = selectedProductIds.includes(product.id);
                          return (
                            <div onClick={() => handleProductClick(product.id,sub.id)} key={product.id} className="relative group">
                              {/* Чекбокс поверх картинки */}
                              <div className="absolute top-2 left-2 z-10" onClick={(e) => toggleProduct(product.id, e)}>
                                <CheckCircle2 className={cn(
                                    "w-6 h-6 rounded-full bg-white shadow-md transition-colors", 
                                    isSelected ? "text-[#55CB00]" : "text-gray-300"
                                )} />
                              </div>
                              <div className="aspect-square bg-gray-100 rounded-[24px] mb-3 relative overflow-hidden">
                                {product.photos?.[0]?.file.url ? (
                                    <Image src={product.photos[0].file?.url} alt={product.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><Package size={40} /></div>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 mb-1 italic">
                                {product.archivedAt ? `В архиве ${formatDate(product.archivedAt)}` : ""}
                              </p>
                              <h4 className="text-md text-[#1A1C1E] font-semibold leading-tight mb-1">{product.name}</h4>
                              <p className="text-sm font-bold mb-1">{product.price} ₽</p>
                              <p className="text-xs text-gray-400">{sub.name}</p>
                              <button className="mt-3 w-full bg-[#55CB00] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95">
                                Вернуть ↺
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <EditMenu 
        isOpen={isEditMenuOpen} 
        onClose={() => setIsEditMenuOpen(false)} 
        selectedCount={selectedProductIds.length}
        selectedProducts={selectedProductsData}
      />
    </div>
  );
}