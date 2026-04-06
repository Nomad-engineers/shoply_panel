"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button, Input, Spinner } from "@/components/ui";
import { cn, getImageUrl } from "@/lib/utils";
import { useAdminUsers } from "@/components/hooks/useAdminUsers";
import { usePartners } from "@/components/hooks/usePartners";
import {
  AdminUserSortDirection,
  AdminUserSortField,
  AdminUser,
  BackendUserRole,
  USER_ROLES,
} from "@/types/admin-user";
import { useAuth } from "@/components/hooks/useLogin";
import { toast } from "sonner";

type UserSegment =
  | "all"
  | "shop_team"
  | Exclude<BackendUserRole, "shop_owner" | "shop_employee">;

const roleLabels: Record<UserSegment | BackendUserRole, string> = {
  all: "Все",
  shop_team: "Магазины",
  [USER_ROLES.USER]: "Пользователь",
  [USER_ROLES.DELIVERY_MAN]: "Курьер",
  [USER_ROLES.ADMIN]: "Администратор",
  [USER_ROLES.OPERATOR]: "Оператор",
  [USER_ROLES.SHOP_OWNER]: "Владелец магазина",
  [USER_ROLES.SHOP_EMPLOYEE]: "Сотрудник магазина",
};

const roleBadgeClassNames: Record<BackendUserRole, string> = {
  [USER_ROLES.USER]: "bg-[#f6f6fa] text-[#6f748b]",
  [USER_ROLES.DELIVERY_MAN]: "bg-[#eef8ff] text-[#3977c9]",
  [USER_ROLES.ADMIN]: "bg-[#edf7ec] text-[#4b8f2f]",
  [USER_ROLES.OPERATOR]: "bg-[#fff4e8] text-[#b36a17]",
  [USER_ROLES.SHOP_OWNER]: "bg-[#eef1ff] text-[#5a6fd6]",
  [USER_ROLES.SHOP_EMPLOYEE]: "bg-[#f5efff] text-[#7d58c2]",
};

const segmentRoles: Record<UserSegment, BackendUserRole[] | undefined> = {
  all: undefined,
  [USER_ROLES.USER]: [USER_ROLES.USER],
  [USER_ROLES.DELIVERY_MAN]: [USER_ROLES.DELIVERY_MAN],
  shop_team: [USER_ROLES.SHOP_OWNER, USER_ROLES.SHOP_EMPLOYEE],
  [USER_ROLES.OPERATOR]: [USER_ROLES.OPERATOR],
  [USER_ROLES.ADMIN]: [USER_ROLES.ADMIN],
};

const segmentOrder: UserSegment[] = [
  "all",
  USER_ROLES.USER,
  USER_ROLES.DELIVERY_MAN,
  "shop_team",
  USER_ROLES.OPERATOR,
  USER_ROLES.ADMIN,
];

const createUserRoleOptions: BackendUserRole[] = [
  USER_ROLES.USER,
  USER_ROLES.DELIVERY_MAN,
  USER_ROLES.SHOP_OWNER,
  USER_ROLES.SHOP_EMPLOYEE,
  USER_ROLES.OPERATOR,
  USER_ROLES.ADMIN,
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(firstName: string | null, lastName: string | null, fallback: string) {
  const source = `${firstName ?? ""} ${lastName ?? ""}`.trim() || fallback;

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getFullName(firstName: string | null, lastName: string | null) {
  const value = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return value || "Без имени";
}

function getBusinessLabel(
  business: { id: number; name: string }[],
) {
  if (business.length === 1) {
    return business[0].name;
  }

  return `${business[0].name} +${business.length - 1}`;
}

function isShopRole(role: BackendUserRole) {
  return role === USER_ROLES.SHOP_OWNER || role === USER_ROLES.SHOP_EMPLOYEE;
}

export default function UsersPage() {
  const { fetchWithSession, refreshSession } = useAuth();
  const { partners } = usePartners();
  const [activeSegment, setActiveSegment] = useState<UserSegment>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<AdminUserSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<AdminUserSortDirection>("DESC");
  const [expandedBusinessUserIds, setExpandedBusinessUserIds] = useState<number[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordAccordionOpen, setIsPasswordAccordionOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    role: USER_ROLES.USER as BackendUserRole,
    businessIds: [] as number[],
  });

  const roles = segmentRoles[activeSegment];
  const availableBusinesses = useMemo(
    () =>
      partners.map((partner) => ({
        id: partner.id,
        name: partner.name,
        type: partner.type,
      })),
    [partners],
  );
  const { users, meta, totals, loading, error, refetch } = useAdminUsers({
    page,
    pageSize: 20,
    roles,
    search: searchQuery,
    sortBy: sortField,
    sortDirection,
  });

  useEffect(() => {
    setPage(1);
  }, [activeSegment, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    setExpandedBusinessUserIds([]);
  }, [activeSegment, page, searchQuery]);

  const segmentCounts = useMemo<Record<UserSegment, number>>(
    () => ({
      all: totals.total,
      [USER_ROLES.USER]: totals.user,
      [USER_ROLES.DELIVERY_MAN]: totals.delivery_man,
      shop_team: totals.shop_owner + totals.shop_employee,
      [USER_ROLES.OPERATOR]: totals.operator,
      [USER_ROLES.ADMIN]: totals.admin,
    }),
    [totals],
  );

  const filteredUsers = users;

  const filteredUsersLabel = useMemo(() => {
    const count = meta.total ?? filteredUsers.length;
    const noun =
      count === 1
        ? "пользователь"
        : count >= 2 && count <= 4
          ? "пользователя"
          : "пользователей";

    return `${count} ${noun}`;
  }, [filteredUsers.length, meta.total]);

  const handleSort = (field: AdminUserSortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "ASC" ? "DESC" : "ASC"));
      return;
    }

    setSortField(field);
    setSortDirection("ASC");
  };

  const toggleBusinessExpansion = (userId: number) => {
    setExpandedBusinessUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleCreateUserFieldChange = (
    field: "firstName" | "lastName" | "phone" | "email" | "password",
    value: string,
  ) => {
    setCreateUserForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateUserRoleChange = (role: BackendUserRole) => {
    setCreateUserForm((current) => ({
      ...current,
      role,
      businessIds:
        role === USER_ROLES.SHOP_OWNER || role === USER_ROLES.SHOP_EMPLOYEE
          ? current.businessIds
          : [],
    }));
  };

  const toggleCreateUserBusiness = (businessId: number) => {
    setCreateUserForm((current) => ({
      ...current,
      businessIds: current.businessIds.includes(businessId)
        ? current.businessIds.filter((id) => id !== businessId)
        : [...current.businessIds, businessId],
    }));
  };

  const resetCreateUserForm = () => {
    setCreateUserForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      role: USER_ROLES.USER,
      businessIds: [],
    });
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      password: "",
      confirmPassword: "",
    });
  };

  const openCreateUserModal = () => {
    setEditingUser(null);
    resetCreateUserForm();
    resetPasswordForm();
    setIsPasswordAccordionOpen(false);
    setIsCreateUserOpen(true);
  };

  const openEditUserModal = (user: AdminUser) => {
    setEditingUser(user);
    setCreateUserForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      password: "",
      role: user.role,
      businessIds: user.business.map((item) => item.id),
    });
    resetPasswordForm();
    setIsPasswordAccordionOpen(false);
    setIsCreateUserOpen(true);
  };

  const handleCreateUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingUser(true);

    try {
      const isEditMode = !!editingUser;
      const payload = {
        email: createUserForm.email.trim(),
        role: createUserForm.role,
        firstName: createUserForm.firstName.trim() || undefined,
        lastName: createUserForm.lastName.trim() || undefined,
        phone: createUserForm.phone.trim() || undefined,
        businessIds:
          createUserForm.role === USER_ROLES.SHOP_OWNER ||
          createUserForm.role === USER_ROLES.SHOP_EMPLOYEE
            ? createUserForm.businessIds
            : undefined,
        ...(isEditMode ? {} : { password: createUserForm.password }),
      };

      const res = await fetchWithSession(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/user${editingUser ? `/${editingUser.id}` : ""}`,
        () => localStorage.getItem("access_token"),
        refreshSession,
        {
          method: editingUser ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.message ?? "Не удалось создать пользователя");
      }

      toast.success(editingUser ? "Пользователь обновлен" : "Пользователь создан");
      setIsCreateUserOpen(false);
      setEditingUser(null);
      resetCreateUserForm();
      resetPasswordForm();
      setIsPasswordAccordionOpen(false);
      await refetch();
    } catch (error: any) {
      toast.error(error.message ?? "Не удалось создать пользователя");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetchWithSession(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/user/${editingUser.id}/password`,
        () => localStorage.getItem("access_token"),
        refreshSession,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: passwordForm.password,
          }),
        },
      );

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.message ?? "Не удалось обновить пароль");
      }

      toast.success("Пароль обновлен");
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.message ?? "Не удалось обновить пароль");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const renderSortHeader = (label: string, field: AdminUserSortField) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
    >
      {label}
      {sortField === field && (
        <svg
          viewBox="0 0 12 12"
          className={cn(
            "h-3 w-3 transition-transform",
            sortDirection === "ASC" && "rotate-180",
          )}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );

  const header = (
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Пользователи
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        {segmentOrder.map((segment) => {
          const isActive = segment === activeSegment;

          return (
            <button
              key={segment}
              type="button"
              onClick={() => setActiveSegment(segment)}
              className={cn(
                "inline-flex items-center gap-1.5 px-0 text-[20px] font-semibold leading-none transition-colors",
                isActive ? "text-text-primary" : "text-[#23263a] hover:text-text-primary",
              )}
            >
              <span
                className={cn(
                  "relative inline-flex items-center",
                  isActive &&
                    "after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']",
                )}
              >
                {roleLabels[segment]}
              </span>
              <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e5e6ee] px-1.5 text-[12px] font-semibold leading-none text-[#9a9dab]">
                {segmentCounts[segment]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
            <form onSubmit={handleSearchSubmit} className="w-[280px]">
              <label className="relative block">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Поиск по имени, телефону, email или ID"
                  className="h-[32px] w-full border-0 border-b border-[#09091d40] bg-transparent pl-0 pr-8 text-[14px] text-text-primary outline-none transition-colors placeholder:text-[#8e90a0] focus:border-[#55CB00]"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                  aria-label="Искать пользователей"
                >
                  <Search className="h-4 w-4" />
                </button>
              </label>
            </form>

            <button
              type="button"
              onClick={openCreateUserModal}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#55CB00] px-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#4abb00]"
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить пользователя
            </button>
          </div>

          <div className="flex-1 overflow-x-auto px-3 pb-2">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[14px] text-text-secondary">
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("ID", "id")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Пользователь", "firstName")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Телефон", "phone")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Email", "email")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Роль", "role")}
                  </th>
                  <th className="border-b border-border px-3 py-3 font-medium">
                    {renderSortHeader("Регистрация", "createdAt")}
                  </th>
                  <th className="border-b border-border px-3 py-3" />
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-[#fafafe]">
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {user.id}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] font-medium text-text-primary">
                      <div className="inline-flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f5fb] text-[13px] font-semibold text-[#5b6280]">
                          {user.photoId ? (
                            <Image
                              src={getImageUrl(
                                { id: user.photoId },
                                { width: 80, height: 80, fit: "cover" },
                              )}
                              alt={getFullName(user.firstName, user.lastName)}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.firstName, user.lastName, String(user.id))
                          )}
                        </span>
                        <span className="flex flex-col">
                          <span>{getFullName(user.firstName, user.lastName)}</span>
                          {isShopRole(user.role) && user.business.length > 0 && (
                            <span className="flex items-start gap-2 text-[13px] font-normal text-text-secondary">
                              <span className="flex flex-col">
                                {(expandedBusinessUserIds.includes(user.id)
                                  ? user.business
                                  : user.business.slice(0, 2)
                                ).map((businessItem) => (
                                  <span key={businessItem.id}>{businessItem.name}</span>
                                ))}
                              </span>

                              {user.business.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => toggleBusinessExpansion(user.id)}
                                  className="mt-[1px] inline-flex h-5 w-5 items-center justify-center rounded-full text-[#9a9dab] transition-colors hover:bg-[#f3f5fb] hover:text-text-primary"
                                  aria-label={
                                    expandedBusinessUserIds.includes(user.id)
                                      ? "Свернуть список бизнесов"
                                      : "Раскрыть список бизнесов"
                                  }
                                >
                                  <ChevronDown
                                    className={cn(
                                      "h-3.5 w-3.5 transition-transform",
                                      expandedBusinessUserIds.includes(user.id) && "rotate-180",
                                    )}
                                  />
                                </button>
                              )}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {user.phone ?? "—"}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {user.email ?? "—"}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-primary">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-medium",
                          roleBadgeClassNames[user.role],
                        )}
                      >
                        {user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SHOP_OWNER ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <UserRound className="h-3.5 w-3.5" />
                        )}
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="border-b border-border px-3 py-3 text-[16px] text-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditUserModal(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#b9bbc6] transition-colors hover:bg-[#f3f5fb] hover:text-text-primary"
                        aria-label={`Редактировать ${getFullName(user.firstName, user.lastName)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
              <Spinner size={32} />
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-sm text-[#E26D5C]">
              {error}
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center px-6 py-16 text-sm text-text-secondary">
              По текущим фильтрам пользователи не найдены.
            </div>
          )}

          {!loading && !error && meta.pageCount > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-text-secondary">
              <span>{filteredUsersLabel}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={meta.page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </button>
                <span>
                  {meta.page} из {meta.pageCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(meta.pageCount || 1, current + 1))
                  }
                  disabled={meta.page >= meta.pageCount}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Вперед
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && !error && meta.pageCount <= 1 && filteredUsers.length > 0 && (
            <div className="px-6 py-4 text-center text-xs text-[#b7b8c5]">{filteredUsersLabel}</div>
          )}
        </div>
      </section>

      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101322]/45 px-4 py-8">
          <div className="w-full max-w-[720px] rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[#111322]">
                  {editingUser ? "Редактировать пользователя" : "Добавить пользователя"}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {editingUser
                    ? "Обновите данные пользователя и сохраните изменения."
                    : "Создайте нового пользователя и при необходимости сразу привяжите business."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateUserOpen(false);
                  setEditingUser(null);
                  resetCreateUserForm();
                  resetPasswordForm();
                  setIsPasswordAccordionOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8e90a0] transition-colors hover:bg-[#f3f5fb] hover:text-text-primary"
                aria-label="Закрыть модальное окно"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Email *</label>
                  <Input
                    value={createUserForm.email}
                    onChange={(event) =>
                      handleCreateUserFieldChange("email", event.target.value)
                    }
                    placeholder="name@shoply.kz"
                    type="email"
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Пароль *</label>
                    <Input
                      value={createUserForm.password}
                      onChange={(event) =>
                        handleCreateUserFieldChange("password", event.target.value)
                      }
                      placeholder="Минимум 6 символов"
                      type="password"
                      minLength={6}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Имя</label>
                  <Input
                    value={createUserForm.firstName}
                    onChange={(event) =>
                      handleCreateUserFieldChange("firstName", event.target.value)
                    }
                    placeholder="Например, Арман"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Фамилия</label>
                  <Input
                    value={createUserForm.lastName}
                    onChange={(event) =>
                      handleCreateUserFieldChange("lastName", event.target.value)
                    }
                    placeholder="Например, Ибраев"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Телефон</label>
                  <Input
                    value={createUserForm.phone}
                    onChange={(event) =>
                      handleCreateUserFieldChange("phone", event.target.value)
                    }
                    placeholder="+7 700 000 00 00"
                  />
                </div>

              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Роль</h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Для магазинных ролей ниже можно выбрать один или несколько business.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {createUserRoleOptions.map((role) => {
                    const isActive = createUserForm.role === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleCreateUserRoleChange(role)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "border-[#55CB00] bg-[#f3f8ec] text-text-primary"
                            : "border-border bg-white text-text-secondary hover:border-[#cfd3df] hover:text-text-primary",
                        )}
                      >
                        {roleLabels[role]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(createUserForm.role === USER_ROLES.SHOP_OWNER ||
                createUserForm.role === USER_ROLES.SHOP_EMPLOYEE) && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">Business</h3>
                    <p className="mt-1 text-xs text-text-secondary">
                      Можно выбрать несколько business для магазинной роли.
                    </p>
                  </div>

                  <div className="max-h-[220px] space-y-2 overflow-auto rounded-2xl border border-border bg-[#fbfcfe] p-2">
                    {availableBusinesses.map((business) => {
                      const isSelected = createUserForm.businessIds.includes(business.id);

                      return (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() => toggleCreateUserBusiness(business.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "bg-[#eef7e8] text-text-primary"
                              : "bg-white text-text-primary hover:bg-[#f3f5fb]",
                          )}
                        >
                          <span className="flex flex-col">
                            <span className="text-sm font-medium">{business.name}</span>
                            <span className="text-xs text-text-secondary">{business.type}</span>
                          </span>
                          <span
                            className={cn(
                              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                              isSelected
                                ? "bg-[#55CB00] text-white"
                                : "bg-[#e8eaf2] text-[#8e90a0]",
                            )}
                          >
                            {isSelected ? "OK" : business.id}
                          </span>
                        </button>
                      );
                    })}

                    {availableBusinesses.length === 0 && (
                      <div className="rounded-2xl bg-white px-4 py-5 text-sm text-text-secondary">
                        Нет доступных business для выбора.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {editingUser && (
                <div className="overflow-hidden rounded-[24px] border border-border bg-[#fbfcfe]">
                  <button
                    type="button"
                    onClick={() => setIsPasswordAccordionOpen((current) => !current)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#f6f8fc]"
                    aria-expanded={isPasswordAccordionOpen}
                  >
                    <span className="pr-4 text-sm font-medium text-text-primary">
                      Сменить пароль
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[#8e90a0] transition-transform",
                        isPasswordAccordionOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isPasswordAccordionOpen && (
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="grid gap-4 border-t border-border px-5 py-5 md:grid-cols-2"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Новый пароль</label>
                        <Input
                          value={passwordForm.password}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          type="password"
                          minLength={6}
                          placeholder="Минимум 6 символов"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Повторите пароль</label>
                        <Input
                          value={passwordForm.confirmPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              confirmPassword: event.target.value,
                            }))
                          }
                          type="password"
                          minLength={6}
                          placeholder="Повторите пароль"
                          required
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" variant="outline" disabled={isUpdatingPassword}>
                          {isUpdatingPassword ? "Сохранение пароля..." : "Сменить пароль"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreatingUser}
                    onClick={() => {
                      setIsCreateUserOpen(false);
                      setEditingUser(null);
                      resetCreateUserForm();
                      resetPasswordForm();
                      setIsPasswordAccordionOpen(false);
                    }}
                  className="border-border bg-white text-text-primary hover:bg-[#f7f7fa]"
                >
                  Отмена
                </Button>
                <Button type="submit" variant="success" disabled={isCreatingUser}>
                  {isCreatingUser
                    ? editingUser
                      ? "Сохранение..."
                      : "Создание..."
                    : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
