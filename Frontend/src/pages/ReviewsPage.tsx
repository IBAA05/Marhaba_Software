import { useState } from "react";
import { Star } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Select,
  SkeletonCard,
  Textarea,
} from "@/components/ui";
import {
  useReviewSummary,
  useReviews,
  useReviewMutations,
} from "@/hooks/queries";
import { cn, formatDate, humanize } from "@/lib/utils";
import type { Review } from "@/types";

export function ReviewsPage() {
  const [rating, setRating] = useState("");
  const [source, setSource] = useState("");
  const { data: summary } = useReviewSummary();
  const { data: reviews, isLoading } = useReviews({ rating, source });
  const { reply } = useReviewMutations();
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[30%_70%]">
          <div className="flex flex-col items-center justify-center border-r-0 lg:border-r border-brand-border">
            <p className="font-heading text-5xl font-bold tabular-nums text-brand-ink dark:text-gray-100">
              {(summary?.average ?? 0).toFixed(1)}
            </p>
            <Stars value={Math.round(summary?.average ?? 0)} />
            <span className="mt-1 rounded-full bg-gold-50 px-3 py-1 text-sm font-medium text-gold-dark">
              {summary?.label ?? "Impressive"}
            </span>
            <p className="mt-1 text-xs text-brand-muted">
              {summary?.total ?? 0} reviews
            </p>
          </div>
          <div className="space-y-2">
            {(summary?.breakdown ?? []).map((b) => {
              const widthStyle = { width: `${(b.score / 5) * 100}%` };
              return (
                <div key={b.label}>
                  <div className="mb-0.5 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {b.label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {b.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={widthStyle}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          className="w-40"
          placeholder="All Ratings"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          options={[5, 4, 3, 2, 1].map((r) => ({
            value: String(r),
            label: `${r} Stars`,
          }))}
        />
        <Select
          className="w-40"
          placeholder="All Sources"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          options={["direct", "google", "tripadvisor"].map((s) => ({
            value: s,
            label: humanize(s),
          }))}
        />
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (reviews ?? []).length === 0 ? (
          <Card>
            <EmptyState title="No reviews yet" />
          </Card>
        ) : (
          (reviews ?? []).map((r: Review) => (
            <Card key={r.id}>
              <div className="flex items-start gap-4">
                <Avatar name={r.guest_name} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-brand-ink dark:text-gray-100">
                        {r.guest_name}
                      </p>
                      <Badge>{humanize(r.source)}</Badge>
                    </div>
                    <span className="text-xs text-brand-muted">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  <Stars value={r.rating} />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {r.comment}
                  </p>
                  {r.reply ? (
                    <div className="mt-3 rounded-lg bg-gold-50 p-3 text-sm">
                      <p className="mb-1 text-xs font-semibold text-gold-dark">
                        Hotel Response
                      </p>
                      <p className="text-gray-700">{r.reply}</p>
                    </div>
                  ) : replyId === r.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            reply.mutate(
                              { id: r.id, reply: replyText },
                              {
                                onSuccess: () => {
                                  setReplyId(null);
                                  setReplyText("");
                                },
                              },
                            )
                          }
                          loading={reply.isPending}
                        >
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReplyId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyId(r.id)}
                      className="mt-3 text-sm font-medium text-gold-dark hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < value ? "fill-gold text-gold" : "text-gray-300",
          )}
        />
      ))}
    </div>
  );
}
