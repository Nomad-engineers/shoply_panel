"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category.types";

interface CategorySubcategorySelectorProps {
  categories: Category[];
  categoryId: number;
  subCategoryId: number;
  onCategorySelect: (categoryId: number) => void;
  onSubCategorySelect: (subCategoryId: number) => void;
  disabled?: boolean;
}

export const CategorySubcategorySelector = ({
  categories,
  categoryId,
  subCategoryId,
  onCategorySelect,
  onSubCategorySelect,
  disabled = false,
}: CategorySubcategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(categoryId);
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return categories;

    return categories.filter((category) => {
      const categoryMatches = category.name.toLowerCase().includes(normalizedSearch);
      const hasMatchingSubCategory = (category.subCategory || []).some((subCategory) =>
        subCategory.name.toLowerCase().includes(normalizedSearch)
      );

      return categoryMatches || hasMatchingSubCategory;
    });
  }, [categories, normalizedSearch]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId]
  );

  const selectedSubCategory = useMemo(() => {
    for (const category of categories) {
      const foundSubCategory = category.subCategory?.find(
        (subCategory) => subCategory.id === subCategoryId
      );

      if (foundSubCategory) return foundSubCategory;
    }

    return undefined;
  }, [categories, subCategoryId]);

  const activeCategory = useMemo(
    () =>
      filteredCategories.find((category) => category.id === activeCategoryId) ||
      selectedCategory ||
      filteredCategories[0],
    [activeCategoryId, filteredCategories, selectedCategory]
  );

  const visibleSubCategories = useMemo(() => {
    const items = activeCategory?.subCategory || [];

    if (!normalizedSearch || !activeCategory) return items;

    const categoryMatches = activeCategory.name
      .toLowerCase()
      .includes(normalizedSearch);

    if (categoryMatches) return items;

    return items.filter((subCategory) =>
      subCategory.name.toLowerCase().includes(normalizedSearch)
    );
  }, [activeCategory, normalizedSearch]);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch("");
  };

  const toggleDropdown = () => {
    if (disabled) return;

    setIsOpen((prev) => {
      if (prev) {
        setSearch("");
      }

      return !prev;
    });
  };

  useEffect(() => {
    if (!disabled) return;

    setIsOpen(false);
    setSearch("");
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveCategoryId(categoryId || categories[0]?.id || 0);
  }, [isOpen, categoryId, categories]);

  useEffect(() => {
    if (!isOpen) return;

    if (!filteredCategories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(filteredCategories[0]?.id || 0);
    }
  }, [activeCategoryId, filteredCategories, isOpen]);

  const handleSelect = (nextCategoryId: number, nextSubCategoryId: number) => {
    onCategorySelect(nextCategoryId);
    onSubCategorySelect(nextSubCategoryId);
    closeDropdown();
  };

  return (
    <div className="relative">
      <label className="text-xs text-gray-400 mb-1.5 block mt-3 uppercase font-bold">
        Подкатегория
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={cn(
          "w-full rounded-2xl p-4 text-sm border flex justify-between items-center transition-all outline-none",
          disabled
            ? "border-gray-100 bg-gray-50/50 cursor-not-allowed"
            : selectedSubCategory
              ? "border-blue-400 bg-blue-50/20"
              : "border-gray-100 bg-gray-50 hover:border-gray-200"
        )}
      >
        <span
          className={cn(
            "font-bold",
            selectedSubCategory ? "text-gray-600" : "text-gray-400"
          )}
        >
          {selectedSubCategory?.name || "Выберите подкатегорию"}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            disabled ? "text-gray-200" : "text-gray-400",
            isOpen && !disabled && "rotate-180"
          )}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeDropdown} />
          <div className="absolute top-full left-0 mt-2 w-[560px] max-w-[calc(100vw-4rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по категориям и подкатегориям"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-blue-300 focus:bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-[220px_minmax(0,1fr)]">
              <div className="bg-gray-50/70 border-r border-gray-100">
                <div className="px-4 py-3 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100">
                  Категории
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategoryId(category.id)}
                        onMouseEnter={() => setActiveCategoryId(category.id)}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm transition-colors border-b border-gray-100 last:border-b-0",
                          activeCategory?.id === category.id
                            ? "bg-white text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-white"
                        )}
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      Ничего не найдено
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="px-4 py-3 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100">
                  Подкатегории
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {visibleSubCategories.length > 0 ? (
                    visibleSubCategories.map((subCategory) => (
                      <button
                        key={subCategory.id}
                        type="button"
                        onClick={() =>
                          handleSelect(activeCategory.id, subCategory.id)
                        }
                        className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors border-b border-gray-50 last:border-none"
                      >
                        <span className="font-medium text-gray-700">
                          {subCategory.name}
                        </span>
                        {subCategory.id === subCategoryId && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      {activeCategory
                        ? "В этой категории нет подходящих подкатегорий"
                        : "Сначала выберите категорию"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
