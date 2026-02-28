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
import { ROLES } from "@/middleware";
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
        `${directusUrl}/users/me?fields=*,role.*,shop.*`,
        () => token,
        refreshSession
      );

      if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
      }

      const result = await res.json();
      let userData = result.data ?? result;

      if (!userData.first_name) {
        authStorage.clear();
        router.push("/login");
        alert("Установите свой профиль в панели Directus");
        return;
      }

      const payload = parseJwt(token);
      userData.isAdmin = payload?.admin_access === true;

      if (!userData.isAdmin && userData.email) {
        try {
          if (!userData.shop) {
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
              const shopsResult = await shopsRes.json();
              const shopsList = shopsResult.data || shopsResult;

              if (Array.isArray(shopsList) && shopsList.length > 0) {
                userData.shop = shopsList[0];
              } else {
                authStorage.clear();
                router.push("/login");
                alert("У вас нет связанного магазина.");
                return;
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!userData.isAdmin && !userData.shop) {
        authStorage.clear();
        router.push("/login");
        alert("У вас нет связанного магазина.");
        return;
      }

      Cookies.set("user_role", userData.role?.name || "");
      if (userData.shop?.id) {
        Cookies.set("user_shop_id", String(userData.shop.id));
      }

      setAdminData(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [directusUrl, fetchWithSession, refreshSession, router]);

  const login = async (form: LoginFormValues, redirectTo: string = "/") => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${directusUrl}/auth/login`, {
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

    if (tokens.access_token && tokens.refresh_token) {
      authStorage.setTokens(tokens.access_token, tokens.refresh_token, tokens.expires);
      
      await refreshProfile(); 
      
      const payload = parseJwt(tokens.access_token);
      const isAdmin = payload?.admin_access === true;
      router.push(isAdmin ? "/reports/couriers" : "/categories");
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
  }, [adminData, refreshProfile])

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
