import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Eye, Mail, Send } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  InvoiceStatusBadge,
  Modal,
  Pagination,
  Select,
  SkeletonTable,
  Table,
  type Column,
} from "@/components/ui";
import { useInvoice, useInvoiceMutations, useInvoices } from "@/hooks/queries";
import { formatCurrency, formatDate, humanize } from "@/lib/utils";
import type { Invoice } from "@/types";

export function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, isLoading } = useInvoices({ page, limit, search, status });
  const { data: detail } = useInvoice(openId);
  const { markPaid, send } = useInvoiceMutations();
  const printRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save(`${detail?.invoice_ref ?? "invoice"}.pdf`);
  };

  const columns: Column<Invoice>[] = [
    {
      key: "invoice_ref",
      header: "Invoice Ref",
      render: (i) => (
        <span className="font-medium text-brand-ink dark:text-gray-100">
          {i.invoice_ref}
        </span>
      ),
    },
    { key: "guest_name", header: "Guest", render: (i) => i.guest_name },
    { key: "room_number", header: "Room", render: (i) => i.room_number ?? "—" },
    {
      key: "nights",
      header: "Nights",
      render: (i) => <span className="tabular-nums">{i.nights}</span>,
    },
    {
      key: "total",
      header: "Amount",
      render: (i) => (
        <span className="tabular-nums">{formatCurrency(i.total)}</span>
      ),
    },
    {
      key: "issued_date",
      header: "Issued",
      render: (i) => formatDate(i.issued_date),
    },
    {
      key: "status",
      header: "Status",
      render: (i) => <InvoiceStatusBadge status={i.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50"
            title="View"
            onClick={() => setOpenId(i.id)}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50"
            title="Send"
            onClick={() => send.mutate(i.id)}
          >
            <Send className="h-4 w-4" />
          </button>
          {i.status !== "paid" ? (
            <button
              className="rounded-md p-1.5 text-status-success hover:bg-status-success/10"
              title="Mark Paid"
              onClick={() => markPaid.mutate(i.id)}
            >
              ✓
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by guest or invoice ref..."
            className="w-64 rounded-lg border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-dark-card"
          />
          <Select
            className="w-36"
            placeholder="All Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={["paid", "pending", "overdue"].map((s) => ({
              value: s,
              label: humanize(s),
            }))}
          />
        </div>
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={8} />
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <EmptyState title="No invoices found" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.items ?? []}
              rowKey={(i) => i.id}
              onRowClick={(i) => setOpenId(i.id)}
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

      <Modal
        open={!!openId}
        onClose={() => setOpenId(null)}
        title="Invoice"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              leftIcon={<Mail className="h-4 w-4" />}
              onClick={() => openId && send.mutate(openId)}
            >
              Send Email
            </Button>
            <Button
              leftIcon={<Download className="h-4 w-4" />}
              onClick={downloadPdf}
            >
              Download PDF
            </Button>
          </>
        }
      >
        {detail ? (
          <div ref={printRef} className="space-y-5 bg-white p-2 text-brand-ink">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold font-heading font-bold text-brand-ink">
                  H
                </div>
                <div>
                  <p className="font-heading text-lg font-bold">
                    Aurelia Hotel
                  </p>
                  <p className="text-xs text-brand-muted">
                    Luxury Hotel Management
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold">{detail.invoice_ref}</p>
                <p className="text-xs text-brand-muted">
                  Issued {formatDate(detail.issued_date)}
                </p>
                <InvoiceStatusBadge status={detail.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
                  Billed To
                </p>
                <p className="font-medium">{detail.guest_name}</p>
                <p className="text-brand-muted">{detail.guest_email}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-400">
                  Room
                </p>
                <p className="font-medium">
                  {detail.room_number} · {humanize(detail.room_type ?? "")}
                </p>
                <p className="text-brand-muted">{detail.nights} nights</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-brand-border text-left text-xs uppercase text-brand-muted">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(detail.line_items ?? []).map((li, idx) => (
                  <tr key={idx} className="border-b border-brand-border/60">
                    <td className="py-2">{li.label}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-56 space-y-1 text-sm">
                <Line label="Subtotal" value={detail.subtotal} />
                <Line label="Tax" value={detail.tax} />
                {detail.discount ? (
                  <Line label="Discount" value={-detail.discount} />
                ) : null}
                <div className="flex justify-between border-t border-brand-border pt-2">
                  <span className="font-heading font-bold">Total</span>
                  <span className="font-heading text-lg font-bold tabular-nums text-gold-dark">
                    {formatCurrency(detail.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-brand-muted">
            Loading invoice...
          </p>
        )}
      </Modal>
    </div>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-brand-muted">{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
