"use client";

import React from "react";
import { LoginForm } from "@/components/layout/login-form";

const LoginPage: React.FC = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_18%,rgba(85,203,0,0.13),transparent_26%),radial-gradient(circle_at_18%_78%,rgba(85,203,0,0.08),transparent_24%),#EFEFF4] p-8 max-[560px]:p-[18px]">
      <section
        className="w-full max-w-[468px] rounded-[28px] border border-[#ECECF3]/[0.92] bg-white/[0.94] p-9 shadow-[0_20px_58px_rgba(17,19,34,0.08)] backdrop-blur-[20px] max-[560px]:rounded-[24px] max-[560px]:px-[22px] max-[560px]:py-7"
        aria-labelledby="login-title"
      >
        <LoginForm />
      </section>
    </main>
  );
};

export default LoginPage;
