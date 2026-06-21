import type {
  BookingStatus,
  InvoiceStatus,
  LoyaltyTier,
  Priority,
  RoomStatus,
  StockStatus,
  TaskStatus,
} from "@/types";

export interface BadgeColor {
  bg: string;
  text: string;
}

/** Exact booking status colors from the Gantt legend in the spec. */
export const bookingStatusColors: Record<BookingStatus, BadgeColor> = {
  new: { bg: "#FDE68A", text: "#D97706" },
  confirmed: { bg: "#BFDBFE", text: "#1D4ED8" },
  due_in: { bg: "#BBF7D0", text: "#15803D" },
  checked_in: { bg: "#D9F99D", text: "#4D7C0F" },
  due_out: { bg: "#FED7AA", text: "#C2410C" },
  checked_out: { bg: "#E5E7EB", text: "#374151" },
  booking_offer: { bg: "#EDE9FE", text: "#6D28D9" },
  out_of_order: { bg: "#FEE2E2", text: "#B91C1C" },
  cancelled: { bg: "#F3F4F6", text: "#9CA3AF" },
};

export const bookingStatusOrder: BookingStatus[] = [
  "new",
  "confirmed",
  "due_in",
  "checked_in",
  "due_out",
  "checked_out",
  "booking_offer",
  "out_of_order",
];

/** Room status dot colors for the Gantt left column + housekeeping board. */
export const roomStatusColors: Record<RoomStatus, string> = {
  available: "#4ADE80",
  occupied: "#60A5FA",
  reserved: "#A78BFA",
  out_of_order: "#F87171",
  need_ready: "#F59E0B",
  cleaning: "#FCD34D",
};

export const taskStatusColors: Record<TaskStatus, BadgeColor> = {
  pending: { bg: "#FEF3C7", text: "#B45309" },
  in_progress: { bg: "#FED7AA", text: "#C2410C" },
  completed: { bg: "#BBF7D0", text: "#15803D" },
  inspected: { bg: "#BFDBFE", text: "#1D4ED8" },
};

export const priorityColors: Record<Priority, BadgeColor> = {
  low: { bg: "#F3F4F6", text: "#6B7280" },
  medium: { bg: "#DBEAFE", text: "#1D4ED8" },
  high: { bg: "#FEF3C7", text: "#B45309" },
  urgent: { bg: "#FEE2E2", text: "#B91C1C" },
};

export const stockStatusColors: Record<StockStatus, BadgeColor> = {
  sufficient: { bg: "#BBF7D0", text: "#15803D" },
  low_stock: { bg: "#FEF3C7", text: "#B45309" },
  out_of_stock: { bg: "#FEE2E2", text: "#B91C1C" },
};

export const invoiceStatusColors: Record<InvoiceStatus, BadgeColor> = {
  paid: { bg: "#BBF7D0", text: "#15803D" },
  pending: { bg: "#FEF3C7", text: "#B45309" },
  overdue: { bg: "#FEE2E2", text: "#B91C1C" },
};

export const loyaltyColors: Record<LoyaltyTier, BadgeColor> = {
  none: { bg: "#F3F4F6", text: "#6B7280" },
  bronze: { bg: "#F5E6D3", text: "#CD7F32" },
  silver: { bg: "#EEF2F7", text: "#8A8A8A" },
  gold: { bg: "#FFFBEB", text: "#B8860B" },
};

/** Recharts palette. */
export const chartColors = {
  primary: "#F5C842",
  secondary: "#60A5FA",
  tertiary: "#4ADE80",
  quaternary: "#A78BFA",
  quinary: "#F87171",
  muted: "#D1D5DB",
};

export const platformColors: Record<string, string> = {
  direct: chartColors.primary,
  booking_com: chartColors.secondary,
  airbnb: chartColors.quinary,
  expedia: chartColors.quaternary,
  agoda: chartColors.tertiary,
  other: chartColors.muted,
};
