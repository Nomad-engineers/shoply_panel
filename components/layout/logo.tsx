import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/theme";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = React.forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, variant = "full" }, ref) => {
    if (variant === "icon") {
      return (
        <Link
          ref={ref}
          href="/"
          className={cn(
            "flex items-center gap-2 text-2xl font-bold text-text-primary",
            className
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5AC800]">
            <span className="text-white font-bold">S</span>
          </div>
        </Link>
      );
    }

    return (
      <Link
        ref={ref}
        href="/"
        className={cn(
          "flex items-center gap-3 text-2xl font-bold text-text-primary",
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5AC800]">
          <span className="text-white text-xl font-bold">S</span>
        </div>
        <span>Shoply</span>
      </Link>
    );
  }
);
Logo.displayName = "Logo";

export { Logo };