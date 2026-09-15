"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  MarketingCheckIcon,
  MarketingCloseIcon,
} from "@/components/icons/marketing-icons";
import { cn } from "@/lib/theme";

interface SideModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmActive?: boolean;
  closeLabel?: string;
  children?: ReactNode;
}

const CLOSE_ANIMATION_MS = 320;

export const SideModal = ({
  open,
  title,
  onClose,
  onConfirm,
  confirmDisabled,
  confirmActive,
  closeLabel,
  children,
}: SideModalProps) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }

    setClosing(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, CLOSE_ANIMATION_MS);

    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[45] bg-[#09091D]/30",
          closing ? "animate-overlay-out" : "animate-overlay-in"
        )}
        onClick={onClose}
      />

      <div className="fixed right-[324px] top-1/2 z-[55] -translate-y-1/2">
        <div
          className={cn(
            "flex h-[902px] max-h-[calc(100vh-48px)] w-[606px] flex-col overflow-hidden rounded-[32px] border-l border-[#ECECF3] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]",
            closing ? "animate-modal-out" : "animate-modal-in"
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <div className="font-[Inter_Tight] text-[20px] font-semibold leading-[22px] text-[var(--text-txt-main-100,#0E0F27)]">
              {title}
            </div>

            <div className="flex items-center gap-2">
              {closeLabel ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-full bg-[#EDEDF2] px-[18px] text-[14px] font-medium text-[#0E0F27] transition-colors hover:bg-[#e0e0e8]"
                >
                  {closeLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  title="Закрыть"
                  className="grid h-[36px] w-[36px] cursor-pointer place-items-center rounded-full bg-[#F5462C] text-white transition-colors hover:bg-[#e03d24]"
                >
                  <MarketingCloseIcon className="h-[20px] w-[20px]" />
                </button>
              )}
              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  title="Подтвердить"
                className={cn(
                  "grid h-[36px] w-[36px] place-items-center rounded-full text-white transition-colors",
                  confirmDisabled
                    ? "cursor-default bg-[#D9D9DF]"
                    : confirmActive
                      ? "cursor-pointer bg-[#55CB00] hover:bg-[#4db800]"
                      : "cursor-default bg-[#D9D9DF] hover:bg-[#c9c9d1]"
                )}
                >
                  <MarketingCheckIcon className="h-[20px] w-[20px]" />
                </button>
              )}
            </div>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};
