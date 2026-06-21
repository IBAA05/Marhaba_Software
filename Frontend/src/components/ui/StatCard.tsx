import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

const cardMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};
const cardTransition = { duration: 0.3, ease: "easeOut" as const };

/** Animated count-up hook. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  format,
  prefix,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  trend?: number;
  format?: (v: number) => string;
  prefix?: string;
}) {
  const animated = useCountUp(value);
  const display = format
    ? format(animated)
    : `${prefix ?? ""}${Math.round(animated).toLocaleString()}`;
  const up = (trend ?? 0) >= 0;
  return (
    <motion.div
      variants={cardMotion}
      initial="hidden"
      animate="show"
      transition={cardTransition}
    >
      <Card goldBorder className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
            {display}
          </p>
          {trend !== undefined ? (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                up ? "text-status-success" : "text-status-danger",
              )}
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend)}% vs yesterday
            </p>
          ) : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-50 text-gold-dark">
          {icon}
        </div>
      </Card>
    </motion.div>
  );
}
