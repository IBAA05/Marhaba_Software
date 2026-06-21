import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarPlus,
  CheckCircle2,
  DollarSign,
  LogIn,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  EmptyState,
  SkeletonCard,
  StatCard,
  Spinner,
  Button,
} from "@/components/ui";
import { BookingStatusBadge, PriorityBadge } from "@/components/ui";
import {
  useActivityFeed,
  useDashboardRatings,
  useDashboardStats,
  useDashboardTasks,
  usePlatformBreakdown,
  useRecentBookings,
  useReservationsChart,
  useRevenueChart,
  useRoomAvailability,
} from "@/hooks/queries";
import {
  chartColors,
  platformColors,
  roomStatusColors,
} from "@/lib/statusColors";
import { cn, formatCurrency, formatDate, timeAgo } from "@/lib/utils";

const gridStroke = "#E5E7EB";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: availability } = useRoomAvailability();
  const { data: ratings } = useDashboardRatings();
  const { data: revenue } = useRevenueChart();
  const { data: platforms } = usePlatformBreakdown();
  const { data: reservations } = useReservationsChart();
  const { data: tasks } = useDashboardTasks();
  const { data: recent } = useRecentBookings();
  const { data: activities } = useActivityFeed();
  const [period] = useState("Last 6 Months");

  return (
    <div className="space-y-6">
      {/* Row 1 - Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="New Bookings Today"
              value={stats?.new_bookings_today ?? 0}
              trend={stats?.new_bookings_trend}
              icon={<CalendarPlus className="h-5 w-5" />}
            />
            <StatCard
              label="Check-ins Today"
              value={stats?.checkins_today ?? 0}
              trend={stats?.checkins_trend}
              icon={<LogIn className="h-5 w-5" />}
            />
            <StatCard
              label="Check-outs Today"
              value={stats?.checkouts_today ?? 0}
              trend={stats?.checkouts_trend}
              icon={<ArrowUpFromLine className="h-5 w-5" />}
            />
            <StatCard
              label="Net Revenue"
              value={stats?.net_revenue ?? 0}
              trend={stats?.revenue_trend}
              format={(v) => formatCurrency(v)}
              icon={<DollarSign className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Row 2 - Availability + Rating */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65%_35%]">
        <Card>
          <CardHeader title="Room Availability" />
          <div className="grid grid-cols-4 gap-4">
            <AvailabilityBlock
              label="Occupied"
              value={availability?.occupied ?? 0}
              color={roomStatusColors.occupied}
            />
            <AvailabilityBlock
              label="Reserved"
              value={availability?.reserved ?? 0}
              color={roomStatusColors.reserved}
            />
            <AvailabilityBlock
              label="Available"
              value={availability?.available ?? 0}
              color={roomStatusColors.available}
            />
            <AvailabilityBlock
              label="Need Ready"
              value={availability?.need_ready ?? 0}
              color={roomStatusColors.need_ready}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Overall Rating" />
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-heading text-4xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
                {(ratings?.average ?? 0).toFixed(1)}
              </p>
              <p className="text-xs text-brand-muted">out of 5</p>
            </div>
            <span className="rounded-full bg-gold-50 px-3 py-1 text-sm font-medium text-gold-dark">
              {ratings?.label ?? "Impressive"}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {(ratings?.breakdown ?? []).map((b) => (
              <RatingBar key={b.label} label={b.label} value={b.score} />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3 - Revenue area + Platform donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_40%]">
        <Card>
          <CardHeader
            title="Revenue"
            action={
              <span className="rounded-lg border border-brand-border px-3 py-1 text-xs text-brand-muted">
                {period}
              </span>
            }
          />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue ?? []}>
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartColors.primary}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.primary}
                strokeWidth={2.5}
                fill="url(#goldFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Booking by Platform" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={platforms ?? []}
                dataKey="count"
                nameKey="platform"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {(platforms ?? []).map((p) => (
                  <Cell
                    key={p.platform}
                    fill={platformColors[p.platform] ?? chartColors.muted}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {(platforms ?? []).map((p) => (
              <div key={p.platform} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={dotStyle(
                    platformColors[p.platform] ?? chartColors.muted,
                  )}
                />
                <span className="flex-1 capitalize text-gray-600 dark:text-gray-300">
                  {p.platform.replace(/_/g, " ")}
                </span>
                <span className="font-medium tabular-nums">
                  {p.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4 - Reservations bar + Tasks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[55%_45%]">
        <Card>
          <CardHeader title="Reservations (Last 7 Days)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reservations ?? []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="booked"
                name="Booked"
                fill={chartColors.primary}
                radius={radius}
              />
              <Bar
                dataKey="cancelled"
                name="Cancelled"
                fill="#D1D5DB"
                radius={radius}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader
            title="Upcoming Tasks"
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Task
              </Button>
            }
          />
          <div className="space-y-2">
            {(tasks ?? []).length === 0 ? (
              <EmptyState title="No upcoming tasks" />
            ) : (
              (tasks ?? []).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-brand-border p-3"
                >
                  <span className="rounded-md bg-gold-50 px-2 py-1 text-xs font-medium text-gold-dark">
                    {formatDate(t.due_date)}
                  </span>
                  <p className="flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
                    {t.description || t.type}
                  </p>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Row 5 - Recent bookings + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[70%_30%]">
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-base font-semibold text-brand-ink dark:text-gray-100">
              Recent Bookings
            </h3>
            <Link
              to="/reservations"
              className="text-sm font-medium text-gold-dark hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-brand-border text-left text-xs uppercase text-brand-muted">
                  <th className="px-4 py-2 font-medium">Booking</th>
                  <th className="px-4 py-2 font-medium">Guest</th>
                  <th className="px-4 py-2 font-medium">Room</th>
                  <th className="px-4 py-2 font-medium">Nights</th>
                  <th className="px-4 py-2 font-medium">Check-in</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recent ?? []).map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-brand-border/60 hover:bg-gold-50"
                  >
                    <td className="px-4 py-2.5 font-medium text-brand-ink dark:text-gray-100">
                      {b.booking_ref}
                    </td>
                    <td className="px-4 py-2.5">{b.guest_name}</td>
                    <td className="px-4 py-2.5">
                      {b.room_number} · {b.room_type}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{b.nights}</td>
                    <td className="px-4 py-2.5">{formatDate(b.check_in)}</td>
                    <td className="px-4 py-2.5">
                      <BookingStatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent Activity" />
          <div className="max-h-[320px] space-y-3 overflow-y-auto scrollbar-thin">
            {(activities ?? []).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full",
                    activityTone(a.type),
                  )}
                >
                  <ActivityIcon type={a.type} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {a.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {timeAgo(a.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {(activities ?? []).length === 0 ? <Spinner /> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

const radius: [number, number, number, number] = [4, 4, 0, 0];

function dotStyle(color: string) {
  return { backgroundColor: color };
}

function AvailabilityBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-brand-border p-4">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={dotStyle(color)} />
        <span className="text-xs text-brand-muted">{label}</span>
      </div>
      <p className="mt-2 font-heading text-2xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const widthStyle = { width: `${(value / 5) * 100}%` };
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gold" style={widthStyle} />
      </div>
    </div>
  );
}

function activityTone(type: string) {
  if (type.includes("check_in") || type.includes("checkin"))
    return "bg-green-100 text-green-700";
  if (type.includes("check_out") || type.includes("checkout"))
    return "bg-gray-100 text-gray-600";
  if (type.includes("message")) return "bg-blue-100 text-blue-700";
  return "bg-gold-50 text-gold-dark";
}

function ActivityIcon({ type }: { type: string }) {
  if (type.includes("check_in") || type.includes("checkin"))
    return <LogIn className="h-3.5 w-3.5" />;
  if (type.includes("check_out") || type.includes("checkout"))
    return <ArrowDownToLine className="h-3.5 w-3.5" />;
  if (type.includes("message"))
    return <MessageSquare className="h-3.5 w-3.5" />;
  return <CheckCircle2 className="h-3.5 w-3.5" />;
}
