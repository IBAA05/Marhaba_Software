import { Badge } from "./Badge";
import { humanize } from "@/lib/utils";
import {
  bookingStatusColors,
  invoiceStatusColors,
  loyaltyColors,
  priorityColors,
  stockStatusColors,
  taskStatusColors,
} from "@/lib/statusColors";
import type {
  BookingStatus,
  InvoiceStatus,
  LoyaltyTier,
  Priority,
  StockStatus,
  TaskStatus,
} from "@/types";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge color={bookingStatusColors[status]}>{humanize(status)}</Badge>;
}
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge color={taskStatusColors[status]}>{humanize(status)}</Badge>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge color={priorityColors[priority]}>{humanize(priority)}</Badge>;
}
export function StockStatusBadge({ status }: { status: StockStatus }) {
  return <Badge color={stockStatusColors[status]}>{humanize(status)}</Badge>;
}
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge color={invoiceStatusColors[status]}>{humanize(status)}</Badge>;
}
export function LoyaltyBadge({ tier }: { tier: LoyaltyTier }) {
  return <Badge color={loyaltyColors[tier]}>{humanize(tier)}</Badge>;
}
