"use client";

import React, { useState } from "react";
import { Search, Undo2, Redo2, Plus, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/theme";
import { Product } from "@/types/category.types";
import { MeasureDropDown } from "../ui/category/dropdown";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedProducts: Product[];
}

export const EditMenu = ({ isOpen, onClose, selectedCount, selectedProducts }: BulkEditModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  // Храним уникальность полей в формате "productId-fieldName" (напр. "1-price")
  const [uniqueFields, setUniqueFields] = useState<string[]>([]);

  const [changes, setChanges] = useState({
    priceOffset: 0,
    markup: 15,
    volume: "",
    measure: ""
  });

  // Переключение уникальности конкретного поля
  const toggleFieldUnique = (productId: number, fieldName: string) => {
    const key = `${productId}-${fieldName}`;
    setUniqueFields(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isFieldUnique = (productId: number, fieldName: string) => 
    uniqueFields.includes(`${productId}-${fieldName}`);

  if (!isOpen) return null;

  const filteredProducts = selectedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Если клик был именно по фону (а не по белому окну внутри)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-400/40 backdrop-blur-sm p-4">
      <div className="p-3 bg-gray-200 rounded-[32px] w-full max-w-[1100px] h-[680px] flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 gap-3">
        
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div className="flex-1 p-8 flex flex-col min-w-0 bg-white rounded-3xl border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-[260px]">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск" 
                className="w-full bg-transparent pt-2 pb-1.5 text-sm outline-none border-b border-gray-200 focus:border-gray-400 transition-colors placeholder:text-gray-400 pr-8"
              />
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 cursor-pointer" />
            </div>

            <div className="flex items-center gap-4">
               {uniqueFields.length > 0 && (
                 <button 
                  onClick={() => setUniqueFields([])}
                  className="text-xs text-purple-600 font-medium hover:underline transition-all"
                 >
                   Сбросить уникальные полей <span className="bg-purple-600 text-white px-1.5 rounded-full text-[10px]">{uniqueFields.length}</span>
                 </button>
               )}
               <div className="flex gap-3 text-gray-500">
                <button className="hover:text-gray-700 p-1"><Undo2 size={18} /></button>
                <button className="hover:text-gray-700 p-1"><Redo2 size={18} /></button>
              </div>
            </div>
          </div>
          
          {/* Заголовки таблицы */}
          <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1.1fr_1fr] gap-3 px-2 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            <span>Название</span>
            <span className="text-center">Цена</span>
            <span className="text-center">Накрутка</span>
            <span className="text-center">Объем</span>
            <span className="text-center">Ед. изм.</span>
            <span className="text-center">Наличие</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {filteredProducts.map((product) => {
              // Проверяем уникальность каждого поля отдельно
              const priceUnique = isFieldUnique(product.id, 'price');
              const markupUnique = isFieldUnique(product.id, 'markup');
              const volumeUnique = isFieldUnique(product.id, 'volume');
              const measureUnique = isFieldUnique(product.id, 'measure');

              // Стили для обычного и группового изменения
              const isPriceBulk = !priceUnique && changes.priceOffset !== 0;
              const isMarkupBulk = !markupUnique && changes.markup !== 15;
              const isVolumeBulk = !volumeUnique && changes.volume !== "";

              return (
                <div key={product.id} className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1.1fr_1fr] gap-1 items-center px-2">
                  <div className="bg-white border-2 border-gray-200 rounded-md px-4 py-3 text-xs font-medium text-gray-800 truncate">
                    {product.name}
                  </div>
                  
                  {/* Ячейка ЦЕНЫ */}
                  <div 
                    onClick={() => toggleFieldUnique(product.id, 'price')}
                    className={cn(
                      "rounded-md py-3 border text-xs  transition-all cursor-pointer relative",
                      priceUnique 
                        ? "!border-purple-400 text-purple-600 bg-white" 
                        : isPriceBulk 
                          ? "border-1 text-blue-500 !border-blue-300 " 
                          : "border-2 border-gray-200 text-gray-700 bg-white" 
                    )}
                  >
                    <div className="flex items-center justify-center w-full gap-1.5">
                      <span>
                        {priceUnique ? product.price : Number(product.price) + changes.priceOffset}
                      </span>
                      {priceUnique && <div className="w-1 h-1 bg-purple-600 rounded-full" />}
                    </div>
                  </div>

                  {/* Ячейка НАКРУТКИ */}
                  <div 
                    onClick={() => toggleFieldUnique(product.id, 'markup')}
                    className={cn(
                      "rounded-md py-3 border text-xs transition-all cursor-pointer relative",
                      markupUnique 
                        ? "!border-purple-400 text-purple-600 bg-white" 
                        : isMarkupBulk 
                          ? "!border-1 text-blue-500 !border-blue-300" 
                          : "border-2 border-gray-200 text-gray-700 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-center w-full gap-1.5">
                      <span>
                        {markupUnique ? "10" : changes.markup}
                      </span>
                      {markupUnique && <div className="w-1 h-1 bg-purple-600 rounded-full" />}
                    </div>
                  </div>

                  {/* Ячейка ОБЪЕМА */}
                  <div 
                  onClick={() => toggleFieldUnique(product.id, 'volume')}
                    className={cn(
                    "rounded-md py-3 border text-xs transition-all relative cursor-pointer",
                      volumeUnique 
                        ? "!border-purple-400 text-purple-600 bg-white" 
                        : isVolumeBulk 
                          ? "!border-1 text-blue-500 !border-blue-300" 
                          : "border-2 border-gray-200 text-gray-700 bg-white"
                      )}
                      >
                      <div className="flex items-center justify-center w-full gap-1.5">
                      <span>
                        {volumeUnique ? (product.weight || 1) : (changes.volume || product.weight || 1)}
                      </span>
                    {volumeUnique && <div className="w-1 h-1 bg-purple-600 rounded-full" />}
                    </div>
                  </div>

                  {/* Ед измерения */}
                  <MeasureDropDown 
                    product={product}
                    measureUnique={measureUnique}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    toggleFieldUnique={toggleFieldUnique}
                    changes={changes}
                    onMeasureSelect={() => {
                    }
                    }/>

                  <div className="border-2 bg-white border-gray-200 rounded-md py-3 text-center text-[10px] text-gray-400 font-bold uppercase">
                    В наличии
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (без изменений) */}
        <div className="w-[320px] p-6 flex flex-col bg-white rounded-3xl shadow-sm">
          <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-6">
            Групповое <br /> редактирование
          </h2>
          
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Цена */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase">Цена</label>
                <button onClick={() => setChanges(p => ({...p, priceOffset: 0}))} className="text-[11px] text-gray-400 hover:text-blue-500">Сбросить</button>
              </div>
              <div className={cn(
                "flex items-center rounded-2xl p-2 border transition-all gap-1",
                changes.priceOffset !== 0 ? "bg-blue-50/50 border-blue-400 ring-1 ring-blue-400/20" : "bg-gray-50 border-gray-200"
              )}>
                <button onClick={() => setChanges(p => ({...p, priceOffset: p.priceOffset - 5}))} className="p-2 hover:bg-white rounded-xl shadow-sm"><Minus size={14} /></button>
                <input 
                  type="text" 
                  value={changes.priceOffset >= 0 ? `+${changes.priceOffset}` : changes.priceOffset} 
                  className={cn("w-full bg-transparent text-center text-sm font-bold outline-none", changes.priceOffset !== 0 ? "text-blue-600" : "text-gray-500")}
                  readOnly 
                />
                <button onClick={() => setChanges(p => ({...p, priceOffset: p.priceOffset + 5}))} className="p-2 hover:bg-white rounded-xl shadow-sm"><Plus size={14} /></button>
              </div>
            </div>

            {/* Накрутка */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase">Накрутка</label>
                <button onClick={() => setChanges(p => ({...p, markup: 15}))} className="text-[11px] text-gray-400">Сбросить</button>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={changes.markup} 
                  onChange={(e) => setChanges(p => ({...p, markup: Number(e.target.value)}))}
                  className={cn(
                    "w-full rounded-2xl p-4 text-sm border outline-none font-bold transition-all",
                    changes.markup !== 15 ? "border-blue-400 text-blue-600 bg-blue-50/20" : "border-gray-200 bg-white"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">%</span>
              </div>
            </div>

            {/* Объемы */}
            <div>
              <label className="text-[11px] text-gray-400 mb-1.5 block font-bold uppercase">Объемы</label>
              <input 
                type="text" 
                placeholder="Введите" 
                value={changes.volume}
                onChange={(e) => setChanges(p => ({...p, volume: e.target.value}))}
                className={cn(
                    "w-full rounded-2xl p-4 text-sm border outline-none transition-all",
                    changes.volume !== "" ? "border-blue-400 bg-blue-50/20" : "border-gray-100 bg-gray-50"
                  )}
              />
            </div>

            {/* Инфо-блок */}
           <div>
            <div className="h-[1px] w-full bg-gray-300 mb-2"></div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 shrink-0"></div>
              <div className="flex flex-col leading-tight">
                <p className="text-[15px] font-bold text-gray-900">
                  Уникальные значения
                </p>
                <p className="text-[12px] text-gray-500">
                  не участвуют в групповом редактировании
                </p>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gray-300 mt-5"></div>
          </div>
          </div>

          <div className="space-y-3 mt-6">
            <button 
              onClick={() => {
                setChanges({ priceOffset: 0, markup: 15, volume: "", measure: "" });
                setUniqueFields([]);
              }}
              className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl text-xs"
            >
              Отменить всё
            </button>
            <button className="w-full bg-[#55CB00] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 text-xs">
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};