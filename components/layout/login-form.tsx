"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ redirectTo = "/reports" }) => {
  const router = useRouter();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [error, setError] = React.useState("");
  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      localStorage.setItem('access_token',data.data.access_token)
      if (!res.ok) {
        setError(data.errors?.[0]?.message || "Неверный логин или пароль");
        return;
      }

      router.push(redirectTo);
    } catch {
      setError("Ошибка при входе. Попробуйте позже.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
          placeholder="Введите email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Пароль</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
          placeholder="Введите пароль"
          required
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Войти
      </button>
    </form>
  );
};
