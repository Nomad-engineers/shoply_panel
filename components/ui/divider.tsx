import { cn } from "@/lib/theme";

export const Divider = ({ className }: { className?: string }) => (
  <div className={cn("h-px shrink-0 bg-[#DCDCE6]/60", className)} />
);
