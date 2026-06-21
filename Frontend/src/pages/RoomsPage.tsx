import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BedDouble,
  Car,
  Coffee,
  Dumbbell,
  Plus,
  Tv,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  Input,
  Select,
  SkeletonCard,
  Textarea,
  Toggle,
} from "@/components/ui";
import {
  useRooms,
  useRoomMutations,
  useRoomTypeSummary,
} from "@/hooks/queries";
import { formatCurrency, humanize } from "@/lib/utils";
import type { Room, RoomStatus, RoomType } from "@/types";

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  tv: Tv,
  breakfast: Coffee,
  ac: Wind,
};
const roomTypes: RoomType[] = ["single", "double", "suite", "family", "deluxe"];
const roomStatuses: RoomStatus[] = [
  "available",
  "occupied",
  "reserved",
  "out_of_order",
  "need_ready",
  "cleaning",
];
const allAmenities = [
  "wifi",
  "parking",
  "pool",
  "gym",
  "tv",
  "breakfast",
  "ac",
];

const schema = z.object({
  room_number: z.string().min(1, "Required"),
  type: z.string(),
  floor: z.coerce.number().min(0),
  price_per_night: z.coerce.number().min(0),
  max_occupancy: z.coerce.number().min(1),
  description: z.string().optional(),
  has_panorama: z.boolean().optional(),
  status: z.string(),
});
type FormValues = z.infer<typeof schema>;

export function RoomsPage() {
  const { data: summary, isLoading } = useRoomTypeSummary();
  const { data: rooms } = useRooms({ limit: 200 });
  const { create } = useRoomMutations();
  const [detail, setDetail] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      room_number: "",
      type: "single",
      floor: 1,
      price_per_night: 100,
      max_occupancy: 2,
      description: "",
      has_panorama: false,
      status: "available",
    },
  });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      { ...values, type: values.type as RoomType, amenities },
      {
        onSuccess: () => {
          setDrawerOpen(false);
          reset();
          setAmenities([]);
        },
      },
    );
  };

  const detailType = (summary ?? []).find((s) => s.type === detail);
  const detailRooms = (rooms?.items ?? []).filter((r) => r.type === detail);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {(summary ?? []).length} room types
        </p>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setDrawerOpen(true)}
        >
          Add Room
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (summary ?? []).length === 0 ? (
          <Card className="col-span-full">
            <EmptyState
              title="No rooms yet"
              description="Add your first room to get started."
            />
          </Card>
        ) : (
          (summary ?? []).map((rt) => (
            <Card key={rt.type} padded={false} className="overflow-hidden">
              <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-gold-50 to-gold/20">
                <BedDouble className="h-12 w-12 text-gold-dark/60" />
                <Badge
                  className="absolute right-3 top-3"
                  color={{ bg: "#F5C842", text: "#1A1A2E" }}
                >
                  {humanize(rt.type)}
                </Badge>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-semibold text-brand-ink dark:text-gray-100">
                    {humanize(rt.type)} Room
                  </p>
                  <p className="font-heading text-lg font-bold tabular-nums text-gold-dark">
                    {formatCurrency(rt.price_per_night)}
                    <span className="text-xs font-normal text-brand-muted">
                      /night
                    </span>
                  </p>
                </div>
                <p className="text-sm text-brand-muted">
                  Up to {rt.max_occupancy} guests · {rt.total} rooms
                </p>
                <div className="flex gap-2 text-gray-400">
                  {(rt.amenities ?? allAmenities.slice(0, 4))
                    .slice(0, 5)
                    .map((a) => {
                      const Icon = amenityIcons[a] ?? Wifi;
                      return <Icon key={a} className="h-4 w-4" />;
                    })}
                </div>
                <div className="flex items-center justify-between">
                  {rt.available > 0 ? (
                    <span className="text-sm font-medium text-status-success">
                      {rt.available} rooms available
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-status-danger">
                      Fully booked
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDetail(rt.type)}
                  >
                    View Rooms
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail side panel */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detailType ? `${humanize(detailType.type)} Rooms` : ""}
      >
        {detailType ? (
          <div className="space-y-4">
            <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-gold-50 to-gold/20">
              <BedDouble className="h-16 w-16 text-gold-dark/60" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info
                label="Price / night"
                value={formatCurrency(detailType.price_per_night)}
              />
              <Info
                label="Max occupancy"
                value={`${detailType.max_occupancy} guests`}
              />
              <Info label="Total rooms" value={String(detailType.total)} />
              <Info label="Available" value={String(detailType.available)} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                Rooms
              </p>
              <div className="space-y-2">
                {detailRooms.map((r: Room) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">Room {r.room_number}</span>
                    <Badge>{humanize(r.status)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Add room drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Room"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={create.isPending}>
              Save Room
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Number"
              error={errors.room_number?.message}
              {...register("room_number")}
            />
            <Select
              label="Type"
              options={roomTypes.map((t) => ({ value: t, label: humanize(t) }))}
              {...register("type")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Floor" {...register("floor")} />
            <Input
              type="number"
              label="Price / night"
              {...register("price_per_night")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Max Occupancy"
              {...register("max_occupancy")}
            />
            <Select
              label="Status"
              options={roomStatuses.map((s) => ({
                value: s,
                label: humanize(s),
              }))}
              {...register("status")}
            />
          </div>
          <Textarea label="Description" rows={3} {...register("description")} />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Amenities
            </p>
            <div className="grid grid-cols-2 gap-2">
              {allAmenities.map((a) => {
                const Icon = amenityIcons[a];
                const checked = amenities.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() =>
                      setAmenities((prev) =>
                        prev.includes(a)
                          ? prev.filter((x) => x !== a)
                          : [...prev, a],
                      )
                    }
                    className={
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition " +
                      (checked
                        ? "border-gold bg-gold-50 text-gold-dark"
                        : "border-brand-border text-gray-600")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {humanize(a)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Has Panorama
            </span>
            <Toggle
              checked={!!watch("has_panorama")}
              onChange={(v) => setValue("has_panorama", v)}
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border p-3">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="mt-0.5 font-medium text-brand-ink dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}
