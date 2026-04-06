import * as React from "react";

import { cn } from "@/lib/theme";

interface MainSectionProps {
  children: React.ReactNode;
  className?: string;
}

const MainSection = React.forwardRef<HTMLDivElement, MainSectionProps>(
  ({ children, className }, ref) => {
    return (
      <section ref={ref} className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {children}
        </div>
      </section>
    );
  },
);

MainSection.displayName = "MainSection";

export { MainSection };
