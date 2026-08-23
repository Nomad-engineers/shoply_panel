"use client";

import React from "react";
import { LoginForm } from "@/components/layout/login-form";
import { ShopSelectionForm } from "@/components/layout/shop-selection-form";
import Image from "next/image";
import { useAuth } from "@/components/hooks/useLogin";

const LoginPage: React.FC = () => {
  const { adminData, pendingShopSelection } = useAuth();

  // Get user's display name (firstName or email as fallback)
  const getDisplayName = () => {
    if (!adminData) return "";
    if (adminData.firstName) {
      return adminData.lastName ? `${adminData.firstName} ${adminData.lastName}` : adminData.firstName;
    }
    return adminData.email || "";
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#EDECF5] p-8 max-[560px]:p-[18px]">
      <section
        className="w-full max-w-[480px]"
        aria-labelledby={pendingShopSelection ? "shop-selection-title" : "login-title"}
      >
        {pendingShopSelection && adminData ? (
          <ShopSelectionForm
            shops={adminData.businesses}
            userName={getDisplayName()}
          />
        ) : (
          <LoginForm />
        )}
        <div className="flex flex-col justify-center mt-6">
          <Image src={"/v2-files/v2-logo-adt.svg"} width={90} height={90} alt="additional logo"/>
          <p className="text-[#0E0F2780] text-xs mt-2">Все авторские права защищены</p>
          <p className="text-[#0E0F2780] text-xs">2024-2026 ©</p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;