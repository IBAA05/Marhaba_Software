import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "No records found",
  description,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-dark">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <div>
        <p className="font-semibold text-brand-ink dark:text-gray-100">
          {title}
        </p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-brand-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
