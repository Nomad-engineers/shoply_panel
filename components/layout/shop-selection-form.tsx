"use client";

import * as React from "react";
import { useState } from "react";

import { useAuth } from "../hooks/useLogin";
import { Button } from "../ui/button";
import { Radio } from "../ui/radio";
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
        <Image src="/v2-icons/v2-logo.svg" height={50} width={50} alt="logo" />
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
        <h1
          id="shop-selection-title"
          className="m-0 text-xl font-bold tracking-tight text-[#0E0F27]"
        >
          Добро пожаловать, {userName}!
        </h1>
        <button
          type="button"
          onClick={logout}
          className="m-0 mt-2 bg-transparent border-none cursor-pointer text-sm text-[#DC2626] hover:text-[#B91C1C] transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Shop Selection */}
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-[#0E0F2780]">
          Выберите магазин
        </p>
        <div className="grid gap-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between w-full h-12 rounded-xl border border-[#DCDCE6] bg-[#F8F8FA] px-4 hover:border-[#9747FF]/30 transition-colors"
            >
              <span className="text-sm font-semibold tracking-tight text-[#111322]">
                {shop.name}
              </span>
              <Radio
                name="shop"
                value={shop.id}
                checked={selectedShopId === shop.id}
                onChange={() => setSelectedShopId(shop.id)}
                className="h-5 w-5 accent-[#9747FF]"
              />
            </div>
          ))}
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
