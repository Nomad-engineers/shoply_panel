"use client";

import * as React from "react";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../hooks/useLogin";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";

export const LoginForm = () => {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      method="post"
      autoComplete="on"
      className="grid gap-6  rounded-[26px] border border-[#ECECF3] bg-white p-[18px] shadow-[0_20px_58px_rgba(17,19,34,0.08)] backdrop-blur-[20px]"
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
          id="login-title"
          className="m-0 text-xl font-bold tracking-tight text-[#0E0F27]"
        >
          Авторизация
        </h1>
      </div>

      {/* Input Fields Frame */}
      <div className="grid gap-3">
        <div>
          <label
            htmlFor="identifier"
            className="mb-1.5 block text-sm font-semibold text-[#0E0F2780]"
          >
            Почта или ID
          </label>
          <Input
            id="identifier"
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="manager@shoply.kz или 42"
            autoComplete="username"
            dir="ltr"
            icon={
              <img
                src="/v2-icons/login-profile-photo.svg"
                alt=""
                className="w-5 h-5"
              />
            }
            iconPosition="right"
            error={!!error}
            className="h-12 rounded-xl border-[#DCDCE6] bg-[#F8F8FA] py-0 pl-4 pr-12 text-sm font-semibold tracking-tight text-[#111322] placeholder:text-[#9696A0] placeholder:font-medium"
            required
          />
        </div>

        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              autoComplete="current-password"
              error={!!error}
              className="h-12 rounded-xl border-[#DCDCE6] bg-[#F8F8FA] py-0 pl-4 pr-12 text-sm font-semibold tracking-tight text-[#111322] placeholder:text-[#9696A0] placeholder:font-medium"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-xl text-[#7F7F8A] hover:bg-[#F5F5F8] hover:text-[#111322] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9747FF] focus-visible:ring-offset-2"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              onClick={() => setShowPassword((value) => !value)}
            >
              <img
                src="/v2-icons/login-password-key.svg"
                alt=""
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p
          className="rounded-xl bg-[#E26D5C]/10 px-3 py-2 text-sm font-semibold text-[#E26D5C]"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Submit Button - Purple from Figma */}
      <Button
        type="submit"
        variant="default"
        size="default"
        className="h-11 w-full rounded-xl border-0 bg-[#9747FF] text-sm font-bold tracking-tight text-white shadow-[0_12px_24px_rgba(151,71,255,0.22)] transition-[transform,box-shadow,filter] hover:-translate-y-px hover:bg-[linear-gradient(145deg,#9747FF,#B874FF)] hover:shadow-[0_16px_30px_rgba(151,71,255,0.25)] hover:saturate-[1.08] active:translate-y-0 active:shadow-[0_8px_16px_rgba(151,71,255,0.2)] disabled:translate-y-0 disabled:opacity-50"
        disabled={loading}
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
    </>
  );
};
