import * as React from "react";
import { cn } from "@/lib/theme";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <input
        type="radio"
        id={id}
        ref={ref}
        className={cn(
          "h-5 w-5 cursor-pointer accent-[#9747FF]",
          className
        )}
        {...props}
      />
    );
  }
);

Radio.displayName = "Radio";

export { Radio };
