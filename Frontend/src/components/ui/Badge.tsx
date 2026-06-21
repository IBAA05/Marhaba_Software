import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BadgeColor } from "@/lib/statusColors";

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        !color && "bg-gray-100 text-gray-700",
        className,
      )}
      style={
        color ? { backgroundColor: color.bg, color: color.text } : undefined
      }
    >
      {children}
    </span>
  );
}
