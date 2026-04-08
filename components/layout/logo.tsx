"use client";

import Image from "next/image";
import Link from "next/link";
import React, { forwardRef } from "react";
import { cn } from "@/lib/theme";

interface LogoProps {
  className?: string;
  showBadge?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Logo = forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, showBadge = true, isCollapsed, onToggleCollapse }, ref) => {
    return (
      <div className="relative mb-1 flex items-center justify-between border-b border-[#dcdce6] px-[18px] py-[14px]">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex w-full items-center justify-center text-text-primary transition-all",
              className,
            )}
            aria-label="Развернуть меню"
          >
            <Image
              src="/panel-icons/sidebar-toggle.png"
              alt="Toggle sidebar"
              width={20}
              height={20}
              className="shrink-0"
            />
          </button>
        ) : (
          <Link
            ref={ref}
            href="/categories"
            className={cn(
              "flex items-center gap-1 text-text-primary transition-all",
              className,
            )}
          >
            <>
              <span className="text-[18px] font-extrabold leading-none tracking-[-0.04em]">
                SHOPLY
              </span>
              {showBadge && (
                <span
                  className="inline-flex items-center justify-center rounded-md bg-[#9747ff] px-2 py-1 text-[10px] font-semibold leading-none text-white"
                >
                  Panel
                </span>
              )}
            </>
          </Link>
        )}

        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="shrink-0 text-text-primary transition-opacity hover:opacity-70"
            aria-label="Свернуть меню"
          >
            <Image
              src="/panel-icons/sidebar-toggle.png"
              alt="Collapse sidebar"
              width={20}
              height={20}
            />
          </button>
        )}
      </div>
    );
  },
);

export { Logo };
