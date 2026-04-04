export interface AuthProfileBusiness {
  id: number;
  name: string;
  type: string;
  photoId: string | null;
}

export interface V2ProfileResponse {
  id: number;
  firstName: string | null;
  lastName: string | null;
  photoId: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  businesses: AuthProfileBusiness[];
}

export interface AuthProfile extends V2ProfileResponse {
  isAdmin: boolean;
  shopId: number | null;
}
