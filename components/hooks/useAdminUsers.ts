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

interface FetchUsersOptions {
  page?: number;
  append?: boolean;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (opts?: FetchUsersOptions) => {
      if (params.skip) {
        return;
      }

      const page = opts?.page ?? params.page ?? 1;
      const append = opts?.append ?? false;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", String(page));
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
        const fetched = json.data ?? [];
        const nextMeta = json.meta ?? EMPTY_META;

        setData((prev) => (append ? [...prev, ...fetched] : fetched));
        setMeta(nextMeta);
        setTotals(json.totals ?? EMPTY_TOTALS);
        setHasMore(fetched.length > 0 && page < (nextMeta.pageCount ?? 1));
      } catch (e: any) {
        setError(e.message ?? "Ошибка при получении пользователей");
        if (!append) {
          setData([]);
          setMeta(EMPTY_META);
          setTotals(EMPTY_TOTALS);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      fetchWithSession,
      params.page,
      params.pageSize,
      params.roles,
      params.search,
      params.skip,
      params.sortBy,
      params.sortDirection,
      refreshSession,
    ],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loadMore = useCallback(() => {
    if (params.skip || loading || loadingMore || !hasMore) {
      return;
    }
    fetchUsers({ page: (meta.page ?? 1) + 1, append: true });
  }, [fetchUsers, hasMore, loading, loadingMore, meta.page, params.skip]);

  return {
    users: data,
    meta,
    totals,
    loading,
    loadingMore,
    hasMore,
    error,
    refetch: fetchUsers,
    loadMore,
  };
};
