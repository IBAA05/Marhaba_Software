import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a monetary value using the active currency. */
export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Compact number formatting for large stat values. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

/** Standard date format used throughout the app: 04 Jun 2026. */
export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  try {
    return format(toDate(value), "dd MMM yyyy");
  } catch {
    return "—";
  }
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  try {
    return format(toDate(value), "dd MMM yyyy, HH:mm");
  } catch {
    return "—";
  }
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return "—";
  try {
    return format(toDate(value), "HH:mm");
  } catch {
    return "—";
  }
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return "—";
  try {
    return formatDistanceToNow(toDate(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

/** Initials for avatar placeholders. */
export function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Convert snake_case enum values into Title Case labels. */
export function humanize(value?: string | null): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Title from a route pathname for the top bar. */
export function titleFromPath(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return humanize(seg);
}
