import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Paperclip, Search, Send } from "lucide-react";
import {
  Avatar,
  Button,
  EmptyState,
  LoyaltyBadge,
  Spinner,
} from "@/components/ui";
import {
  useConversations,
  useMessageMutations,
  useThread,
} from "@/hooks/queries";
import { cn, formatDate, humanize, timeAgo } from "@/lib/utils";
import type { ConversationSummary } from "@/types";

const filters = ["All", "Unread", "Flagged"] as const;
type Filter = (typeof filters)[number];

export function MessagesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [activeGuest, setActiveGuest] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const { data: conversations, isLoading } = useConversations({
    filter: filter.toLowerCase(),
    search,
  });
  const { data: thread } = useThread(activeGuest);
  const { send } = useMessageMutations();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const active = (conversations ?? []).find((c) => c.guest_id === activeGuest);

  const onSend = () => {
    if (!draft.trim() || !activeGuest) return;
    send.mutate(
      { guest_id: activeGuest, body: draft },
      { onSuccess: () => setDraft("") },
    );
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-brand-border bg-white dark:bg-dark-card dark:border-white/10">
      {/* LEFT - conversation list */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-brand-border dark:border-white/10">
        <div className="space-y-3 border-b border-brand-border p-3 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages"
              className="w-full rounded-lg border border-brand-border bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-white/5"
            />
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 rounded-md py-1 text-xs font-medium transition",
                  filter === f
                    ? "bg-gold text-brand-ink"
                    : "text-gray-500 hover:bg-gold-50",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-4">
              <Spinner />
            </div>
          ) : (conversations ?? []).length === 0 ? (
            <EmptyState title="No conversations" />
          ) : (
            (conversations ?? []).map((c: ConversationSummary) => (
              <button
                key={c.guest_id}
                onClick={() => setActiveGuest(c.guest_id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-brand-border/60 px-3 py-3 text-left transition dark:border-white/10",
                  activeGuest === c.guest_id
                    ? "border-l-[3px] border-l-gold bg-gold-50"
                    : "hover:bg-gold-50/50",
                )}
              >
                <Avatar name={c.guest_name} size="sm" />
                <div className="min-w-0 flex-1">
                   <div className="flex items-center justify-between">
                     <span className="truncate text-sm font-medium text-brand-ink dark:text-gray-100">
                       {c.guest_name}
                     </span>
                     <span className="text-[11px] text-gray-400">
                       {timeAgo(c.last_sent_at)}
                     </span>
                   </div>
                  <p className="truncate text-xs text-brand-muted">
                    {c.last_message}
                  </p>
                </div>
                {c.unread_count > 0 ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-danger px-1 text-[11px] font-semibold text-white">
                    {c.unread_count}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      {/* CENTER - chat thread */}
      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex items-center justify-between border-b border-brand-border px-5 py-3 dark:border-white/10">
              <div>
                <p className="font-semibold text-brand-ink dark:text-gray-100">
                  {active.guest_name}
                </p>
                <p className="text-xs text-brand-muted">
                  {active.room_number
                    ? `Room ${active.room_number}`
                    : "No active stay"}
                </p>
              </div>
              <Flag className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-5 scrollbar-thin dark:bg-white/[0.02]">
              {(thread ?? []).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col",
                    m.sender === "staff" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                      m.sender === "staff"
                        ? "bg-gold text-brand-ink"
                        : "border border-brand-border bg-white text-gray-700 dark:bg-dark-card dark:text-gray-200",
                    )}
                  >
                    {m.body}
                  </div>
                  <span className="mt-1 text-[11px] text-gray-400">
                    {timeAgo(m.created_at)}
                  </span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-brand-border p-3 dark:border-white/10">
              <button className="text-gray-400 hover:text-gold-dark">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-brand-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-white/5"
              />
              <Button
                onClick={onSend}
                loading={send.isPending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              title="Select a conversation"
              description="Choose a guest to view the chat."
            />
          </div>
        )}
      </div>

      {/* RIGHT - guest mini-profile */}
      <div className="hidden w-[280px] shrink-0 flex-col border-l border-brand-border p-5 xl:flex dark:border-white/10">
        {active ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar name={active.guest_name} size="lg" />
              <p className="mt-2 font-semibold text-brand-ink dark:text-gray-100">
                {active.guest_name}
              </p>
              {active.loyalty_tier ? (
                <LoyaltyBadge tier={active.loyalty_tier} />
              ) : null}
            </div>
            <div className="space-y-2 rounded-xl border border-brand-border p-3 text-sm">
              <Row
                label="Room"
                value={
                  active.room_number
                    ? `${active.room_number} · ${humanize(active.room_type ?? "")}`
                    : "—"
                }
              />
              <Row
                label="Check-in"
                value={active.check_in ? formatDate(active.check_in) : "—"}
              />
              <Row
                label="Check-out"
                value={active.check_out ? formatDate(active.check_out) : "—"}
              />
            </div>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => navigate(`/guests/${active.guest_id}`)}
            >
              View Full Profile
            </Button>
            <Button className="w-full justify-center">Send Email</Button>
          </div>
        ) : (
          <p className="text-center text-sm text-brand-muted">
            No guest selected
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-brand-muted">{label}</span>
      <span className="font-medium text-brand-ink dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}
