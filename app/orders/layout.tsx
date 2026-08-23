import { ReactNode } from "react";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/v2-files/orders-bg.svg')" }}
    >
      {children}
    </div>
  );
}
