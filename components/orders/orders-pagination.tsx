"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/theme";

interface OrdersPaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Callback when page changes - returns new query string */
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons to show */
  maxPageButtons?: number;
}

/**
 * Pagination component for orders list with page numbers and navigation
 */
export function OrdersPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxPageButtons = 7,
}: OrdersPaginationProps) {
  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate range of page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxPageButtons / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    // Adjust if we're near the start
    if (currentPage <= half) {
      endPage = Math.min(totalPages, maxPageButtons);
    }

    // Adjust if we're near the end
    if (currentPage + half >= totalPages) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }

    // Add start ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add end ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Info text */}
      <div className="text-sm text-[#0E0F2780]">
        Показано {startItem}–{endItem} из {totalItems}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            currentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "bg-white hover:bg-gray-100"
          )}
          aria-label="Предыдущая страница"
        >
          <ChevronLeft size={16} className="text-[#0E0F27]" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-[#0E0F2780]"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentPage === pageNum
                  ? "bg-[#04DCB4] text-white"
                  : "bg-white text-[#0E0F27] hover:bg-gray-100"
              )}
              aria-label={`Страница ${pageNum}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed opacity-50"
              : "bg-white hover:bg-gray-100"
          )}
          aria-label="Следующая страница"
        >
          <ChevronRight size={16} className="text-[#0E0F27]" />
        </button>
      </div>
    </div>
  );
}
