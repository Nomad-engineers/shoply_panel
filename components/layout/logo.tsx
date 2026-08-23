"use client";

import Image from "next/image";
import Link from "next/link";
import React, { forwardRef } from "react";
import { cn } from "@/lib/theme";

interface LogoProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Logo = forwardRef<HTMLAnchorElement, LogoProps>(
  ({ className, isCollapsed, onToggleCollapse }, ref) => {
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
              "flex items-center text-text-primary transition-all",
              className,
            )}
          >
            <div className="flex gap-3 items-center">
              <Image
                src="/v2-icons/v2-logo.svg"
                height={45}
                width={45}
                alt="logo"
              />
              <div className="flex flex-col">
                <p className="m-0 text-[11px] font-extrabold tracking-tight text-[#0E0F27] leading-none">
                  SHOPLY
                </p>
                <p className="m-0 text-xl font-extrabold tracking-tight text-[#0E0F27] leading-none">
                  PANEL
                </p>
              </div>
            </div>
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
