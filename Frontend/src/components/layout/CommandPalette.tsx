import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, CalendarCheck, Search, User } from "lucide-react";
import { bookingsApi, guestsApi, roomsApi } from "@/api/endpoints";
import { Spinner } from "@/components/ui";

const overlay = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const panel = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0 },
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["command-search", term],
    queryFn: async () => {
      const [guests, rooms, bookings] = await Promise.all([
        guestsApi.search(term).catch(() => []),
        roomsApi.list({ search: term } as never).catch(() => ({ items: [] })),
        bookingsApi.search(term).catch(() => []),
      ]);
      return {
        guests: guests.slice(0, 5),
        rooms: (rooms.items ?? []).slice(0, 5),
        bookings: bookings.slice(0, 5),
      };
    },
    enabled: open && term.trim().length > 1,
  });

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24"
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={panel}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dark-card"
          >
            <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3 dark:border-white/10">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search bookings, guests, rooms..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              {isFetching ? <Spinner className="h-4 w-4" /> : null}
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {term.trim().length <= 1 ? (
                <p className="px-3 py-6 text-center text-sm text-brand-muted">
                  Type at least 2 characters to search
                </p>
              ) : null}
              {data?.guests.length ? (
                <Group title="Guests">
                  {data.guests.map((g) => (
                    <Row
                      key={`g-${g.id}`}
                      icon={<User className="h-4 w-4" />}
                      label={`${g.first_name} ${g.last_name}`}
                      sub={g.email}
                      onClick={() => go(`/guests/${g.id}`)}
                    />
                  ))}
                </Group>
              ) : null}
              {data?.rooms.length ? (
                <Group title="Rooms">
                  {data.rooms.map((r) => (
                    <Row
                      key={`r-${r.id}`}
                      icon={<BedDouble className="h-4 w-4" />}
                      label={`Room ${r.room_number}`}
                      sub={r.type}
                      onClick={() => go("/rooms")}
                    />
                  ))}
                </Group>
              ) : null}
              {data?.bookings.length ? (
                <Group title="Bookings">
                  {data.bookings.map((b) => (
                    <Row
                      key={`b-${b.id}`}
                      icon={<CalendarCheck className="h-4 w-4" />}
                      label={b.booking_ref}
                      sub={b.guest_name}
                      onClick={() => go("/reservations")}
                    />
                  ))}
                </Group>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gold-50"
    >
      <span className="text-gold-dark">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-brand-ink dark:text-gray-100">
          {label}
        </span>
        {sub ? (
          <span className="block text-xs text-brand-muted">{sub}</span>
        ) : null}
      </span>
    </button>
  );
}
