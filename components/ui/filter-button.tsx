import * as React from "react";
import { Filter } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/theme";

const filterButtonVariants = cva(
  "inline-flex items-center gap-2 rounded-full border text-sm font-medium transition-all duration-200",
  {
    variants: {
      active: {
        true: "border-[#04DCB4] bg-[rgba(4,220,180,0.1)] text-[#04DCB4]",
        false: "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterButtonVariants> {
    children: React.ReactNode;
  }

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(filterButtonVariants({ active }), className)}
        {...props}
      >
        <Filter className="h-4 w-4" />
        {children}
      </button>
    );
  }
);
FilterButton.displayName = "FilterButton";

export { FilterButton };