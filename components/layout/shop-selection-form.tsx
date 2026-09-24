"use client";

import * as React from "react";
import { useState } from "react";

import { useAuth } from "../hooks/useLogin";
import { Button } from "../ui/button";
import { Radio } from "../ui/radio";
import { cn } from "@/lib/theme";
import Image from "next/image";
import type { AuthProfileBusiness } from "@/types/auth";

interface ShopSelectionFormProps {
  shops: AuthProfileBusiness[];
  userName: string;
}

export const ShopSelectionForm = ({ shops, userName }: ShopSelectionFormProps) => {
  const { setCurrentShopId, currentShopId, loading, completeShopSelection, logout } = useAuth();
  const [selectedShopId, setSelectedShopId] = useState<number | null>(currentShopId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShopId) {
      return;
    }

    // Set the selected shop
    setCurrentShopId(selectedShopId);

    // Complete the shop selection and redirect
    completeShopSelection();
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="post"
      autoComplete="off"
      className="grid gap-6 rounded-[26px] border border-[#ECECF3] bg-white p-[18px] shadow-[0_20px_58px_rgba(17,19,34,0.08)] backdrop-blur-[20px]"
    >
      {/* Logo */}
      <div className="flex gap-3">
        <Image src="/v2-files/v2-logo.svg" height={50} width={50} alt="logo" />
        <div className="flex flex-col">
          <p className="m-0 text-sm font-extrabold tracking-tight text-[#0E0F27]">
            SHOPLY
          </p>
          <p className="m-0 text-2xl font-extrabold tracking-tight text-[#0E0F27]">
            PANEL
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <p className="m-0 text-lg font-medium tracking-tight text-[#0E0F27]">
          Добро пожаловать
        </p>
        <h1
          id="shop-selection-title"
          className="m-0 mt-1 text-[28px] font-extrabold tracking-tight text-[#0E0F27]"
        >
          {userName}
        </h1>
        <button
          type="button"
          onClick={logout}
          className="m-0 mt-2 bg-transparent border-none cursor-pointer p-0 text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Shop Selection */}
      <div className="grid gap-3">
        <p className="text-sm font-medium text-[#0E0F2780]">
          Выберите магазин
        </p>
        <div className="grid gap-3">
          {shops.map((shop) => {
            const isSelected = selectedShopId === shop.id;

            return (
              <label
                key={shop.id}
                htmlFor={`shop-option-${shop.id}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between w-full h-12 rounded-xl border bg-white px-4 transition-colors",
                  isSelected
                    ? "border-[#22C55E]"
                    : "border-[#DCDCE6] hover:border-[#9747FF]/30"
                )}
              >
                <span className="text-sm font-medium tracking-tight text-[#111322]">
                  {shop.name}
                </span>
                <Radio
                  id={`shop-option-${shop.id}`}
                  name="shop"
                  value={shop.id}
                  checked={isSelected}
                  onChange={() => setSelectedShopId(shop.id)}
                  className={cn(
                    "h-5 w-5 appearance-none rounded-full border-2 bg-white transition-all",
                    isSelected
                      ? "border-[#22C55E] bg-[#22C55E] ring-2 ring-[#22C55E] ring-offset-2"
                      : "border-[#C9C9D4] hover:border-[#22C55E]/50"
                  )}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="default"
        className="h-11 w-full rounded-xl border-0 bg-[#9747FF] text-sm font-bold tracking-tight text-white shadow-[0_12px_24px_rgba(151,71,255,0.22)] transition-[transform,box-shadow,filter] hover:-translate-y-px hover:bg-[linear-gradient(145deg,#9747FF,#B874FF)] hover:shadow-[0_16px_30px_rgba(151,71,255,0.25)] hover:saturate-[1.08] active:translate-y-0 active:shadow-[0_8px_16px_rgba(151,71,255,0.2)] disabled:translate-y-0 disabled:opacity-50"
        disabled={!selectedShopId || loading}
      >
        {loading ? "Вход..." : "Войти"}
      </Button>

      <div>
        <p className="text-[#5BAF1F]">support@mail.ru</p>
        <p className="text-[#0E0F2780]">
          Почта для обращения в службу поддержки
        </p>
      </div>
    </form>
  );
};
