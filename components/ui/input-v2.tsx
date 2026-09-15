import * as React from "react";

import { cn } from "@/lib/theme";

export interface InputV2Props
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: React.ReactNode;
}

const InputV2 = React.forwardRef<HTMLInputElement, InputV2Props>(
  ({ className, type, suffix, ...props }, ref) => {
    if (suffix == null) {
      return (
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-[48px] min-h-[48px] w-full rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] py-[8px] pl-[18px] pr-[8px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none ring-1 ring-transparent transition-shadow placeholder:text-[#0E0F2780] focus:ring-[#55CB00] disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex h-[48px] min-h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] py-[8px] pl-[18px] pr-[8px] ring-1 ring-transparent transition-shadow focus-within:ring-[#55CB00]",
          className
        )}
      >
        <input
          type={type}
          ref={ref}
          className="h-full w-full min-w-0 border-0 bg-transparent text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none disabled:cursor-not-allowed disabled:opacity-60"
          {...props}
        />
        <span className="pointer-events-none shrink-0 pl-2 text-[13px] text-[#8E8E93]">
          {suffix}
        </span>
      </div>
    );
  }
);
InputV2.displayName = "InputV2";

export { InputV2 };
