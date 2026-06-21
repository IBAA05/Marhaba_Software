import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  MessageSquare,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Card,
  EmptyState,
  LoyaltyBadge,
  Pagination,
  SkeletonTable,
  Table,
  type Column,
  Button,
} from "@/components/ui";
import { useGuests, useGuestMutations } from "@/hooks/queries";
import { formatDate } from "@/lib/utils";
import type { Guest } from "@/types";

export function GuestsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("last_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { data, isLoading } = useGuests({
    page,
    limit,
    search,
    sort: sortKey,
    order: sortDir,
  });
  const { remove } = useGuestMutations();

  const onSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const columns: Column<Guest>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (g) => <span className="tabular-nums">#{g.id}</span>,
      },
      {
        key: "last_name",
        header: "Name",
        sortable: true,
        render: (g) => (
          <span className="font-medium text-brand-ink dark:text-gray-100">
            {g.first_name} {g.last_name}
          </span>
        ),
      },
      {
        key: "nationality",
        header: "Nationality",
        render: (g) => g.nationality ?? "—",
      },
      { key: "phone", header: "Phone", render: (g) => g.phone ?? "—" },
      { key: "email", header: "Email", render: (g) => g.email },
      {
        key: "loyalty_tier",
        header: "Loyalty",
        render: (g) => <LoyaltyBadge tier={g.loyalty_tier} />,
      },
      {
        key: "last_stay",
        header: "Last Stay",
        sortable: true,
        render: (g) => (g.last_stay ? formatDate(g.last_stay) : "—"),
      },
      {
        key: "total_stays",
        header: "Stays",
        sortable: true,
        render: (g) => <span className="tabular-nums">{g.total_stays}</span>,
      },
      {
        key: "actions",
        header: "",
        render: (g) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <IconBtn title="View" onClick={() => navigate(`/guests/${g.id}`)}>
              <Eye className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Message" onClick={() => navigate("/messages")}>
              <MessageSquare className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Edit" onClick={() => navigate(`/guests/${g.id}`)}>
              <Edit className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Delete" danger onClick={() => remove.mutate(g.id)}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        ),
      },
    ],
    [navigate, remove],
  );

  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatChip label="Total Guests" value={pagination?.total ?? 0} />
        <StatChip label="Active Stays" value={data?.active_stays ?? 0} />
        <StatChip label="New This Month" value={data?.new_this_month ?? 0} />
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between gap-3 p-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search guests..."
            className="w-64 rounded-lg border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-dark-card"
          />
          <Button
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => navigate("/guests")}
          >
            Add Guest
          </Button>
        </div>
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={8} />
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No guests found"
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Guest</Button>
            }
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.items ?? []}
              rowKey={(g) => g.id}
              onRowClick={(g) => navigate(`/guests/${g.id}`)}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
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

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <Card goldBorder>
      <p className="text-sm text-brand-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
        {value}
      </p>
    </Card>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={
        "rounded-md p-1.5 transition hover:bg-gold-50 " +
        (danger
          ? "text-status-danger hover:bg-status-danger/10"
          : "text-gray-500")
      }
    >
      {children}
    </button>
  );
}
