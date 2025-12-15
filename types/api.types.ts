export interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

// Тип ответа
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}
