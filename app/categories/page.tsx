"use client";

import React, { useState } from "react";
import { List, LayoutGrid, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";
import { Category } from "@/types/category.types";
import Image from "next/image";
import { useApiData } from "@/components/hooks/useApiData";
import { useRouter } from "next/navigation";
import { SelectionButtons } from "@/components/category/selectionButtons";
import { CategoryHeader } from "@/components/category/header";

export default function CategoryPage() {
  const router=useRouter()
  const { data:categories, loading } = useApiData<Category>('category',{relations:["photo", "subCategory"]});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const toggleCategory = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: number,name:string) => {
    router.push(`/categories/${id}?name=${encodeURIComponent(name)}`);
  };

  const isAllSelected = categories.length > 0 && selectedIds.length === categories.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((cat: Category) => cat.id));
    }
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-400">Загрузка каталога...</div>;
  }

  return (
    <div>
      <CategoryHeader/>
    <div className="p-8 rounded-4xl bg-white min-h-screen">
      <div className="flex flex-col items-end mb-8 gap-4">
      <div className="flex md:items-center justify-between w-full">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Все категории</h2>
          <p className="text-sm text-text-secondary mt-1">Доступно разделов: {categories.length}</p>
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
            selectedCount={selectedIds.length}
            onEditMenu={() => setIsEditMenuOpen(true)}
            onExport={() => console.log("Exporting...")}
            onArchive={() => console.log("Archiving...")}
          />
      </div>

      <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 text-sm font-medium transition-colors">
          <CheckCircle2 className={cn("w-5 h-5", isAllSelected ? "text-[#55CB00]" : "text-gray-300")} />
          {isAllSelected ? `Выбрано: ${selectedIds.length}` : "Выбрать все"}
        </button>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((cat: Category) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                className="group relative flex flex-col items-center rounded-[24px] cursor-pointer bg-white"
                onClick={() => handleCardClick(cat.id,cat.name)}
              >
                <div
                  onClick={(e) => toggleCategory(cat.id, e)}
                  className={cn(
                    "absolute top-2 left-2 transition-all z-10",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-colors",
                      isSelected ? "border-[#55CB00]" : "border-gray-200"
                    )}
                  >
                    <CheckCircle2 className={cn("w-5 h-5", isSelected ? "text-[#55CB00]" : "text-gray-300")} />
                  </div>
                </div>

                <div
                  className={cn(
                    "relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 transition-all border-2",
                    isSelected ? "border-[#55CB00]" : "border-transparent"
                  )}
                  style={{
                    backgroundImage: cat.photo?.url ? `url(${cat.photo.url})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {!cat.photo && (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 text-[10px] font-bold uppercase">
                      Нет фото
                    </div>
                  )}
                </div>

                <h3 className=
                  "text-xs text-center px-2 leading-snug transition-colors">
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat: Category) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <div key={cat.id} className="flex items-center w-full">                 
                  <div 
                    onClick={(e)=>toggleCategory(cat.id,e)}
                    className=" w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 
                        className={cn(
                          "w-4 h-4 transition-colors", 
                          isSelected ? "text-[#55CB00]" : "text-gray-300"
                        )} 
                      />
                  </div>                  
              <div
                
                onClick={() => handleCardClick(cat.id,cat.name)}
                className="flex items-center w-full justify-between p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {cat.photo ? (
                      <Image
                        src={cat.photo.url}
                        alt={cat.name}
                        width={120}
                        height={50}
                        className="object-cover rounded-xl transition-all"
                      />
                    ) : (
                      <div className="w-[120px] h-[70px] rounded-xl flex items-center justify-center text-[8px] bg-gray-200 text-gray-400 font-bold">
                        Нет фото
                      </div>
                    )}
                   
                  </div>
                  <span className="text-sm transition-colors">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400">{cat.subCategory?.length || 0} суб категории</p>
                  <ChevronRight size={18} className={cn("transition-colors", isSelected ? "text-[#55CB00]" : "text-gray-500")} />
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}