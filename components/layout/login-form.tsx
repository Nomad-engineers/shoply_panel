"use client";
import * as React from "react";
import { useAuth } from "../hooks/useLogin";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const LoginForm = () => {
  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const { login, loading, error } = useAuth(url);
  const [form, setForm] = React.useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Введите email"
          error={!!error}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Пароль</label>
        <Input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Введите пароль"
          error={!!error}
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      <Button
        type="submit"
        variant="success"     
        size="default"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
};
