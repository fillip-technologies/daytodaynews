"use client";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  rangeText: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  rangeText,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTablePaginationProps) {
  function getPageNumbers() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-3.5 border-t border-border sm:flex-row sm:items-center sm:justify-between bg-surface-elevated/40 text-xs">
      {/* Left: Range and Page Size selector */}
      <div className="flex flex-wrap items-center gap-3 text-text-muted">
        <span className="font-medium text-text-secondary">{rangeText}</span>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1.5">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
            aria-label="First page"
            className="grid size-7 place-items-center rounded-lg border border-border bg-surface-elevated text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
            aria-label="Previous page"
            className="grid size-7 place-items-center rounded-lg border border-border bg-surface-elevated text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-text-muted">
                …
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-7 h-7 rounded-lg px-2 text-xs font-semibold transition-colors ${
                  currentPage === p
                    ? "bg-primary text-surface-elevated shadow-xs"
                    : "border border-border bg-surface-elevated text-text-secondary hover:bg-background hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
            aria-label="Next page"
            className="grid size-7 place-items-center rounded-lg border border-border bg-surface-elevated text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
            aria-label="Last page"
            className="grid size-7 place-items-center rounded-lg border border-border bg-surface-elevated text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
