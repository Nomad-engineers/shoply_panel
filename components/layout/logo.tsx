import Link from "next/link";
import React, { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/theme";
import { Badge } from "../ui";

interface LogoProps {
  className?: string;
  showBadge?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Logo = forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, showBadge = true, isCollapsed, onToggleCollapse }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push("/reports/couriers");
    };

    return (
      <div className="relative flex items-center justify-between px-6 pb-4 mb-4">
        <Link
          ref={ref}
          href="reports/couriers"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 text-xl font-bold text-text-primary transition-all",
            isCollapsed && "justify-center w-full",
            className,
          )}
        >
          {isCollapsed ? (
            <Menu
              size={24}
              className="flex-shrink-0 cursor-pointer"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
            />
          ) : (
            <>
              <span className="tracking-wide font-extrabold text-2xl">
                SHOPLY
              </span>
              {showBadge && (
                <Badge
                  variant="custom-purple"
                  className="px-3 py-1 text-sm rounded-md"
                >
                  Panel
                </Badge>
              )}
            </>
          )}
        </Link>

        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Свернуть меню"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
    );
  },
);

export { Logo };
