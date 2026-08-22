"use client";

import React from "react";
import { LoginForm } from "@/components/layout/login-form";
import Image from "next/image";

const LoginPage: React.FC = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-[#EDECF5] p-8 max-[560px]:p-[18px]">
      <section
        className="w-full max-w-[480px]"
        aria-labelledby="login-title"
      >
        <LoginForm />
        <div className="flex flex-col justify-center mt-6">
          <Image src={"/v2-icons/v2-logo-adt.svg"} width={90} height={90} alt="additional logo"/>
          <p className="text-[#0E0F2780] text-xs mt-2">Все авторские права защищены</p>
          <p className="text-[#0E0F2780] text-xs">2024-2026 ©</p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
