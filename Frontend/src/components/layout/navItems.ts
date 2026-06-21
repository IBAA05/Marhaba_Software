import {
  CalendarDays,
  ClipboardList,
  ConciergeBell,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: Role[];
  badgeKey?: "messages";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Reservations", to: "/reservations", icon: CalendarDays },
      { label: "Rooms", to: "/rooms", icon: Sparkles },
      { label: "Guests", to: "/guests", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Messages",
        to: "/messages",
        icon: MessageSquare,
        badgeKey: "messages",
      },
      { label: "Housekeeping", to: "/housekeeping", icon: ClipboardList },
      { label: "Inventory", to: "/inventory", icon: Package },
      { label: "Calendar", to: "/calendar", icon: CalendarDays },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Financials",
        to: "/financials",
        icon: Wallet,
        roles: ["super_admin"],
      },
      { label: "Invoices", to: "/invoices", icon: Receipt },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Reviews", to: "/reviews", icon: Star },
      { label: "Concierge", to: "/concierge", icon: ConciergeBell },
      {
        label: "Settings",
        to: "/settings",
        icon: Settings,
        roles: ["super_admin"],
      },
    ],
  },
];

export const financeIcons = { CreditCard };
