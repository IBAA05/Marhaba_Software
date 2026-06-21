import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const slide = { hidden: { x: "100%" }, show: { x: 0 } };
const slideTransition = {
  type: "tween" as const,
  duration: 0.25,
  ease: "easeOut" as const,
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = 400,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const asideStyle = { width };
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.aside
            variants={slide}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={slideTransition}
            style={asideStyle}
            className="absolute right-0 top-0 flex h-full flex-col bg-white shadow-drawer dark:bg-dark-card"
          >
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
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-3 dark:border-white/10">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
