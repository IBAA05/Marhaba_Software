import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useThemeStore } from "@/stores/themeStore";

const pageMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const location = useLocation();
  const mainStyle = { marginLeft: collapsed ? 70 : 260 };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-dark-bg">
      <Sidebar />
      <div
        style={mainStyle}
        className="flex min-h-screen flex-col transition-[margin] duration-200"
      >
        <Topbar />
        <main className="min-w-[1180px] flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageMotion}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const pageTransition = { duration: 0.2, ease: "easeOut" as const };
