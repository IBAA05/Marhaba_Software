import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "./Select";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-brand-muted">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <Select
          className="h-8 w-20 py-1"
          value={String(limit)}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          options={[
            { value: "10", label: "10" },
            { value: "25", label: "25" },
            { value: "50", label: "50" },
          ]}
        />
      </div>
      <span>
        {total === 0 ? 0 : (page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-brand-border p-1.5 disabled:opacity-40 hover:bg-gold-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span
          className={cn("px-2 font-medium text-brand-ink dark:text-gray-200")}
        >
          {page} / {Math.max(pages, 1)}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-brand-border p-1.5 disabled:opacity-40 hover:bg-gold-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
