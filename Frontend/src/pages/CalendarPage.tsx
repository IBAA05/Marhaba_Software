import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BookingStatusBadge,
  Card,
  Drawer,
  EmptyState,
  FullSpinner,
} from "@/components/ui";
import { useCalendarDay, useCalendarMonth } from "@/hooks/queries";
import { cn, formatDate, humanize } from "@/lib/utils";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data, isLoading } = useCalendarMonth({
    year: cursor.getFullYear(),
    month: cursor.getMonth() + 1,
  });
  const { data: dayData } = useCalendarDay(selectedDay);

  const gridStart = startOfWeek(startOfMonth(cursor));
  const gridEnd =
    view === "week" ? endOfWeek(cursor) : endOfWeek(endOfMonth(cursor));
  const start = view === "week" ? startOfWeek(cursor) : gridStart;
  const days = eachDayOfInterval({ start, end: gridEnd });
  const byDate = data?.days ?? {};

  if (isLoading) return <FullSpinner label="Loading calendar" />;

  return (
    <div className="space-y-5">
      <Card padded={false}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor((c) => subMonths(c, 1))}
              className="rounded-lg border border-brand-border p-1.5 hover:bg-gold-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[180px] text-center font-heading text-lg font-bold text-brand-ink dark:text-gray-100">
              {format(cursor, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCursor((c) => addMonths(c, 1))}
              className="rounded-lg border border-brand-border p-1.5 hover:bg-gold-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex rounded-lg border border-brand-border p-0.5">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm capitalize",
                  view === v ? "bg-gold text-brand-ink" : "text-gray-500",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-brand-border">
          {weekDays.map((d) => (
            <div
              key={d}
              className="border-b border-r border-brand-border py-2 text-center text-xs font-semibold uppercase text-brand-muted last:border-r-0"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const info = byDate[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={cn(
                  "min-h-[110px] border-b border-r border-brand-border p-2 text-left transition last:border-r-0 hover:bg-gold-50/40",
                  !isSameMonth(day, cursor) &&
                    view === "month" &&
                    "bg-gray-50/50 text-gray-400",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums",
                    isToday(day) && "bg-gold font-semibold text-brand-ink",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {info?.bookings ? (
                    <Chip
                      color="bg-blue-100 text-blue-700"
                      label={`${info.bookings} bookings`}
                    />
                  ) : null}
                  {info?.check_ins ? (
                    <Chip
                      color="bg-green-100 text-green-700"
                      label={`${info.check_ins} check-ins`}
                    />
                  ) : null}
                  {info?.check_outs ? (
                    <Chip
                      color="bg-gray-100 text-gray-600"
                      label={`${info.check_outs} check-outs`}
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Drawer
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatDate(selectedDay) : ""}
      >
        {dayData ? (
          <div className="space-y-5">
            <Section title="Arrivals" items={dayData.arrivals ?? []} />
            <Section title="Departures" items={dayData.departures ?? []} />
            {(dayData.arrivals ?? []).length === 0 &&
            (dayData.departures ?? []).length === 0 ? (
              <EmptyState title="Nothing scheduled" />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Loading...</p>
        )}
      </Drawer>
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={cn(
        "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
        color,
      )}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: number;
    guest_name: string;
    room_number: string;
    booking_ref: string;
    status: string;
  }>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-brand-ink dark:text-gray-100">
                {b.guest_name}
              </p>
              <p className="text-xs text-brand-muted">
                Room {b.room_number} · {b.booking_ref}
              </p>
            </div>
            <BookingStatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

void humanize;
