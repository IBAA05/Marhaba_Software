import { Bell, Check } from "lucide-react";
import { Card, EmptyState, FullSpinner } from "@/components/ui";
import { useNotifications } from "@/hooks/queries";
import { notificationsApi } from "@/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { humanize, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const qc = useQueryClient();

  const markRead = async (id: number) => {
    await notificationsApi.markRead(id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  if (isLoading) return <FullSpinner label="Loading notifications" />;

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4 dark:border-white/10">
          <h2 className="font-heading text-lg font-semibold text-brand-ink dark:text-gray-100">
            Notifications
          </h2>
        </div>
        {items.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title="You're all caught up"
            description="New notifications will appear here."
          />
        ) : (
          <ul className="divide-y divide-brand-border dark:divide-white/10">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-4",
                  !n.is_read && "bg-gold-50/60",
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-dark">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-ink dark:text-gray-100">
                    {n.subject}
                  </p>
                  <p className="text-sm text-brand-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {humanize(n.type)} · {timeAgo(n.sent_at)}
                  </p>
                </div>
                {!n.is_read ? (
                  <button
                    onClick={() => markRead(n.id)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gold-50 hover:text-gold-dark"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
