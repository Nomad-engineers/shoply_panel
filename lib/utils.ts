import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from "js-cookie";
import { parseJsonFile } from "next/dist/build/load-jsconfig";
import { parseJwt } from "./jwt";

interface TokenOptions {
  expires?: number;
  role?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(
  input: string | { id?: string; url?: string | null } | null | undefined,
  options: { width?: number; height?: number; fit?: string } = {}
) {
  if (!input) return "";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // 1. Handle object input (DirectusFileEntity or similar)
  if (typeof input === "object" && input !== null) {
    // Priority 1: Use ID to construct our own URL (more reliable across environments than the 'url' from API)
    if (input.id) {
      let path = `/files/${input.id}`;
      const params = new URLSearchParams();
      if (options.width) params.set("width", String(options.width));
      if (options.height) params.set("height", String(options.height));
      if (options.fit) params.set("fit", options.fit);

      const qs = params.toString();
      if (qs) path += `?${qs}`;

      return `${cleanBase}${path}`;
    }

    // Fallback: If no ID, use the URL property if it's a full URL
    if (input.url && input.url.startsWith("http")) {
      return input.url;
    }

    // Fallback 2: If it has a relative URL, prepend base
    if (input.url && input.url.startsWith("/")) {
      return `${cleanBase}${input.url}`;
    }
  }

  // 2. Handle string input
  if (typeof input === "string") {
    // If it's a full URL, use it
    if (input.startsWith("http")) return input;

    // Otherwise prepend base URL
    const cleanUrl = input.startsWith("/") ? input : `/${input}`;
    return `${cleanBase}${cleanUrl}`;
  }

  return "";
}

export const authStorage = {
  setTokens: (access: string, refresh: string, expiresMs?: number) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    const expires = expiresMs ? expiresMs / (1000 * 60 * 60 * 24) : 7;
    Cookies.set("auth_token", access, { expires: expires || 1, path: "/" });
  },

  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    Cookies.remove("auth_token");
    Cookies.remove("user_role");
    Cookies.remove("user_shop_id");
  },
};

export const calculatePrice = (
  purchasePrice: number,
  markup: number
): number => {
  const purchase = Number(purchasePrice) || 0;

  const margin = Number(markup) || 0;

  if (purchase === 0) return 0;

  const result = purchase + purchase * (margin / 100);

  return Number(result.toFixed(2));
};

