import * as React from "react";

import { cn } from "@/lib/theme";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    error?: boolean;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = "left", error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-[#F8F8FA] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            {
              "pl-10": icon && iconPosition === "left",
              "pr-10": icon && iconPosition === "right",
              "border-[#5AC800]": !error,
              "border-[#DC2626]": error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };