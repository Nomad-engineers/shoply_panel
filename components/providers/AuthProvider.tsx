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
import Cookies from "js-cookie";
import { authStorage } from "@/lib/utils";
import { SWRConfig } from "swr";
import { ROLES } from "@/middleware";
import type {
  AuthProfile,
  AuthProfileBusiness,
  V2ProfileResponse,
} from "@/types/auth";
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
  adminData: AuthProfile | null;
  login: (form: LoginFormValues, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<AuthProfile | null>;
  refreshSession: () => Promise<string>;
  fetchWithSession: fetchSessionFn;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true); // Start as loading to prevent flickering
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState<AuthProfile | null>(null);

  const resolveShopId = useCallback(
    (businesses: AuthProfileBusiness[], isAdmin: boolean): number | null => {
      if (isAdmin || businesses.length === 0) {
        return null;
      }

      const allowedIds = businesses.map((business) => business.id);
      const cookieId = Number(Cookies.get("current_shop_id"));

      if (cookieId && allowedIds.includes(cookieId)) {
        return cookieId;
      }

      return allowedIds[0] ?? null;
    },
    []
  );

  const buildProfile = useCallback(
    (rawProfile: V2ProfileResponse): AuthProfile => {
      const businesses = Array.isArray(rawProfile.businesses)
        ? rawProfile.businesses
        : [];
      const isAdmin = rawProfile.role === ROLES.ADMIN;

      return {
        ...rawProfile,
        businesses,
        isAdmin,
        shopId: resolveShopId(businesses, isAdmin),
      };
    },
    [resolveShopId]
  );

  const syncProfileCookies = useCallback((profile: AuthProfile) => {
    Cookies.set("user_role", profile.role || "");

    if (profile.isAdmin || !profile.shopId) {
      Cookies.remove("current_shop_id");
      return;
    }

    Cookies.set("current_shop_id", String(profile.shopId));
  }, []);

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
        const res = await fetch(`${apiUrl}/auth/refresh`, {
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
        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error("Некорректный ответ от API");
        }
        authStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        return tokens.accessToken;
      } catch (err) {
        throw err;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [apiUrl, logout]);

  const refreshProfile = useCallback(async (): Promise<AuthProfile | null> => {
    if (!apiUrl) {
      setLoading(false);
      return null;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return null;
      }

      const res = await fetchWithSession(
        `${apiUrl}/v2/profile`,
        () => token,
        refreshSession
      );

      if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
      }

      const result = await res.json();
      const userData = buildProfile((result.data ?? result) as V2ProfileResponse);

      if (!userData.firstName) {
        authStorage.clear();
        router.push("/login");
        alert("Установите свой профиль в панели Directus");
        return null;
      }

      if (!userData.isAdmin && userData.businesses.length === 0) {
        authStorage.clear();
        router.push("/login");
        alert("У вас нет связанного магазина.");
        return null;
      }

      syncProfileCookies(userData);
      setAdminData(userData);
      return userData;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, buildProfile, fetchWithSession, refreshSession, router, syncProfileCookies]);

  const login = async (form: LoginFormValues, redirectTo: string = "/") => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Неверный логин или пароль");
        setLoading(false);
        return;
      }

      const result = await res.json();
      const tokens = result.data || result;
      if (tokens.accessToken && tokens.refreshToken) {
        authStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        const profile = await refreshProfile();
        router.push(profile?.isAdmin ? "/reports/couriers" : "/categories");
      }
    } catch (err) {
      setError("Ошибка при входе.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !adminData) {
      refreshProfile();
    } else if (!token) {
      setLoading(false);
    }
  }, [adminData, refreshProfile]);

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
        revalidateOnReconnect: true,
        dedupingInterval: 10000, 
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
