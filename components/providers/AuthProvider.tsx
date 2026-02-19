"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
import Cookies from "js-cookie";
import { authStorage } from "@/lib/utils";
import { SWRConfig } from "swr";
interface LoginFormValues {
  email: string;
  password: string;
}

interface fetchSessionFn {
  (
    url: string,
    getAccessToken: () => string | null,
    refreshSession: () => Promise<string>,
    options?: RequestInit
  ): Promise<Response>;
}

interface AuthContextType {
  loading: boolean;
  error: string;
  adminData: any;
  login: (form: LoginFormValues, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<string>;
  fetchWithSession: fetchSessionFn;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  const [loading, setLoading] = useState(true); // Start as loading to prevent flickering
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState<any>(null);

  const fetchWithSession: fetchSessionFn = useCallback(
    async (url, getAccessToken, refreshSessionFn, options) => {
      let token = getAccessToken();

      const requestConfig = (token: string | null) => ({
        ...options,
        headers: {
          ...options?.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      let res = await fetch(url, requestConfig(token));

      if (res.status === 401) {
        token = await refreshSessionFn();
        res = await fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return res;
    },
    []
  );

  const logout = useCallback(() => {
    try {
      authStorage.clear();
    } catch {}

    setAdminData(null);
    router.push("/login");
  }, [router]);

  const refreshPromise = useRef<Promise<string> | null>(null);

  const refreshSession = useCallback(async (): Promise<string> => {
    if (!directusUrl) throw new Error("DIRECTUS_URL не определён");

    // If a refresh is already in progress, return the existing promise
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      throw new Error("Нет refresh токена");
    }

    refreshPromise.current = (async () => {
      try {
        const res = await fetch(`${directusUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh, mode: "json" }),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            logout();
          }
          throw new Error(`Auth refresh failed: ${res.status}`);
        }

        const result = await res.json();
        const tokens = result.data || result;
        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error("Некорректный ответ от API");
        }
        authStorage.setTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.expires
        );

        return tokens.access_token;
      } catch (err) {
        throw err;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [directusUrl, logout]);

  const refreshProfile = useCallback(async () => {
    if (!directusUrl) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetchWithSession(
        `${directusUrl}/users/me?fields=*,role.*`,
        () => token,
        refreshSession
      );

      if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
      }

      const result = await res.json();
      let userData = result.data ?? result;

      // Check Admin Access via JWT
      const payload = parseJwt(token);
      userData.isAdmin = payload?.admin_access === true;

      // If NOT Admin and NO Shop, try to find the shop via members
      if (!userData.isAdmin && !userData.shop && userData.email) {
        try {
          // Build search query to filter shops by member email
          const searchParams = {
            members: {
              email: userData.email,
            },
          };

          const queryParams = new URLSearchParams();
          queryParams.set("relations", "members,photo");
          queryParams.set("search", JSON.stringify(searchParams));
          queryParams.set("page", "1");
          queryParams.set("pageSize", "10");
          queryParams.set("isPublic", "true");

          const shopsRes = await fetchWithSession(
            `${process.env.NEXT_PUBLIC_API_URL}/shops?${queryParams.toString()}`,
            () => token,
            refreshSession
          );

          if (shopsRes.ok) {
            const result = await shopsRes.json();
            const shopsList = result.data || result;

            if (Array.isArray(shopsList) && shopsList.length > 0) {
              userData.shop = shopsList[0];
              console.log(
                "[Auth] Found user shop via search:",
                shopsList[0].name
              );
            } else {
              console.warn(
                "[Auth] No shop found for user email:",
                userData.email
              );
            }
          } else {
            console.error("[Auth] /shops failed:", shopsRes.status);
          }
        } catch (e) {
          console.error("[Auth] Failed to fetch user shop", e);
        }
      }
      Cookies.set("user_role", userData.role.name);
      const shopId = userData.shop?.id;
      Cookies.set("user_shop_id", shopId);
      setAdminData(userData);
    } catch (err) {
      console.error("Profile refresh failed", err);
    } finally {
      setLoading(false);
    }
  }, [directusUrl, fetchWithSession, refreshSession]);

  const login = async (form: LoginFormValues, redirectTo: string = "/") => {
    if (!directusUrl) {
      setError("DIRECTUS_URL не определён");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${directusUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        setError("Неверный логин или пароль");
        return;
      }
      await refreshProfile();
      const tokens = result.data || result;
      if (tokens.access_token && tokens.refresh_token) {
        authStorage.setTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.expires
        );
      } else {
        setError("Ошибка авторизации: токены не получены");
        return;
      }

      await refreshProfile();

      const token = localStorage.getItem("access_token");
      const payload = token ? parseJwt(token) : null;
      const isAdmin = payload?.admin_access === true;
      const target = isAdmin ? "/reports/couriers" : "/categories";
      router.push(target);
    } catch (err) {
      setError("Ошибка при входе. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      loading,
      error,
      adminData,
      login,
      logout,
      refreshProfile,
      refreshSession,
      fetchWithSession,
    }),
    [
      loading,
      error,
      adminData,
      login,
      logout,
      refreshProfile,
      refreshSession,
      fetchWithSession,
    ]
  );
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        fetcher: (url: string) =>
          fetchWithSession(
            url,
            () => localStorage.getItem("access_token"),
            refreshSession
          ).then((res) => res.json()),
      }}
    >
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </SWRConfig>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
