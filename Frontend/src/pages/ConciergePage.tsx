import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  Input,
  Pagination,
  PriorityBadge,
  Select,
  SkeletonTable,
  Table,
  Textarea,
  type Column,
} from "@/components/ui";
import {
  useConcierge,
  useConciergeMutations,
  useConciergePending,
  useGuests,
} from "@/hooks/queries";
import { formatDateTime, humanize } from "@/lib/utils";
import type { ConciergeRequest, Priority, RequestType } from "@/types";

const requestTypes: RequestType[] = [
  "airport_transfer",
  "restaurant_reservation",
  "spa",
  "wake_up_call",
  "extra_amenities",
  "laundry",
  "room_service",
  "custom",
];
const priorities: Priority[] = ["low", "medium", "high", "urgent"];
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#B45309" },
  in_progress: { bg: "#DBEAFE", text: "#1D4ED8" },
  completed: { bg: "#DCFCE7", text: "#15803D" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C" },
};

const schema = z.object({
  guest_id: z.string().min(1, "Select a guest"),
  type: z.string(),
  description: z.string().min(1, "Required"),
  priority: z.string(),
  assigned_to: z.string().optional(),
  scheduled_at: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ConciergePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, isLoading } = useConcierge({ page, limit });
  const { data: pending } = useConciergePending();
  const { create } = useConciergeMutations();
  const { data: guests } = useGuests({ limit: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guest_id: "",
      type: "airport_transfer",
      description: "",
      priority: "medium",
      assigned_to: "",
      scheduled_at: "",
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        ...values,
        guest_id: Number(values.guest_id),
        type: values.type as RequestType,
        priority: values.priority as Priority,
      },
      {
        onSuccess: () => {
          setDrawerOpen(false);
          reset();
        },
      },
    );
  };

  const columns: Column<ConciergeRequest>[] = [
    {
      key: "request_number",
      header: "Request #",
      render: (r) => (
        <span className="font-medium text-brand-ink dark:text-gray-100">
          {r.request_number}
        </span>
      ),
    },
    { key: "guest_name", header: "Guest", render: (r) => r.guest_name },
    { key: "room_number", header: "Room", render: (r) => r.room_number ?? "—" },
    {
      key: "type",
      header: "Type",
      render: (r) => <Badge>{humanize(r.type)}</Badge>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      key: "assigned_to",
      header: "Assigned",
      render: (r) => r.assigned_to ?? "Unassigned",
    },
    {
      key: "scheduled_at",
      header: "Scheduled",
      render: (r) => (r.scheduled_at ? formatDateTime(r.scheduled_at) : "—"),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge color={statusColors[r.status]}>{humanize(r.status)}</Badge>
      ),
    },
  ];

  const pagination = data?.pagination;
  const completedToday = data?.completed_today ?? 0;
  const inProgress = data?.in_progress ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 grid-cols-3 gap-4">
          <Card goldBorder>
            <p className="text-sm text-brand-muted">Pending</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-status-warning">
              {pending?.length ?? 0}
            </p>
          </Card>
          <Card goldBorder>
            <p className="text-sm text-brand-muted">In Progress</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-status-info">
              {inProgress}
            </p>
          </Card>
          <Card goldBorder>
            <p className="text-sm text-brand-muted">Completed Today</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-status-success">
              {completedToday}
            </p>
          </Card>
        </div>
        <Button
          className="ml-4"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setDrawerOpen(true)}
        >
          Add Request
        </Button>
      </div>

      <Card padded={false}>
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={8} />
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <EmptyState title="No concierge requests" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.items ?? []}
              rowKey={(r) => r.id}
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

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={create.isPending}>
              Save Request
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Guest"
            placeholder="Select a guest"
            error={errors.guest_id?.message}
            options={(guests?.items ?? []).map((g) => ({
              value: String(g.id),
              label: `${g.first_name} ${g.last_name}`,
            }))}
            {...register("guest_id")}
          />
          <Select
            label="Request Type"
            options={requestTypes.map((t) => ({
              value: t,
              label: humanize(t),
            }))}
            {...register("type")}
          />
          <Textarea
            label="Description"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={priorities.map((p) => ({
                value: p,
                label: humanize(p),
              }))}
              {...register("priority")}
            />
            <Input
              label="Assign To"
              placeholder="Staff name"
              {...register("assigned_to")}
            />
          </div>
          <Input
            type="datetime-local"
            label="Scheduled Date/Time"
            {...register("scheduled_at")}
          />
          <Textarea label="Notes" rows={2} {...register("notes")} />
        </form>
      </Drawer>
    </div>
  );
}
