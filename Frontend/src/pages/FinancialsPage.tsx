import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Eye,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Pagination,
  Select,
  SkeletonTable,
  Table,
  type Column,
} from "@/components/ui";
import {
  useEarnings,
  useExpenseBreakdown,
  useExpenses,
  useFinancialOverview,
} from "@/hooks/queries";
import { chartColors } from "@/lib/statusColors";
import { cn, formatCurrency, formatDate, humanize } from "@/lib/utils";
import type { Expense } from "@/types";

const donutColors = [
  "#F5C842",
  "#60A5FA",
  "#4ADE80",
  "#A78BFA",
  "#F87171",
  "#9CA3AF",
];
const gridStroke = "#E5E7EB";
const barRadius: [number, number, number, number] = [4, 4, 0, 0];

export function FinancialsPage() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const { data: overview } = useFinancialOverview();
  const { data: earnings } = useEarnings(selectedYear);
  const { data: breakdown } = useExpenseBreakdown(selectedYear);
  const { data: expenses, isLoading } = useExpenses({
    page,
    limit,
    search,
    category,
    status,
  });

  const totalExpenses = (breakdown ?? []).reduce((s, b) => s + b.amount, 0);

  const columns: Column<Expense>[] = [
    {
      key: "name",
      header: "Expense Name",
      render: (e) => (
        <span className="font-medium text-brand-ink dark:text-gray-100">
          {e.name}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (e) => <Badge>{humanize(e.category)}</Badge>,
    },
    {
      key: "quantity",
      header: "Qty",
      render: (e) => <span className="tabular-nums">{e.quantity}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (e) => (
        <span className="tabular-nums">{formatCurrency(e.amount)}</span>
      ),
    },
    { key: "date", header: "Date", render: (e) => formatDate(e.date) },
    {
      key: "status",
      header: "Status",
      render: (e) => (
        <Badge color={statusColor(e.status)}>{humanize(e.status)}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex gap-1">
          <button className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50">
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50">
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const pagination = expenses?.pagination;
  const years = [year - 2, year - 1, year];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCardFin
          label="Total Balance"
          value={overview?.balance ?? 0}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCardFin
          label="Total Income"
          value={overview?.income ?? 0}
          trend={overview?.income_trend}
          positive
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
        <StatCardFin
          label="Total Expenses"
          value={overview?.expenses ?? 0}
          trend={overview?.expense_trend}
          icon={<ArrowDownRight className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65%_35%]">
        <Card>
          <CardHeader
            title="Earnings"
            action={
              <Select
                className="w-28"
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                options={years.map((y) => ({
                  value: String(y),
                  label: String(y),
                }))}
              />
            }
          />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings ?? []}>
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
              <Bar
                dataKey="income"
                name="Income"
                fill={chartColors.primary}
                radius={barRadius}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#D1D5DB"
                radius={barRadius}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Expense Breakdown" />
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={breakdown ?? []}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {(breakdown ?? []).map((b, i) => (
                    <Cell
                      key={b.category}
                      fill={donutColors[i % donutColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-brand-muted">Total</span>
              <span className="font-heading text-lg font-bold tabular-nums text-brand-ink dark:text-gray-100">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {(breakdown ?? []).map((b, i) => (
              <div key={b.category} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={dotStyle(donutColors[i % donutColors.length])}
                />
                <span className="flex-1 text-gray-600 dark:text-gray-300">
                  {humanize(b.category)}
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(b.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by expense name..."
            className="w-56 rounded-lg border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-dark-card"
          />
          <Select
            className="w-40"
            placeholder="All Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              "salaries",
              "utilities",
              "maintenance",
              "supplies",
              "marketing",
              "miscellaneous",
            ].map((c) => ({ value: c, label: humanize(c) }))}
          />
          <Select
            className="w-36"
            placeholder="All Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={["completed", "pending", "cancelled"].map((s) => ({
              value: s,
              label: humanize(s),
            }))}
          />
          <div className="flex-1" />
          <button className="flex items-center gap-1 rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-600 hover:bg-gold-50">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={7} />
          </div>
        ) : (expenses?.items ?? []).length === 0 ? (
          <EmptyState title="No transactions" />
        ) : (
          <>
            <Table
              columns={columns}
              data={expenses?.items ?? []}
              rowKey={(e) => e.id}
            />
            <Pagination
              page={page}
              pages={pagination?.pages ?? 1}
              total={pagination?.total ?? 0}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}

function dotStyle(color: string) {
  return { backgroundColor: color };
}

function statusColor(status: string) {
  if (status === "completed") return { bg: "#DCFCE7", text: "#15803D" };
  if (status === "pending") return { bg: "#FEF3C7", text: "#B45309" };
  return { bg: "#FEE2E2", text: "#B91C1C" };
}

function StatCardFin({
  label,
  value,
  trend,
  positive,
  icon,
}: {
  label: string;
  value: number;
  trend?: number;
  positive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card goldBorder>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
            {formatCurrency(value)}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-dark">
          {icon}
        </span>
      </div>
      {trend != null ? (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            positive ? "text-status-success" : "text-status-danger",
          )}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
        </p>
      ) : null}
    </Card>
  );
}
