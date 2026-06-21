import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Hotel, LogOut } from "lucide-react";
import { navSections } from "./navItems";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useUnreadCount } from "@/hooks/queries";
import { useLogout } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui";
import { cn, humanize } from "@/lib/utils";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);
  const { data: unread } = useUnreadCount();
  const logout = useLogout();

  const width = collapsed ? 70 : 260;
  const asideStyle = { width };

  return (
    <motion.aside
      animate={asideStyle}
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-brand-border bg-white dark:bg-dark-card dark:border-white/10"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-brand-border px-4 dark:border-white/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-ink text-gold">
          <Hotel className="h-5 w-5" />
        </div>
        {!collapsed ? (
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-heading text-base font-bold text-brand-ink dark:text-gray-100">
              Luxe Hotel
            </p>
            <p className="truncate text-[11px] text-brand-muted">
              Management Suite
            </p>
          </div>
        ) : null}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-gray-400 transition hover:bg-gold-50"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navSections.map((section) => {
          const items = section.items.filter(
            (item) => !item.roles || (user && item.roles.includes(user.role)),
          );
          if (items.length === 0) return null;
          return (
            <div key={section.title}>
              {!collapsed ? (
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const showBadge =
                    item.badgeKey === "messages" &&
                    (unread?.unread_count ?? 0) > 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "border-l-[3px] border-gold bg-gold-50 text-gold-dark"
                            : "border-l-[3px] border-transparent text-gray-600 hover:bg-gold-50 dark:text-gray-300",
                        )
                      }
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed ? (
                        <span className="flex-1 truncate">{item.label}</span>
                      ) : null}
                      {showBadge ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-danger px-1.5 text-[11px] font-semibold text-white">
                          {unread?.unread_count}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-brand-border p-3 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Avatar name={user?.full_name} src={user?.avatar_url} size="sm" />
          {!collapsed ? (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-brand-ink dark:text-gray-100">
                {user?.full_name}
              </p>
              <p className="truncate text-[11px] text-brand-muted">
                {humanize(user?.role)}
              </p>
            </div>
          ) : null}
          <button
            onClick={() => logout.mutate()}
            title="Logout"
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-status-danger/10 hover:text-status-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
