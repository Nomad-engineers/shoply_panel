import Link from "next/link";
import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/theme";
import { Badge } from "../ui";

interface LogoProps {
  className?: string;
  showBadge?: boolean; 
}

const Logo = forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, showBadge = true }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push("/reports/couriers"); // или "/" если главная на корне
    };

    return (
      <Link
        ref={ref}
        href="reports/couriers"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 text-xl font-bold text-text-primary px-6 pb-2 border-b-2",
          className
        )}
      >
        <span className="tracking-wide font-extrabold text-2xl">SHOPLY</span>
        {showBadge && (
          <Badge
            variant="custom-purple"
            className="px-3 py-1 text-sm rounded-md" 
          >
            Panel
          </Badge>
        )}
      </Link>
    );
  }
);

export { Logo };