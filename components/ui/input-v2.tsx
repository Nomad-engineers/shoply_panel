import * as React from "react";

import { cn } from "@/lib/theme";

type CommonInputV2Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows" | "onChange" | "size" | "type"
> & {
  type?: React.HTMLInputTypeAttribute;
  rows?: number;
  width?: number | "auto";
  height?: number | "auto";
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export interface InputV2Props extends CommonInputV2Props {
  suffix?: React.ReactNode;
  multiline?: boolean;
}

const InputV2 = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputV2Props
>(({ className, style, type, suffix, multiline, rows, width, height, ...props }, ref) => {
  const fixedWidth = typeof width === "number" ? width : undefined;
  const fixedHeight = typeof height === "number" ? height : undefined;
  const dimensionsStyle =
    fixedWidth != null || fixedHeight != null
      ? { width: fixedWidth, height: fixedHeight, ...style }
      : style;

  if (multiline) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        rows={rows ?? 5}
        className={cn(
          "w-full resize-none rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] p-[14px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none ring-1 ring-transparent transition-shadow placeholder:text-[#0E0F2780] focus:ring-[#55CB00] disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        style={dimensionsStyle}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  if (suffix == null) {
    return (
      <input
        type={type}
        ref={ref as React.Ref<HTMLInputElement>}
        className={cn(
          "flex h-[48px] min-h-[48px] w-full rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] py-[8px] pl-[18px] pr-[8px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none ring-1 ring-transparent transition-shadow placeholder:text-[#0E0F2780] focus:ring-[#55CB00] disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        style={dimensionsStyle}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-[48px] min-h-[48px] w-full items-center justify-between rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] py-[8px] pl-[18px] pr-[8px] ring-1 ring-transparent transition-shadow focus-within:ring-[#55CB00]",
        className
      )}
      style={dimensionsStyle}
    >
      <input
        type={type}
        ref={ref as React.Ref<HTMLInputElement>}
        className="h-full w-full min-w-0 border-0 bg-transparent text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none disabled:cursor-not-allowed disabled:opacity-60"
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      <span className="pointer-events-none shrink-0 pl-2 text-[13px] text-[#8E8E93]">
        {suffix}
      </span>
    </div>
  );
});
InputV2.displayName = "InputV2";

export { InputV2 };
