"use client";

import React, { useState } from "react";
import { Undo2, Redo2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/theme";
import { measureLabels, Product } from "@/types/category.types";
import { MeasureDropDown } from "../ui/category/dropdown";
import { CategoryBaseDropdown } from "../ui/category/commonDropdown";
import { useBulkProductUpdate } from "../hooks/category/useBulkProductUpdate";
import { SearchFilter } from "./search";

const calculatePrice = (purchasePrice: number, markup: number) => {
  return Math.ceil(purchasePrice + (purchasePrice * markup) / 100);
};

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedProducts: any[];
  shopId: string | undefined;
}

export const EditMenu = ({
  isOpen,
  onClose,
  selectedCount,
  selectedProducts,
  shopId,
}: BulkEditModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { saveProducts, isUpdating } = useBulkProductUpdate({
    onSuccess: () => {
      onClose();
      setUniqueFields([]);
      setIndividualOverrides({});
    },
    onError: (err) => {
      console.error(err);
      alert("Ошибка при сохранении");
    },
  });

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [uniqueFields, setUniqueFields] = useState<string[]>([]);
  const [individualOverrides, setIndividualOverrides] = useState<
    Record<string, any>
  >({});
  const [openDropdown, setOpenDropdown] = useState<"measure" | "stock" | null>(
    null
  );

  const [changes, setChanges] = useState({
    priceOffset: 0,
    markup: 0,
    volume: "",
    measure: "",
    inStock: null as boolean | null,
  });

  const measureOptions = Object.entries(measureLabels).map(
    ([value, label]) => ({
      label,
      value,
      subLabel: value,
    })
  );

  const handleIndividualChange = (
    uKey: string,
    pId: number,
    field: string,
    value: any
  ) => {
    // Запрет отрицательного объема
    if (field === "volume" && Number(value) < 0) return;

    const isGlobal = ["volume", "measure", "weight"].includes(field);

    setIndividualOverrides((prev) => {
      const next = { ...prev };
      if (isGlobal) {
        selectedProducts.forEach((p) => {
          if (p.id === pId) {
            next[p.uniqueKey] = { ...next[p.uniqueKey], [field]: value };
          }
        });
      } else {
        next[uKey] = { ...next[uKey], [field]: value };
      }
      return next;
    });

    const fieldKey = `${isGlobal ? pId : uKey}-${field}`;
    if (!uniqueFields.includes(fieldKey)) {
      setUniqueFields((prev) => [...prev, fieldKey]);
    }
  };

  const toggleFieldUnique = (id: string | number, fieldName: string) => {
    const key = `${id}-${fieldName}`;
    setUniqueFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isFieldUnique = (id: string | number, fieldName: string) =>
    uniqueFields.includes(`${id}-${fieldName}`);

  const filteredProducts = selectedProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-400/40 backdrop-blur-sm p-4"
    >
      <div className="p-3 bg-gray-200 rounded-[32px] w-full max-w-[1100px] h-[680px] flex overflow-hidden shadow-2xl gap-3">
        <div className="flex-1 p-8 flex flex-col min-w-0 bg-white rounded-3xl border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <SearchFilter
              value={searchQuery}
              onChange={setSearchQuery}
              variant="minimal"
              placeholder="Поиск"
              className="w-full max-w-[260px]"
            />
            <div className="flex items-center gap-4">
              {uniqueFields.length > 0 && (
                <button
                  onClick={() => setUniqueFields([])}
                  className="text-xs text-purple-600 font-medium hover:underline"
                >
                  Сбросить уникальные полей{" "}
                  <span className="bg-purple-600 text-white px-1.5 rounded-full text-[10px]">
                    {uniqueFields.length}
                  </span>
                </button>
              )}
              <div className="flex gap-3 text-gray-500">
                <button className="hover:text-gray-700 p-1">
                  <Undo2 size={18} />
                </button>
                <button className="hover:text-gray-700 p-1">
                  <Redo2 size={18} />
                </button>
              </div>
            </div>
          </div>

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
              const sp = product.activeShopProduct;
              const uKey = product.uniqueKey;
              const pId = product.id;

              const priceUnique = isFieldUnique(uKey, "price");
              const markupUnique = isFieldUnique(uKey, "markup");
              const volumeUnique = isFieldUnique(pId, "volume");
              const measureUnique = isFieldUnique(pId, "measure");
              const stockUnique = isFieldUnique(uKey, "stock");

              const displayedPrice = (() => {
                if (priceUnique)
                  return individualOverrides[uKey]?.price ?? sp?.price ?? 0;

                const basePrice =
                  Number(sp?.purchasePrice) || Number(sp?.price) || 0;

                // Считаем потенциальную цену
                const calculated =
                  (changes.markup !== 0
                    ? calculatePrice(basePrice, changes.markup)
                    : Number(sp?.price || 0)) + changes.priceOffset;

                return Math.max(0, calculated);
              })();

              const currentVolume = volumeUnique
                ? (individualOverrides[uKey]?.volume ?? product.weight)
                : changes.volume || product.weight;

              const currentMeasureKey = measureUnique
                ? individualOverrides[uKey]?.measure || product.measure
                : changes.measure || product.measure;

              const currentStock = stockUnique
                ? (individualOverrides[uKey]?.inStock ?? sp?.inStock ?? false)
                : (changes.inStock ?? sp?.inStock ?? false);

              return (
                <div
                  key={uKey}
                  className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1.1fr_1fr] gap-1 items-center px-2"
                >
                  <div className="bg-white border-1 border-gray-200 rounded-md px-4 py-1 text-xs flex flex-col justify-center min-h-[42px]">
                    <div className="truncate font-medium text-gray-800">
                      {product.name}
                    </div>
                    {shopId ? (
                      ""
                    ) : (
                      <div className="text-[9px] text-blue-500 font-bold uppercase truncate">
                        {sp?.shop?.name || "Магазин"}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => toggleFieldUnique(uKey, "price")}
                    className={cn(
                      "rounded-md py-3 border text-xs transition-all cursor-pointer relative flex items-center justify-center gap-1",
                      priceUnique
                        ? "!border-purple-400 text-purple-600 bg-white"
                        : changes.priceOffset !== 0 || changes.markup !== 0
                          ? "border-blue-300 text-blue-500"
                          : "border-gray-200 bg-white"
                    )}
                  >
                    <span>{displayedPrice}</span>
                    <span className="text-[9px] text-gray-400 leading-none">
                      закуп: {sp?.purchasePrice || 0}
                    </span>
                    {priceUnique && (
                      <div className="w-1 h-1 bg-purple-600 rounded-full shrink-0" />
                    )}
                  </div>

                  <div
                    onClick={() => toggleFieldUnique(uKey, "markup")}
                    className={cn(
                      "rounded-md py-3 border text-xs transition-all cursor-pointer relative flex items-center justify-center gap-1",
                      markupUnique
                        ? "!border-purple-400 text-purple-600 bg-white"
                        : changes.markup !== 0
                          ? "border-blue-300 text-blue-500"
                          : "border-gray-200 bg-white"
                    )}
                  >
                    <span>{markupUnique ? "0" : changes.markup}</span>
                    {markupUnique && (
                      <div className="w-1 h-1 bg-purple-600 rounded-full shrink-0" />
                    )}
                  </div>

                  <div
                    onClick={() => toggleFieldUnique(pId, "volume")}
                    className={cn(
                      "rounded-md py-3 border text-xs transition-all cursor-pointer relative flex items-center justify-center gap-1 px-1",
                      volumeUnique
                        ? "!border-purple-400 text-purple-600 bg-white"
                        : changes.volume !== ""
                          ? "border-blue-300 text-blue-500"
                          : "border-gray-200 bg-white"
                    )}
                  >
                    <span>{currentVolume}</span>
                    {volumeUnique && (
                      <div className="w-1 h-1 bg-purple-600 rounded-full shrink-0" />
                    )}
                  </div>

                  <MeasureDropDown
                    product={product}
                    measureUnique={measureUnique}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    toggleFieldUnique={() => toggleFieldUnique(pId, "measure")}
                    changes={changes}
                    displayValue={currentMeasureKey}
                    onMeasureSelect={(val) =>
                      handleIndividualChange(uKey, pId, "measure", val)
                    }
                  />

                  <div
                    className={cn(
                      "flex items-center justify-center gap-1.5 border-1 rounded-md py-3 text-center text-[10px] font-bold uppercase cursor-pointer relative",
                      stockUnique
                        ? "border-purple-400 text-purple-600 bg-white shadow-sm"
                        : currentStock
                          ? "text-gray-500 border-gray-200"
                          : "border-red-100 text-red-400 bg-red-50/50"
                    )}
                    onClick={() => toggleFieldUnique(uKey, "stock")}
                  >
                    <span>{currentStock ? "В наличии" : "Нет в наличии"}</span>
                    {stockUnique && (
                      <div className="w-1 h-1 bg-purple-600 rounded-full shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-[320px] p-6 flex flex-col bg-white rounded-3xl shadow-sm">
          <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-6">
            Групповое <br /> редактирование
          </h2>

          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* СЕКЦИЯ: ЦЕНА (OFFSET) */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase">
                  Цена (+/- к итогу)
                </label>
                <button
                  onClick={() => setChanges((p) => ({ ...p, priceOffset: 0 }))}
                  className="text-[11px] text-gray-400 hover:text-blue-500"
                >
                  Сбросить
                </button>
              </div>
              <div
                className={cn(
                  "flex items-center rounded-2xl p-2 border transition-all gap-1",
                  changes.priceOffset !== 0
                    ? "bg-blue-50 border-blue-400"
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <button
                  className="pl-2 hover:text-red-500 transition-colors"
                  onClick={() =>
                    setChanges((p) => ({
                      ...p,
                      // Логика: не даем уйти в бесконечный минус, если это не имеет смысла
                      priceOffset: p.priceOffset - 5,
                    }))
                  }
                >
                  <Minus size={14} />
                </button>
                <input
                  type="text"
                  readOnly
                  value={
                    changes.priceOffset >= 0
                      ? `+${changes.priceOffset}`
                      : changes.priceOffset
                  }
                  className="w-full bg-transparent text-center text-sm font-bold outline-none"
                />
                <button
                  className="p-2 hover:text-green-500 transition-colors"
                  onClick={() =>
                    setChanges((p) => ({
                      ...p,
                      priceOffset: p.priceOffset + 5,
                    }))
                  }
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* СЕКЦИЯ: НАЦЕНКА (%) */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase">
                  Наценка (%)
                </label>
                <button
                  onClick={() => setChanges((p) => ({ ...p, markup: 0 }))}
                  className="text-[11px] text-gray-400 hover:text-blue-500"
                >
                  Сбросить
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={changes.markup}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    // ВАЛИДАЦИЯ: от 0 до 1000%
                    if (val < 0) val = 0;
                    if (val > 1000) val = 1000;
                    setChanges((p) => ({ ...p, markup: val }));
                  }}
                  className={cn(
                    "w-full rounded-2xl p-4 text-sm border outline-none font-bold transition-all",
                    changes.markup !== 0
                      ? "border-blue-400 text-blue-600 bg-blue-50/20"
                      : "border-gray-200"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">
                  %
                </span>
              </div>
            </div>

            {/* СЕКЦИЯ: ОБЪЕМ */}
            <div>
              <label className="text-[11px] text-gray-400 mb-1.5 block font-bold uppercase">
                Объем
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                step="0.01"
                placeholder="0.00"
                value={changes.volume}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  let val = e.target.value;
                  const numVal = parseFloat(val);

                  if (numVal < 0) return;
                  if (numVal > 9999) {
                    val = "9999";
                  }
                  if (val === "") {
                    setChanges((p) => ({ ...p, volume: "" }));
                    return;
                  }
                  if (Number(val) < 0) return;
                  setChanges((p) => ({ ...p, volume: val }));
                }}
                className={cn(
                  "w-full rounded-2xl p-4 text-sm border outline-none transition-all",
                  changes.volume !== ""
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                )}
              />
            </div>

            {/* ВЫПАДАЮЩИЕ СПИСКИ */}
            <CategoryBaseDropdown
              label="Ед. измерения"
              value={changes.measure}
              options={measureOptions}
              isOpen={openDropdown === "measure"}
              onToggle={() =>
                setOpenDropdown(openDropdown === "measure" ? null : "measure")
              }
              onSelect={(val) => {
                setChanges((p) => ({ ...p, measure: val }));
                setOpenDropdown(null);
              }}
            />

            <CategoryBaseDropdown
              label="Наличие"
              value={
                changes.inStock === null ? "" : changes.inStock ? true : false
              }
              options={[
                { label: "В наличии", value: true },
                { label: "Нет в наличии", value: false },
              ]}
              isOpen={openDropdown === "stock"}
              onToggle={() =>
                setOpenDropdown(openDropdown === "stock" ? null : "stock")
              }
              onSelect={(val) => {
                setChanges((p) => ({ ...p, inStock: val as boolean }));
                setOpenDropdown(null);
              }}
            />
          </div>

          {/* КНОПКИ ДЕЙСТВИЯ */}
          <div className="space-y-3 mt-6">
            <button
              onClick={() => {
                setChanges({
                  priceOffset: 0,
                  markup: 0,
                  volume: "",
                  measure: "",
                  inStock: null,
                });
                setUniqueFields([]);
                setIndividualOverrides({});
              }}
              className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl text-xs hover:bg-gray-200 transition-colors"
            >
              Отменить всё
            </button>
            <button
              disabled={isUpdating}
              onClick={() =>
                saveProducts(
                  selectedProducts,
                  changes,
                  individualOverrides,
                  isFieldUnique
                )
              }
              className={cn(
                "w-full text-white font-bold py-4 rounded-2xl text-xs transition-all shadow-lg active:scale-[0.98]",
                isUpdating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#55CB00] hover:bg-[#4bb300]"
              )}
            >
              {isUpdating ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};