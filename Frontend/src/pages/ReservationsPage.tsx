import { useMemo, useRef, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfYear,
  format,
  isSameDay,
  isToday,
  startOfYear,
} from "date-fns";
import {
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button, FullSpinner, Input } from "@/components/ui";
import { useGantt } from "@/hooks/queries";
import {
  bookingStatusColors,
  bookingStatusOrder,
  roomStatusColors,
} from "@/lib/statusColors";
import { cn, humanize } from "@/lib/utils";
import type { Booking, GanttRoom, GanttRoomType } from "@/types";

const DAY_WIDTH = 120;
const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ReservationsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [prefill, setPrefill] = useState<
    { roomId?: number; date?: string } | undefined
  >();
  const scrollRef = useRef<HTMLDivElement>(null);

  const rangeStart = startOfYear(new Date(year, 0, 1));
  const rangeEnd = endOfYear(new Date(year, 0, 1));
  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [year],
  );

  const { data, isLoading, refetch, isFetching } = useGantt({
    start: format(rangeStart, "yyyy-MM-dd"),
    end: format(rangeEnd, "yyyy-MM-dd"),
    search: search || undefined,
  });

  const scrollToMonth = (monthIdx: number) => {
    const offset = differenceInCalendarDays(
      new Date(year, monthIdx, 1),
      rangeStart,
    );
    scrollRef.current?.scrollTo({
      left: offset * DAY_WIDTH,
      behavior: "smooth",
    });
  };

  const gridWidthStyle = { width: days.length * DAY_WIDTH };

  if (isLoading) return <FullSpinner label="Loading reservations timeline" />;

  const roomTypes = data?.room_types ?? [];

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col rounded-xl border border-brand-border bg-white dark:bg-dark-card dark:border-white/10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border p-3 dark:border-white/10">
        <FilterPill label="Housekeeping" />
        <FilterPill label="Facilities" />
        <FilterPill label="Room Types" />
        <FilterPill label="Booking Options" />
        <div className="flex-1" />
        <div className="w-64">
          <Input
            placeholder="Search by booking number or guest"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => refetch()}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold text-gold-dark transition hover:bg-gold-50"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </button>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setPrefill(undefined);
            setAddOpen(true);
          }}
        >
          Add Booking
        </Button>
      </div>

      {/* Year navigator */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-brand-border px-3 py-2 dark:border-white/10">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition",
              y === year
                ? "bg-gold text-brand-ink"
                : "text-gray-500 hover:bg-gold-50",
            )}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Month row */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-brand-border px-3 py-2 dark:border-white/10">
        {months.map((m, i) => (
          <button
            key={m}
            onClick={() => scrollToMonth(i)}
            className="rounded-md px-3 py-1 text-sm text-gray-500 transition hover:bg-gold-50 hover:text-gold-dark"
          >
            {m}
          </button>
        ))}
      </div>

      {/* Gantt body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed left column */}
        <div className="w-[220px] shrink-0 overflow-y-auto border-r border-brand-border dark:border-white/10">
          <div className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-brand-border bg-gray-50 px-3 text-sm font-semibold text-brand-ink dark:bg-white/5 dark:text-gray-100 dark:border-white/10">
            Rooms
            <ChevronDown className="h-4 w-4" />
          </div>
          {roomTypes.map((rt) => (
            <div key={rt.id}>
              <button
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [rt.id]: !c[rt.id] }))
                }
                className="flex h-10 w-full items-center gap-2 border-b border-brand-border bg-gray-50/50 px-2 text-left text-sm font-medium text-brand-ink dark:bg-white/[0.02] dark:text-gray-200 dark:border-white/10"
              >
                <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                <span className="flex-1 truncate">{humanize(rt.name)}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition",
                    collapsed[rt.id] && "-rotate-90",
                  )}
                />
              </button>
              {!collapsed[rt.id] &&
                rt.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex h-12 items-center gap-2 border-b border-brand-border/60 px-3 pl-6 text-sm dark:border-white/10"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={dotStyle(
                        roomStatusColors[room.status] ?? "#9CA3AF",
                      )}
                    />
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                      {room.room_number}
                    </span>
                    <MoreHorizontal className="h-4 w-4 text-gray-300" />
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin">
          <div style={gridWidthStyle}>
            {/* Day headers */}
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-card">
              <div className="flex border-b border-brand-border dark:border-white/10">
                {monthSpans(days).map((span) => (
                  <div
                    key={span.label}
                    style={widthStyle(span.count * DAY_WIDTH)}
                    className="shrink-0 border-r border-brand-border px-2 py-1 text-xs font-semibold text-brand-ink dark:text-gray-200 dark:border-white/10"
                  >
                    {span.label}
                  </div>
                ))}
              </div>
              <div className="flex border-b border-brand-border dark:border-white/10">
                {days.map((d) => (
                  <div
                    key={d.toISOString()}
                    style={widthStyle(DAY_WIDTH)}
                    className={cn(
                      "shrink-0 border-r border-brand-border/60 px-1 py-1 text-center text-[11px] dark:border-white/10",
                      isToday(d)
                        ? "bg-gold-50 font-semibold text-gold-dark"
                        : "text-gray-500",
                    )}
                  >
                    {format(d, "EEE d")}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {roomTypes.map((rt) => (
              <div key={rt.id}>
                {/* Availability counter row */}
                <div className="flex h-10 border-b border-brand-border bg-gray-50/50 dark:bg-white/[0.02] dark:border-white/10">
                  {days.map((d) => {
                    const avail = availabilityFor(rt, d);
                    return (
                      <div
                        key={d.toISOString()}
                        style={widthStyle(DAY_WIDTH)}
                        className="flex shrink-0 items-center justify-center border-r border-brand-border/40 dark:border-white/10"
                      >
                        <span
                          className="flex h-6 w-7 items-center justify-center rounded text-[11px] font-semibold"
                          style={availStyle(avail, rt.total_rooms)}
                        >
                          {avail}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Room booking rows */}
                {!collapsed[rt.id] &&
                  rt.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="relative h-12 border-b border-brand-border/60 dark:border-white/10"
                    >
                      {/* day cells for click-to-add */}
                      <div className="flex h-full">
                        {days.map((d) => (
                          <div
                            key={d.toISOString()}
                            style={widthStyle(DAY_WIDTH)}
                            onClick={() => {
                              setPrefill({
                                roomId: room.id,
                                date: format(d, "yyyy-MM-dd"),
                              });
                              setAddOpen(true);
                            }}
                            className={cn(
                              "shrink-0 cursor-pointer border-r border-brand-border/30 transition hover:bg-gold-50/40 dark:border-white/5",
                              isToday(d) && "bg-gold-50/30",
                            )}
                          />
                        ))}
                      </div>
                      {/* booking bars */}
                      {room.bookings.map((b) => {
                        const pos = barPosition(b, days[0]);
                        if (!pos) return null;
                        const colors = bookingStatusColors[b.status];
                        return (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            title={`${b.guest_name} · ${b.booking_ref} · ${humanize(b.status)}`}
                            style={barStyle(
                              pos.left,
                              pos.width,
                              colors.bg,
                              colors.text,
                            )}
                            className="absolute top-1.5 flex h-9 items-center overflow-hidden rounded-full px-3 text-xs font-medium shadow-sm transition hover:brightness-95"
                          >
                            <span className="truncate">{b.guest_name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend bar */}
      <div className="flex flex-wrap items-center gap-2 border-t border-brand-border px-3 py-2 dark:border-white/10">
        {bookingStatusOrder.map((status) => (
          <span
            key={status}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={legendStyle(
              bookingStatusColors[status].bg,
              bookingStatusColors[status].text,
            )}
          >
            {humanize(status)}
          </span>
        ))}
      </div>

      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
      <AddBookingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        prefill={prefill}
      />
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-full border border-brand-border px-3 py-1.5 text-sm text-gray-600 transition hover:border-gold dark:text-gray-300">
      {label}
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function dotStyle(color: string) {
  return { backgroundColor: color };
}
function widthStyle(width: number) {
  return { width, minWidth: width };
}
function barStyle(left: number, width: number, bg: string, color: string) {
  return { left, width: Math.max(width - 6, 24), backgroundColor: bg, color };
}
function legendStyle(bg: string, color: string) {
  return { backgroundColor: bg, color };
}
function availStyle(avail: number, total: number) {
  if (total === 0) return { backgroundColor: "#E5E7EB", color: "#374151" };
  if (avail <= 0) return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
  return { backgroundColor: "#BBF7D0", color: "#15803D" };
}

function monthSpans(days: Date[]) {
  const spans: { label: string; count: number }[] = [];
  days.forEach((d) => {
    const label = format(d, "MMM yyyy");
    const last = spans[spans.length - 1];
    if (last && last.label === label) last.count += 1;
    else spans.push({ label, count: 1 });
  });
  return spans;
}

function availabilityFor(rt: GanttRoomType, day: Date) {
  const booked = rt.rooms.filter((room) =>
    room.bookings.some(
      (b) =>
        new Date(b.check_in) <= day &&
        new Date(b.check_out) > day &&
        b.status !== "cancelled",
    ),
  ).length;
  const outOfOrder = rt.rooms.filter((r) => r.status === "out_of_order").length;
  return Math.max(rt.total_rooms - booked - outOfOrder, 0);
}

function barPosition(b: Booking, gridStart: Date) {
  const start = new Date(b.check_in);
  const end = new Date(b.check_out);
  const startOffset = differenceInCalendarDays(start, gridStart);
  const nights = Math.max(differenceInCalendarDays(end, start), 1);
  if (startOffset + nights < 0) return null;
  return { left: startOffset * DAY_WIDTH + 3, width: nights * DAY_WIDTH };
}

void addDays;
void isSameDay;
export type { GanttRoom };

export function BookingDetailDrawer({ booking, onClose }: any) {
  return null;
}
export function AddBookingModal({ open, onClose, prefill }: any) {
  return null;
}
