import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/theme";

interface LogoProps {
  className?: string;
  showBadge?: boolean; // ← включает/выключает фиолетовый Badge "Panel"
}

const Logo = React.forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, showBadge = true }, ref) => {
    return (
      <Link
        ref={ref}
        href="/"
        className={cn(
          "flex items-center gap-2 text-xl font-bold text-text-primary px-6 pb-2 border-b-2",
          className
        )}
      >

        {/* SHOPLY text */}
        <span className="tracking-wide font-extrabold text-2xl ">SHOPLY</span>

        {/* Purple badge "Panel" */}
        {showBadge && (
          <span className="px-3 py-1 text-sm rounded-md bg-purple-500 text-white">
            Panel
          </span>
        )}
      </Link>
    );
  }
);

Logo.displayName = "Logo";

export { Logo };
