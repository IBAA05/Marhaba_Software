import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  goldBorder?: boolean;
  padded?: boolean;
}

export function Card({
  className,
  goldBorder,
  padded = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-white shadow-card dark:bg-dark-card dark:border-white/10",
        goldBorder && "border-l-4 border-l-gold",
        padded && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-brand-ink dark:text-gray-100">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-brand-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
