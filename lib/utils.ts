import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(
  input: string | { id?: string; url?: string | null } | null | undefined,
  options: { width?: number; height?: number; fit?: string } = {},
) {
  if (!input) return "";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  // 1. Handle object input (DirectusFileEntity or similar)
  if (typeof input === "object" && input !== null) {
    // Priority 1: If it has a full URL already, use it (don't force change port)
    if (input.url && input.url.startsWith("http")) {
      return input.url;
    }

    // Secondary Priority: If it has a relative URL, prepend base
    if (input.url && input.url.startsWith("/")) {
      return `${cleanBase}${input.url}`;
    }

    // Priority 2: Use ID to construct Directus assets URL if it's a relative path or just ID
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