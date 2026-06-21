import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Edit, Mail, MessageSquare } from "lucide-react";
import {
  Avatar,
  Badge,
  BookingStatusBadge,
  Button,
  Card,
  CardHeader,
  FullSpinner,
  InvoiceStatusBadge,
  LoyaltyBadge,
} from "@/components/ui";
import { useGuest, useGuestBookings, useGuestInvoices } from "@/hooks/queries";
import { formatCurrency, formatDate, humanize } from "@/lib/utils";
import type { LoyaltyTier } from "@/types";

const tierThresholds: Record<LoyaltyTier, number> = {
  none: 0,
  bronze: 3,
  silver: 7,
  gold: 15,
};
const nextTier: Record<LoyaltyTier, LoyaltyTier | null> = {
  none: "bronze",
  bronze: "silver",
  silver: "gold",
  gold: null,
};

export function GuestProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guestId = Number(id);
  const { data: guest, isLoading } = useGuest(guestId);
  const { data: bookings } = useGuestBookings(guestId);
  const { data: invoices } = useGuestInvoices(guestId);

  if (isLoading || !guest) return <FullSpinner label="Loading guest profile" />;

  const current = (bookings ?? []).find(
    (b) => b.status === "checked_in" || b.status === "due_out",
  );
  const next = nextTier[guest.loyalty_tier];
  const target = next ? tierThresholds[next] : tierThresholds.gold;
  const progress = Math.min(
    (guest.total_stays / Math.max(target, 1)) * 100,
    100,
  );
  const progressStyle = { width: `${progress}%` };

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate("/guests")}
        className="flex items-center gap-1 text-sm text-brand-muted hover:text-gold-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Guests
      </button>

      {/* Header */}
      <Card className="flex items-center gap-5">
        <Avatar name={`${guest.first_name} ${guest.last_name}`} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-brand-ink dark:text-gray-100">
              {guest.first_name} {guest.last_name}
            </h1>
            <LoyaltyBadge tier={guest.loyalty_tier} />
            {current ? (
              <Badge color={{ bg: "#D9F99D", text: "#4D7C0F" }}>
                Currently Staying
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            {guest.email} · {guest.phone ?? "No phone"} ·{" "}
            {guest.nationality ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<MessageSquare className="h-4 w-4" />}
            onClick={() => navigate("/messages")}
          >
            Message
          </Button>
          <Button leftIcon={<Edit className="h-4 w-4" />}>Edit Guest</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[35%_65%]">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Personal Info" />
            <dl className="space-y-2 text-sm">
              <InfoRow label="Nationality" value={guest.nationality ?? "—"} />
              <InfoRow label="ID / Passport" value={guest.id_number ?? "—"} />
              <InfoRow label="Phone" value={guest.phone ?? "—"} />
              <InfoRow label="Email" value={guest.email} />
            </dl>
            {guest.notes ? (
              <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/5">
                {guest.notes}
              </p>
            ) : null}
          </Card>
          <Card>
            <CardHeader title="Loyalty Program" />
            <div className="flex items-center justify-between">
              <LoyaltyBadge tier={guest.loyalty_tier} />
              <span className="text-sm tabular-nums text-brand-muted">
                {guest.total_stays} stays
              </span>
            </div>
            {next ? (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-brand-muted">
                  <span>Progress to {humanize(next)}</span>
                  <span>
                    {guest.total_stays}/{target}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={progressStyle}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gold-dark">Top tier reached 🎉</p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {current ? (
            <Card goldBorder>
              <CardHeader
                title="Current Booking"
                action={<BookingStatusBadge status={current.status} />}
              />
              <div className="grid grid-cols-3 gap-3 text-sm">
                <InfoRow
                  label="Room"
                  value={`${current.room_number} · ${humanize(current.room_type)}`}
                />
                <InfoRow
                  label="Check-in"
                  value={formatDate(current.check_in)}
                />
                <InfoRow
                  label="Check-out"
                  value={formatDate(current.check_out)}
                />
              </div>
            </Card>
          ) : null}

          <Card padded={false}>
            <div className="px-5 py-4">
              <h3 className="font-semibold text-brand-ink dark:text-gray-100">
                Booking History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-brand-border text-left text-xs uppercase text-brand-muted">
                    <th className="px-5 py-2 font-medium">Dates</th>
                    <th className="px-5 py-2 font-medium">Room</th>
                    <th className="px-5 py-2 font-medium">Nights</th>
                    <th className="px-5 py-2 font-medium">Amount</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(bookings ?? []).map((b) => (
                    <tr key={b.id} className="border-b border-brand-border/60">
                      <td className="px-5 py-2.5">
                        {formatDate(b.check_in)} → {formatDate(b.check_out)}
                      </td>
                      <td className="px-5 py-2.5">{b.room_number}</td>
                      <td className="px-5 py-2.5 tabular-nums">{b.nights}</td>
                      <td className="px-5 py-2.5 tabular-nums">
                        {formatCurrency(b.total_price)}
                      </td>
                      <td className="px-5 py-2.5">
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Invoices" />
            <div className="space-y-2">
              {(invoices ?? []).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{inv.invoice_ref}</span>
                  <span className="tabular-nums">
                    {formatCurrency(inv.total)}
                  </span>
                  <InvoiceStatusBadge status={inv.status} />
                  <button className="text-gray-400 hover:text-gold-dark">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(invoices ?? []).length === 0 ? (
                <p className="py-4 text-center text-sm text-brand-muted">
                  No invoices yet
                </p>
              ) : null}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<Mail className="h-4 w-4" />}>
              Send Message
            </Button>
            <Button leftIcon={<Edit className="h-4 w-4" />}>Edit Guest</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-right font-medium text-brand-ink dark:text-gray-200">
        {value}
      </dd>
    </div>
  );
}
