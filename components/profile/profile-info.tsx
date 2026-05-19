"use client";

import { useAuth } from "@/components/hooks/useLogin";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";
import type { AuthProfileBusiness } from "@/types/auth";

const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  shop_owner: "Владелец магазина",
  shop_employee: "Сотрудник магазина",
  operator: "Оператор",
  user: "Пользователь",
};

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

function getShopInitial(name: string): string {
  return name[0]?.toUpperCase() ?? "?";
}

export function ProfileInfo() {
  const { adminData } = useAuth();

  if (!adminData) return null;

  const fullName = `${adminData.firstName ?? ""} ${adminData.lastName ?? ""}`.trim() || "Пользователь";
  const initials = getInitials(adminData.firstName, adminData.lastName);
  const roleLabel = ROLE_LABELS[adminData.role] ?? adminData.role;

  return (
    <div className="flex flex-col gap-5">
      {/* Profile hero — exact copy from OpenDesign .card > .profile-hero */}
      <div className="rounded-3xl border border-[#ECECF3] bg-white shadow-[0_6px_18px_rgba(17,19,34,0.04)]">
        <div className="flex items-center gap-5 p-6">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border-[6px] border-white shadow-[0_10px_28px_rgba(17,19,34,0.10)]"
            style={{ background: "radial-gradient(circle at 30% 22%, #FFFFFF 0 12%, #EAF9E5 45%, #DDF4D6 100%)" }}
          >
            {adminData.photoId ? (
              <Image
                src={getImageUrl({ id: adminData.photoId })}
                alt=""
                width={68}
                height={68}
                className="h-full w-full rounded-[20px] object-cover"
              />
            ) : (
              <span className="text-[26px] font-black tracking-[-0.06em] text-[#55CB00]">
                {initials}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-black tracking-[-0.04em] leading-[1.1] m-0">
              {fullName}
            </h2>
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#EEEEF4] px-2.5 py-[5px] text-[13px] font-bold">
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Contact details — exact copy from OpenDesign .card > .card-header + .card-body > .info-grid */}
      <div className="rounded-3xl border border-[#ECECF3] bg-white shadow-[0_6px_18px_rgba(17,19,34,0.04)]">
        <div className="flex items-center justify-between gap-3 pt-5 px-6">
          <h3 className="text-lg font-black tracking-[-0.03em] m-0">Контактные данные</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Email" value={adminData.email} />
            <InfoRow label="Телефон" value={adminData.phone} />
            <InfoRow
              label="ID"
              value={String(adminData.id)}
              mono
            />
          </div>
        </div>
      </div>

      {/* My shops — exact copy from OpenDesign .shops-grid > .shop-card */}
      {adminData.businesses.length > 0 && (
        <div className="rounded-3xl border border-[#ECECF3] bg-white shadow-[0_6px_18px_rgba(17,19,34,0.04)]">
          <div className="flex items-center justify-between gap-3 pt-5 px-6">
            <h3 className="text-lg font-black tracking-[-0.03em] m-0">Мои магазины</h3>
            <span className="rounded-full bg-[#EEF9E8] px-2.5 py-[5px] text-xs font-bold text-[#23820B]">
              {adminData.businesses.length}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {adminData.businesses.map((b) => (
                <ShopCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-[#ECECF3] bg-[#FAFAFC] p-3.5">
      <span className="text-xs font-bold text-[#7F7F8A]">{label}</span>
      <span
        className={`text-[15px] font-bold leading-[1.3] ${
          mono ? "font-mono text-sm tracking-[-0.02em]" : ""
        } ${!value ? "text-[#9696A0]" : ""}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function ShopCard({ business }: { business: AuthProfileBusiness }) {
  const initial = getShopInitial(business.name);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#ECECF3] bg-[#FAFAFC] p-3.5">
      {business.photoId ? (
        <Image
          src={getImageUrl({ id: business.photoId })}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF9E8] to-[#e0f5d4] text-base font-black text-[#23820B]">
          {initial}
        </div>
      )}
      <div>
        <div className="text-sm font-bold leading-[1.2]">{business.name}</div>
      </div>
    </div>
  );
}
