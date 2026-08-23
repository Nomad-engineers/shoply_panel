"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { baseUrl } from "@/lib/utils";

/**
 * Fetcher для React Query с авторизацией: подставляет Bearer-токен,
 * при 401 обновляет сессию и повторяет запрос один раз.
 * Относительные пути автоматически дополняются базовым URL из env.
 */
export function useAuthFetcher() {
  const { refreshSession, fetchWithSession } = useAuthContext();

  const fetchJson = async <T,>(path: string): Promise<T> => {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const res = await fetchWithSession(
      url,
      () => localStorage.getItem("access_token"),
      refreshSession,
    );
    if (!res.ok) {
      throw new Error(`Запрос ${url} не удался: ${res.status}`);
    }
    return (await res.json()) as T;
  };

  return fetchJson;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
