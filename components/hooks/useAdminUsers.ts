"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useLogin";
import type {
  AdminUser,
  AdminUserSortDirection,
  AdminUserSortField,
  AdminUserTotals,
  AdminUsersResponse,
  BackendUserRole,
  PaginatedMeta,
} from "@/types/admin-user";

interface UseAdminUsersParams {
  page?: number;
  pageSize?: number;
  roles?: BackendUserRole[];
  search?: string;
  sortBy?: AdminUserSortField;
  sortDirection?: AdminUserSortDirection;
  skip?: boolean;
}

const EMPTY_META: PaginatedMeta = {
  total: 0,
  pageCount: 1,
  page: 1,
};

const EMPTY_TOTALS: AdminUserTotals = {
  total: 0,
  user: 0,
  delivery_man: 0,
  admin: 0,
  operator: 0,
  shop_owner: 0,
  shop_employee: 0,
};

export const useAdminUsers = (params: UseAdminUsersParams = {}) => {
  const { refreshSession, fetchWithSession } = useAuth();
  const [data, setData] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [totals, setTotals] = useState<AdminUserTotals>(EMPTY_TOTALS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (params.skip) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(params.page ?? 1));
      queryParams.set("pageSize", String(params.pageSize ?? 20));
      queryParams.set("sortBy", params.sortBy ?? "createdAt");
      queryParams.set("sortDirection", params.sortDirection ?? "DESC");

      if (params.search?.trim()) {
        queryParams.set("search", params.search.trim());
      }

      params.roles?.forEach((role) => {
        queryParams.append("role", role);
      });

      const url = `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/user?${queryParams.toString()}`;
      const res = await fetchWithSession(
        url,
        () => localStorage.getItem("access_token"),
        refreshSession,
      );

      if (!res.ok) {
        throw new Error("Ошибка при получении пользователей");
      }

      const json = (await res.json()) as AdminUsersResponse;
      setData(json.data ?? []);
      setMeta(json.meta ?? EMPTY_META);
      setTotals(json.totals ?? EMPTY_TOTALS);
    } catch (e: any) {
      setError(e.message ?? "Ошибка при получении пользователей");
      setData([]);
      setMeta(EMPTY_META);
      setTotals(EMPTY_TOTALS);
    } finally {
      setLoading(false);
    }
  }, [
    fetchWithSession,
    params.page,
    params.pageSize,
    params.roles,
    params.search,
    params.skip,
    params.sortBy,
    params.sortDirection,
    refreshSession,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: data,
    meta,
    totals,
    loading,
    error,
    refetch: fetchUsers,
  };
};
