import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithSession } from "../utils/fetch.util";

interface LoginFormValues {
  email: string;
  password: string;
}

interface UseAuthReturn {
  loading: boolean;
  error: string;
  adminData: any;
  login: (form: LoginFormValues, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<string>;
}

export const useAuth = (directusUrl: string | undefined): UseAuthReturn => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState<any>(null);

  // ================= LOGIN =================
  const login = async (
    form: LoginFormValues,
    redirectTo: string = "/reports"
  ) => {
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
        setError(result?.errors?.[0]?.message || "Неверный логин или пароль");
        return;
      }
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      await refreshProfile();
      router.push(redirectTo);
    } catch {
      setError("Ошибка при входе. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}

    setAdminData(null);
    router.push("/");
  };

  // ================= PROFILE =================
  const refreshProfile = async () => {
    if (!directusUrl) return;

    try {
      const res = await fetchWithSession(
        `${directusUrl}/users/me`,
        () => localStorage.getItem("access_token"),
        refreshSession
      );

      if (!res.ok) throw new Error();

      const result = await res.json();
      setAdminData(result.data ?? result);
    } catch {
      setAdminData(null);
    }
  };

  const refreshSession = async (): Promise<string> => {
    if (!directusUrl) throw new Error("DIRECTUS_URL не определён");

    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("Нет refresh токена");

    const res = await fetch(`${directusUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      logout();
      throw new Error("Не авторизован");
    }

    const data = await res.json();

    localStorage.setItem("access_token", data.data.access_token);
    localStorage.setItem("refresh_token", data.data.refresh_token);

    return data.data.access_token;
  };

  // ================= AUTO LOAD PROFILE =================
  useEffect(() => {
    refreshProfile();
  }, [directusUrl]);

  return {
    loading,
    error,
    adminData,
    login,
    logout,
    refreshProfile,
    refreshSession,
  };
};
