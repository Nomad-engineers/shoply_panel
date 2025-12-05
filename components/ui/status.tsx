import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/theme";

const statusDotVariants = cva(
  "w-2 h-2 rounded-full",
  {
    variants: {
      status: {
        online: "bg-[#5AC800]",
        offline: "bg-[#9696A0]",
        busy: "bg-[#F59E0B]",
        error: "bg-[#DC2626]",
        active: "bg-[#5AC800]",
        inactive: "bg-[#9696A0]",
        pending: "bg-[#F59E0B]",
        success: "bg-[#5AC800]",
        failed: "bg-[#DC2626]",
      },
    },
    defaultVariants: {
      status: "offline",
    },
  }
);

const statusVariants = cva(
  "inline-flex items-center gap-2 text-sm font-medium",
  {
    variants: {
      status: {
        online: "text-[#5AC800]",
        offline: "text-[#646E78]",
        busy: "text-[#F59E0B]",
        error: "text-[#DC2626]",
        active: "text-[#5AC800]",
        inactive: "text-[#646E78]",
        pending: "text-[#F59E0B]",
        success: "text-[#5AC800]",
        failed: "text-[#DC2626]",
      },
    },
    defaultVariants: {
      status: "offline",
    },
  }
);

export interface StatusProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
    label: string;
    showDot?: boolean;
  }

const Status = React.forwardRef<HTMLSpanElement, StatusProps>(
  ({ className, status, label, showDot = true, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusVariants({ status }), className)}
        {...props}
      >
        {showDot && <span className={cn(statusDotVariants({ status }))} />}
        {label}
      </span>
    );
  }
);
Status.displayName = "Status";

export { Status, statusDotVariants, statusVariants };