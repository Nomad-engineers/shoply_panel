"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/hooks/useLogin";
import { toast } from "sonner";

function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_CONFIG: Record<number, { label: string; color: string; barClass: string }> = {
  1: { label: "Слабый", color: "text-[#E26D5C]", barClass: "bg-[#E26D5C]" },
  2: { label: "Средний", color: "text-[#A86700]", barClass: "bg-[#F59E0B]" },
  3: { label: "Хороший", color: "text-[#23820B]", barClass: "bg-[#55CB00]" },
  4: { label: "Надёжный", color: "text-[#23820B]", barClass: "bg-[#55CB00]" },
};

export function PasswordForm() {
  const { fetchWithSession, refreshSession } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mismatchError, setMismatchError] = useState(false);

  const strength = newPassword.length > 0 ? getStrength(newPassword) : 0;
  const strengthCfg = strength > 0 ? STRENGTH_CONFIG[strength] : null;

  const canSubmit =
    !isSubmitting &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    currentPassword.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword !== confirmPassword) {
      setMismatchError(true);
      return;
    }
    if (newPassword.length < 8 || !currentPassword) return;

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetchWithSession(
        `${apiUrl}/v2/profile/password`,
        () => localStorage.getItem("access_token"),
        refreshSession,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (res.status === 401) {
        toast.error("Неверный текущий пароль");
        return;
      }
      if (!res.ok) {
        toast.error("Ошибка при смене пароля");
        return;
      }

      toast.success("Пароль успешно обновлён");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Ошибка при смене пароля");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#ECECF3] bg-white shadow-[0_6px_18px_rgba(17,19,34,0.04)]">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <h3 className="text-lg font-black tracking-[-0.03em]">Сменить пароль</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <Field
          label="Текущий пароль"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          placeholder="Введите текущий пароль"
          autoComplete="current-password"
        />

        <div>
          <Field
            label="Новый пароль"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              if (confirmPassword && v !== confirmPassword) setMismatchError(true);
              else setMismatchError(false);
            }}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
          />
          {/* Strength meter */}
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-sm transition-colors duration-200 ${
                  i < strength && strengthCfg ? strengthCfg.barClass : "bg-[#ECECF3]"
                }`}
              />
            ))}
          </div>
          {strengthCfg && (
            <p className={`mt-1 text-xs font-bold ${strengthCfg.color}`}>
              {strengthCfg.label}
            </p>
          )}
        </div>

        <Field
          label="Подтвердите пароль"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            if (newPassword && v !== newPassword) setMismatchError(true);
            else setMismatchError(false);
          }}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
          placeholder="Повторите новый пароль"
          autoComplete="new-password"
          error={mismatchError}
          errorText="Пароли не совпадают"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-br from-[#55CB00] to-[#67C63C] text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_12px_24px_rgba(85,203,0,0.22)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_16px_30px_rgba(85,203,0,0.25)] disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Сохранение..." : "Сохранить пароль"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
  error,
  errorText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
  error?: boolean;
  errorText?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-[#17171C]">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`h-[50px] w-full rounded-[14px] border bg-[#FAFAFC] px-4 pr-12 text-[15px] font-semibold tracking-[-0.01em] text-[#111322] outline-none transition-all duration-150 placeholder:text-[#9696A0] placeholder:font-medium focus:border-[#55CB00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(85,203,0,0.13)] ${
            error ? "border-[#E26D5C] shadow-[0_0_0_4px_rgba(226,109,92,0.10)]" : "border-[#ECECF3]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[10px] text-[#7F7F8A] transition-colors hover:bg-[#F5F5F8] hover:text-[#111322]"
        >
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {error && errorText && (
        <p className="text-xs font-bold text-[#E26D5C]">{errorText}</p>
      )}
    </div>
  );
}
