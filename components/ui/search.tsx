import * as React from "react";
import { Search as SearchIcon } from "lucide-react";

import { cn } from "@/lib/theme";
import { Input } from "./input";

export interface SearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
  }

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, containerClassName, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="h-10 w-full pl-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:border-[#5AC800] focus-visible:ring-[#5AC800]/25"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Search.displayName = "Search";

export { Search };