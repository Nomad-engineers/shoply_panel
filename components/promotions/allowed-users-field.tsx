"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";

import { useAdminUsers } from "@/components/hooks/useAdminUsers";
import { Input, Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import type { AdminUser } from "@/types/admin-user";

export interface AllowedUserOption {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  photoId?: string | null;
}

interface AllowedUsersFieldProps {
  value: AllowedUserOption[];
  onChange: (users: AllowedUserOption[]) => void;
}

const getFullName = (user: Pick<AllowedUserOption, "firstName" | "lastName">) => {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || "Без имени";
};

const getSubtitle = (user: Pick<AllowedUserOption, "phone" | "email">) => {
  return user.phone || user.email || "Без контакта";
};

const mapUser = (user: AdminUser): AllowedUserOption => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  email: user.email,
  photoId: user.photoId,
});

const matchesSearch = (user: AdminUser, search: string) => {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim().toLowerCase();
  const reversedFullName = `${user.lastName ?? ""} ${user.firstName ?? ""}`.trim().toLowerCase();

  return (
    fullName.includes(normalizedSearch) ||
    reversedFullName.includes(normalizedSearch) ||
    (user.firstName ?? "").toLowerCase().includes(normalizedSearch) ||
    (user.lastName ?? "").toLowerCase().includes(normalizedSearch) ||
    (user.email ?? "").toLowerCase().includes(normalizedSearch)
  );
};

export function AllowedUsersField({
  value,
  onChange,
}: AllowedUsersFieldProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 900);

    return () => clearTimeout(timer);
  }, [search]);

  const { users, loading, error } = useAdminUsers({
    page: 1,
    pageSize: 20,
    search: debouncedSearch,
    sortBy: "firstName",
    sortDirection: "ASC",
    skip: debouncedSearch.length < 2,
  });

  const selectedIds = useMemo(() => new Set(value.map((user) => user.id)), [value]);

  const options = useMemo(
    () =>
      users
        .filter((user) => !selectedIds.has(user.id))
        .filter((user) => matchesSearch(user, debouncedSearch))
        .map(mapUser),
    [debouncedSearch, selectedIds, users],
  );

  const handleAddUser = (user: AllowedUserOption) => {
    onChange([...value, user]);
    setSearch("");
    setDebouncedSearch("");
  };

  const handleRemoveUser = (userId: number) => {
    onChange(value.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-4 rounded-[20px] border border-[#DCDCE6] bg-[#FBFBFD] p-4">
      <div className="space-y-1">
        <div className="text-[16px] font-semibold text-[#111111]">
          Доступные пользователи
        </div>
        <div className="text-[14px] text-[#8E8E93]">
          Промокод сможет активировать только выбранный user.
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E93]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по firstname, lastname или email"
            className="h-[46px] rounded-xl border-none bg-white pl-11 pr-4 font-medium"
          />
        </div>

        {search.trim().length > 0 && search.trim().length < 2 && (
          <div className="text-[13px] text-[#8E8E93]">
            Введите минимум 2 символа для поиска.
          </div>
        )}

        {debouncedSearch.length >= 2 && (
          <div className="rounded-xl border border-[#ECECF3] bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-4 text-[#8E8E93]">
                <Spinner size={18} />
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-[13px] text-red-600">{error}</div>
            ) : options.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#8E8E93]">
                Ничего не найдено.
              </div>
            ) : (
              options.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAddUser(user)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F6F6FA]",
                    index !== options.length - 1 && "border-b border-[#F1F1F5]",
                  )}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-[#111111]">
                      {getFullName(user)}
                    </div>
                    <div className="truncate text-[13px] text-[#8E8E93]">
                      {getSubtitle(user)}
                    </div>
                  </div>
                  <UserPlus className="h-4 w-4 shrink-0 text-[#5AC800]" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {value.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DCDCE6] bg-white px-4 py-3 text-[14px] text-[#8E8E93]">
            Пока не выбрано ни одного пользователя.
          </div>
        ) : (
          value.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-[#111111]">
                  {getFullName(user)}
                </div>
                <div className="truncate text-[13px] text-[#8E8E93]">
                  {getSubtitle(user)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F6FA] text-[#8E8E93] transition-colors hover:bg-[#ECECF3] hover:text-[#111111]"
                aria-label={`Удалить пользователя ${getFullName(user)}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
