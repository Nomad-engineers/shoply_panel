export interface CourierData {
  id: number;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
  [key: string]: any;
}
