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
  currentShopId: number | null;
  login: (form: LoginFormValues, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<AuthProfile | null>;
  refreshSession: () => Promise<string>;
  fetchWithSession: fetchSessionFn;
  setCurrentShopId: (shopId: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_PROFILE_STORAGE_KEY = "auth_profile_cache_v1";

function readCachedProfile(): AuthProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hasAccessToken = Boolean(localStorage.getItem("access_token"));
  if (!hasAccessToken) {
    return null;
  }

  try {
    const rawValue = localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedProfile = JSON.parse(rawValue) as Partial<AuthProfile>;
    if (
      typeof parsedProfile.role !== "string" ||
      !Array.isArray(parsedProfile.businesses)
    ) {
      return null;
    }

    return parsedProfile as AuthProfile;
  } catch (error) {
    console.warn(`Failed to read cached auth profile: ${error}`);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState<AuthProfile | null>(null);
  const [currentShopId, setCurrentShopIdState] = useState<number | null>(null);

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

  const cacheProfile = useCallback((profile: AuthProfile) => {
    try {
      localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn(`Failed to save auth profile cache: ${error}`);
    }
  }, []);

  const clearCachedProfile = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    } catch (error) {
      console.warn(`Failed to clear auth profile cache: ${error}`);
    }
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
    clearCachedProfile();
    try {
      authStorage.clear();
    } catch {}

    Cookies.remove("user_role");
    Cookies.remove("current_shop_id");
    setCurrentShopIdState(null);
    setAdminData(null);
    router.push("/login");
  }, [clearCachedProfile, router]);

  const setCurrentShopId = useCallback((shopId: number | null) => {
    if (shopId) {
      Cookies.set("current_shop_id", String(shopId));
    } else {
      Cookies.remove("current_shop_id");
    }

    setCurrentShopIdState(shopId);
  }, []);

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
          body: JSON.stringify({ refreshToken: refresh }),
        });

        if (!res.ok) {
          if (res.status === 400 || res.status === 401 || res.status === 403) {
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

      if (!userData.isAdmin && userData.businesses.length === 0) {
        clearCachedProfile();
        authStorage.clear();
        router.push("/login");
        alert("У вас нет связанного магазина.");
        return null;
      }

      syncProfileCookies(userData);
      cacheProfile(userData);
      setAdminData(userData);
      setCurrentShopIdState(userData.isAdmin ? null : (userData.shopId ?? null));
      return userData;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    apiUrl,
    buildProfile,
    cacheProfile,
    clearCachedProfile,
    fetchWithSession,
    refreshSession,
    router,
    syncProfileCookies,
  ]);

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
        router.push(profile?.isAdmin ? "/orders" : "/categories");
      }
    } catch (err) {
      setError("Ошибка при входе.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedProfile = readCachedProfile();
    const cookieShopId = Number(Cookies.get("current_shop_id"));
    const token = localStorage.getItem("access_token");

    if (cachedProfile) {
      setAdminData(cachedProfile);
      setCurrentShopIdState(cookieShopId || cachedProfile.shopId || null);
      setLoading(false);
    }

    if (token) {
      refreshProfile();
    } else if (!token) {
      clearCachedProfile();
      setLoading(false);
      setAdminData(null);
    }
  }, [clearCachedProfile, refreshProfile]);

  const value = useMemo(
    () => ({
      loading,
      error,
      adminData,
      currentShopId,
      login,
      logout,
      refreshProfile,
      refreshSession,
      fetchWithSession,
      setCurrentShopId,
    }),
    [
      loading,
      error,
      adminData,
      currentShopId,
      login,
      logout,
      refreshProfile,
      refreshSession,
      fetchWithSession,
      setCurrentShopId,
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
