"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SelectListModal } from "@/components/promotions/select-list-modal";
import { useAdminUsers } from "@/components/hooks/useAdminUsers";
import { MarketingCopyIcon } from "@/components/icons/marketing-icons";
import { formatPhone } from "@/lib/phone";
import type { AllowedUserOption } from "@/components/promotions/allowed-users-field";
import type { AdminUser } from "@/types/admin-user";

interface SelectUsersModalProps {
  open: boolean;
  selected: AllowedUserOption[];
  onConfirm: (users: AllowedUserOption[]) => void;
  onClose: () => void;
}

const getFullName = (user: Pick<AllowedUserOption, "firstName" | "lastName">) => {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || "Без имени";
};

const mapUser = (user: AdminUser): AllowedUserOption => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  email: user.email,
  photoId: user.photoId,
});

export const SelectUsersModal = ({
  open,
  selected,
  onConfirm,
  onClose,
}: SelectUsersModalProps) => {
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    Map<number, AllowedUserOption>
  >(new Map());

  useEffect(() => {
    if (open) {
      setSelectedUsers(new Map(selected.map((user) => [user.id, user])));
    }
  }, [open]);

  const {
    users,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useAdminUsers({
    page: 1,
    pageSize: 20,
    search: userSearch,
    sortBy: "firstName",
    sortDirection: "ASC",
    skip: !open,
  });

  const toggleUser = (rawUser: AdminUser) => {
    const user = mapUser(rawUser);
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) {
        next.delete(user.id);
      } else {
        next.set(user.id, user);
      }
      return next;
    });
  };

  const copyPhone = (phone: string | null) => {
    if (!phone) return;
    navigator.clipboard.writeText(formatPhone(phone));
    toast.success("Номер скопирован");
  };

  return (
    <SelectListModal<AdminUser>
      open={open}
      title="Выберите пользователя"
      searchLabel="Поиск пользователя"
      searchPlaceholder="Имя, номер телефона, ID или почту"
      infoColumnLabel="Информация"
      metaColumnLabel="Номер телефона"
      emptyText="Пользователи не найдены"
      items={users}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      error={error}
      selectedIds={new Set(selectedUsers.keys())}
      onSearchChange={setUserSearch}
      onToggle={toggleUser}
      renderTitle={(user) => getFullName(user)}
      renderSubtitle={(user) => (
        <>
          {user.email || "Без почты"}{" "}
          <span className="text-[#8E8E93]">ID: {user.id}</span>
        </>
      )}
      renderMeta={(user) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            copyPhone(user.phone);
          }}
          className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#478EFF] transition-opacity hover:opacity-70"
        >
          <MarketingCopyIcon className="h-[18px] w-[18px] shrink-0" />
          {formatPhone(user.phone)}
        </div>
      )}
      onClose={onClose}
      onConfirm={() => onConfirm([...selectedUsers.values()])}
      confirmActive={selectedUsers.size > 0}
    />
  );
};
