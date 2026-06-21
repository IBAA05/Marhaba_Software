import { useState } from "react";
import { Download, Edit, PackagePlus, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Pagination,
  SkeletonTable,
  StockStatusBadge,
  Table,
  type Column,
} from "@/components/ui";
import { useInventory, useInventoryMutations } from "@/hooks/queries";
import { inventoryApi } from "@/api/endpoints";
import { formatDate, humanize } from "@/lib/utils";
import type { InventoryItem } from "@/types";

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useInventory({ page, limit, search });
  const { restock } = useInventoryMutations();
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const exportCsv = async () => {
    const blob = await inventoryApi.exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: "name",
      header: "Item",
      render: (i) => (
        <span className="font-medium text-brand-ink dark:text-gray-100">
          {i.name}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (i) => <Badge>{humanize(i.category)}</Badge>,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (i) => <span className="tabular-nums">{i.quantity}</span>,
    },
    { key: "unit", header: "Unit", render: (i) => i.unit },
    {
      key: "reorder_level",
      header: "Reorder",
      render: (i) => <span className="tabular-nums">{i.reorder_level}</span>,
    },
    {
      key: "stock_status",
      header: "Status",
      render: (i) => <StockStatusBadge status={i.stock_status} />,
    },
    {
      key: "last_restocked",
      header: "Last Restocked",
      render: (i) => (i.last_restocked ? formatDate(i.last_restocked) : "—"),
    },
    { key: "supplier", header: "Supplier", render: (i) => i.supplier ?? "—" },
    {
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex gap-1">
          <button
            className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1.5 text-gray-500 hover:bg-gold-50"
            title="Restock"
            onClick={() => {
              setRestockItem(i);
              setRestockQty(i.quantity);
            }}
          >
            <PackagePlus className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1.5 text-status-danger hover:bg-status-danger/10"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Card goldBorder>
          <p className="text-sm text-brand-muted">Total Items</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums">
            {data?.total_items ?? 0}
          </p>
        </Card>
        <Card goldBorder>
          <p className="text-sm text-brand-muted">Low Stock</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-status-warning">
            {data?.low_stock ?? 0}
          </p>
        </Card>
        <Card goldBorder>
          <p className="text-sm text-brand-muted">Out of Stock</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-status-danger">
            {data?.out_of_stock ?? 0}
          </p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between gap-3 p-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search items..."
            className="w-64 rounded-lg border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold dark:bg-dark-card"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Item</Button>
          </div>
        </div>
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={8} cols={9} />
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <EmptyState title="No inventory items" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data?.items ?? []}
              rowKey={(i) => i.id}
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
        open={!!restockItem}
        onClose={() => setRestockItem(null)}
        title="Restock Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRestockItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (restockItem) {
                  restock.mutate(
                    { id: restockItem.id, quantity: restockQty },
                    { onSuccess: () => setRestockItem(null) },
                  );
                }
              }}
              loading={restock.isPending}
            >
              Confirm Restock
            </Button>
          </>
        }
      >
        {restockItem ? (
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Current quantity:{" "}
              <span className="font-semibold text-brand-ink dark:text-gray-100">
                {restockItem.quantity} {restockItem.unit}
              </span>
            </p>
            <Input
              type="number"
              label="New Quantity"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
