import { useState } from "react";
import Cookies from "js-cookie";

interface MutationOptions {
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApiMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (url: string, options?: MutationOptions & { body?: any }) => {
    setIsLoading(true);
    setError(null);

    const method = options?.method || "POST";
    const token = Cookies.get("auth_token"); 
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (options?.onSuccess) options.onSuccess(data);
      return data;
    } catch (err: any) {
      const message = err.message || "Something went wrong";
      setError(message);
      if (options?.onError) options.onError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}