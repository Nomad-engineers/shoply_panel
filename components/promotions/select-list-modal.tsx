"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";

import { SideModal } from "@/components/ui/side-modal";
import { InputV2, Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";

export interface SelectListModalProps<T extends { id: number }> {
  open: boolean;
  title: string;
  closeLabel?: string;
  searchLabel: string;
  searchPlaceholder: string;
  infoColumnLabel: string;
  metaColumnLabel: string;
  emptyText: string;
  items: T[];
  loading: boolean;
  error: string | null;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  selectedIds: Set<number>;
  onSearchChange: (search: string) => void;
  onToggle: (item: T) => void;
  renderTitle: (item: T) => ReactNode;
  renderSubtitle?: (item: T) => ReactNode;
  renderMeta: (item: T) => ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmActive: boolean;
}

export const SelectListModal = <T extends { id: number }>({
  open,
  title,
  closeLabel,
  searchLabel,
  searchPlaceholder,
  infoColumnLabel,
  metaColumnLabel,
  emptyText,
  items,
  loading,
  error,
  loadingMore,
  hasMore,
  loadMore,
  selectedIds,
  onSearchChange,
  onToggle,
  renderTitle,
  renderSubtitle,
  renderMeta,
  onClose,
  onConfirm,
  confirmActive,
}: SelectListModalProps<T>) => {
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      onSearchChange("");
    }
  }, [open, onSearchChange]);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(search.trim()), 500);
    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  useEffect(() => {
    if (!open || !hasMore || !loadMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [open, hasMore, loading, loadingMore, loadMore]);

  return (
    <SideModal
      open={open}
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmActive={confirmActive}
    >
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-4">
        <div className="shrink-0 space-y-2">
          <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
            {searchLabel}
          </div>
          <InputV2
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 pb-2 pt-5">
          <span className="h-[20px] w-[20px] shrink-0" />
          <span className="flex-1 text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
            {infoColumnLabel}
          </span>
          <span className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
            {metaColumnLabel}
          </span>
          <span className="w-[16px] shrink-0" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={20} />
            </div>
          ) : error ? (
            <div className="px-2 py-6 text-[13px] text-[#F5462C]">{error}</div>
          ) : items.length === 0 ? (
            <div className="px-2 py-6 text-[13px] text-[#8E8E93]">
              {emptyText}
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const subtitle = renderSubtitle?.(item);

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggle(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(item);
                    }
                  }}
                  className="flex min-h-[56px] cursor-pointer items-center gap-3 border-t border-[#F0F0F4] py-2 text-left transition-colors first:border-t-0 hover:bg-[#FAFAFC]"
                >
                  <span
                    className={cn(
                      "grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border transition-colors",
                      isSelected
                        ? "border-[#55CB00] bg-[#55CB00] text-white"
                        : "border-[#09091D40] bg-white"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-[12px] w-[12px]" strokeWidth={3} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-[#0E0F27]">
                      {renderTitle(item)}
                    </div>
                    {subtitle ? (
                      <div className="truncate text-[12px] leading-[16px] text-[#8E8E93]">
                        {subtitle}
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0">{renderMeta(item)}</div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-[#b9bbc6]" />
                </div>
              );
            })
          )}

          <div ref={sentinelRef} className="h-px" />

          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Spinner size={18} />
            </div>
          )}
        </div>
      </div>
    </SideModal>
  );
};
