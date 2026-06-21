import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  PriorityBadge,
  Select,
  SkeletonTable,
  TaskStatusBadge,
} from "@/components/ui";
import { useBoard, useTasks, useTaskMutations } from "@/hooks/queries";
import { cn, formatTime, humanize } from "@/lib/utils";
import type { TaskStatus } from "@/types";

const statusBg: Record<string, string> = {
  clean: "bg-green-50 border-green-200",
  completed: "bg-green-50 border-green-200",
  inspected: "bg-blue-50 border-blue-200",
  dirty: "bg-red-50 border-red-200",
  pending: "bg-red-50 border-red-200",
  in_progress: "bg-amber-50 border-amber-200",
  out_of_order: "bg-red-100 border-red-300",
};
const statusFlow: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "inspected",
];

export function HousekeepingPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("");
  const { data: board, isLoading: boardLoading } = useBoard({ floor, status });
  const { data: tasks, isLoading: tasksLoading } = useTasks({ floor, status });
  const { updateStatus } = useTaskMutations();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-36"
          placeholder="All Floors"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          options={[1, 2, 3, 4, 5].map((f) => ({
            value: String(f),
            label: `Floor ${f}`,
          }))}
        />
        <Select
          className="w-40"
          placeholder="All Statuses"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusFlow.map((s) => ({ value: s, label: humanize(s) }))}
        />
        <div className="flex-1" />
        <div className="flex rounded-lg border border-brand-border p-0.5">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm",
              view === "board" ? "bg-gold text-brand-ink" : "text-gray-500",
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm",
              view === "list" ? "bg-gold text-brand-ink" : "text-gray-500",
            )}
          >
            <List className="h-4 w-4" /> List
          </button>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Task</Button>
      </div>

      {view === "board" ? (
        boardLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : (board ?? []).length === 0 ? (
          <Card>
            <EmptyState title="No rooms to clean" />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {(board ?? []).map((room) => (
              <div
                key={room.id}
                className={cn(
                  "rounded-xl border p-4",
                  statusBg[room.status] ?? "bg-white border-brand-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-heading text-lg font-bold text-brand-ink">
                    Room {room.room_number}
                  </p>
                  <TaskStatusBadge
                    status={(room.task_status ?? "pending") as TaskStatus}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {humanize(room.type)} · Floor {room.floor}
                </p>
                {room.assigned_to ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Avatar name={room.assigned_to} size="sm" />
                    <span className="text-xs text-gray-600">
                      {room.assigned_to}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )
      ) : (
        <Card padded={false}>
          {tasksLoading ? (
            <div className="p-4">
              <SkeletonTable rows={8} cols={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-xs uppercase text-brand-muted">
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Task Type</th>
                    <th className="px-4 py-3 font-medium">Assigned To</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Due Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tasks?.items ?? []).map((t) => (
                    <tr key={t.id} className="border-b border-brand-border/60">
                      <td className="px-4 py-3 font-medium">{t.room_number}</td>
                      <td className="px-4 py-3">{humanize(t.type)}</td>
                      <td className="px-4 py-3">
                        {t.assigned_to ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        {t.due_time ? formatTime(t.due_time) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <TaskStatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        <NextStepButton
                          status={t.status}
                          onAdvance={(next) =>
                            updateStatus.mutate({ id: t.id, status: next })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function NextStepButton({
  status,
  onAdvance,
}: {
  status: TaskStatus;
  onAdvance: (next: TaskStatus) => void;
}) {
  const idx = statusFlow.indexOf(status);
  const next = statusFlow[idx + 1];
  if (!next) return <span className="text-xs text-brand-muted">Done</span>;
  return (
    <Button size="sm" variant="secondary" onClick={() => onAdvance(next)}>
      Mark {humanize(next)}
    </Button>
  );
}
