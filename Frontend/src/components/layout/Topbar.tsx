import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Moon, Search, Sun, User as UserIcon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useUnreadNotifications } from "@/hooks/queries";
import { Avatar } from "@/components/ui";
import { titleFromPath } from "@/lib/utils";
import { CommandPalette } from "./CommandPalette";

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titleFromPath(location.pathname);
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: notifications } = useUnreadNotifications();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadNotif = notifications?.length ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-brand-border bg-white px-6 dark:bg-dark-card dark:border-white/10">
      <h1 className="font-heading text-lg font-bold text-brand-ink dark:text-gray-100">
        {title}
      </h1>

      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex w-full items-center gap-2 rounded-full border border-brand-border bg-gray-50 px-4 py-2 text-sm text-gray-400 transition hover:border-gold dark:bg-white/5"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">
            Search guest, room, booking...
          </span>
          <kbd className="rounded border border-brand-border bg-white px-1.5 text-[11px] text-gray-500 dark:bg-dark-card">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-gray-500 transition hover:bg-gold-50"
        >
          <Bell className="h-5 w-5" />
          {unreadNotif > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-semibold text-white">
              {unreadNotif}
            </span>
          ) : null}
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 transition hover:bg-gold-50"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((v) => !v)}>
            <Avatar name={user?.full_name} src={user?.avatar_url} size="sm" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-brand-border bg-white py-1 shadow-lg dark:bg-dark-card dark:border-white/10">
              <MenuItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Profile"
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={
                  theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )
                }
                label={theme === "dark" ? "Light Mode" : "Dark Mode"}
                onClick={toggleTheme}
              />
              <div className="my-1 border-t border-brand-border dark:border-white/10" />
              <MenuItem label="Logout" danger onClick={() => logout.mutate()} />
            </div>
          ) : null}
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gold-50 " +
        (danger ? "text-status-danger" : "text-gray-700 dark:text-gray-200")
      }
    >
      {icon}
      {label}
    </button>
  );
}
