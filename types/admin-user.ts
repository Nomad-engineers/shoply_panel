export const USER_ROLES = {
  USER: "user",
  DELIVERY_MAN: "delivery_man",
  ADMIN: "admin",
  OPERATOR: "operator",
  SHOP_OWNER: "shop_owner",
  SHOP_EMPLOYEE: "shop_employee",
} as const;

export type BackendUserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type AdminUserSortField = "id" | "firstName" | "phone" | "email" | "createdAt" | "role";
export type AdminUserSortDirection = "ASC" | "DESC";

export interface AdminUser {
  id: number;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: BackendUserRole;
  photoId: string | null;
  business: {
    id: number;
    name: string;
    type: string;
    photoId: string | null;
  }[];
}

export interface AdminUserTotals {
  total: number;
  user: number;
  delivery_man: number;
  admin: number;
  operator: number;
  shop_owner: number;
  shop_employee: number;
}

export interface PaginatedMeta {
  total: number;
  pageCount: number;
  page: number;
}

export interface AdminUsersResponse {
  timestamp: string;
  data: AdminUser[];
  meta: PaginatedMeta;
  totals: AdminUserTotals;
}
