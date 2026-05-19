"use client";

import { DashboardLayout } from "@/components/layout";
import { ProfileInfo } from "./profile-info";
import { PasswordForm } from "./password-form";

export function ProfilePageContent() {
  return (
    <DashboardLayout mainClassName="border border-[#ECECF3] bg-[rgba(255,255,255,0.66)] shadow-[0_16px_50px_rgba(17,19,34,0.05)]">
      <div className="flex h-full flex-1 flex-col">
        {/* Topbar */}
        <div className="flex shrink-0 items-center justify-between bg-white border-b border-[#ECECF3] min-h-[72px] px-6 py-[18px]">
          <div>
            <h1 className="text-[28px] font-black tracking-[-0.04em] leading-none m-0">
              Мой профиль
            </h1>
            <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-[#7F7F8A]">
              <span>Настройки</span>
              <span>·</span>
              <span>Аккаунт</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
            <ProfileInfo />
            <PasswordForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
