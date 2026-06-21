import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const panel = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0 },
};
const panelTransition = { duration: 0.2, ease: "easeOut" as const };

const widths: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={panelTransition}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dark-card",
              widths[size],
            )}
          >
            {title ? (
              <div className="flex items-center justify-between border-b border-brand-border px-5 py-4 dark:border-white/10">
                <h3 className="text-base font-semibold text-brand-ink dark:text-gray-100">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {children}
            </div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-3 dark:border-white/10">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
