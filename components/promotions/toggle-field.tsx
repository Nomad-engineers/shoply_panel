"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/theme";

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  action?: ReactNode;
}

export const ToggleField = ({
  label,
  description,
  checked,
  onChange,
  action,
}: ToggleFieldProps) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors",
        checked ? "bg-[#55CB00]" : "bg-[#D9D9DF]"
      )}
    >
      <span
        className={cn(
          "h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
          checked && "translate-x-[16px]"
        )}
      />
    </button>
    <div className="space-y-0.5">
      <div className="text-[16px] font-medium leading-[18px] text-[var(--text-txt-main-100,#0E0F27)]">
        {label}
      </div>
      <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
        {description}
      </div>
    </div>
    {action ? <div className="ml-auto shrink-0">{action}</div> : null}
  </div>
);
