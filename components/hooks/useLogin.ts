import { useAuthContext } from "../providers/AuthProvider";

export const useAuth = (directusUrl: string | undefined) => {
  return useAuthContext();
};
