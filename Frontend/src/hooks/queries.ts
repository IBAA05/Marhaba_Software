import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bookingsApi,
  calendarApi,
  conciergeApi,
  dashboardApi,
  financialsApi,
  guestsApi,
  housekeepingApi,
  inventoryApi,
  invoicesApi,
  messagesApi,
  notificationsApi,
  reviewsApi,
  roomsApi,
  settingsApi,
  type BookingFilters,
  type ConciergeFilters,
  type ExpenseFilters,
  type GuestFilters,
  type InventoryFilters,
  type InvoiceFilters,
  type ReviewFilters,
  type RoomFilters,
  type TaskFilters,
} from "@/api/endpoints";
import { staleTimes } from "@/lib/queryClient";

// ---- Dashboard ------------------------------------------------------------
export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.stats,
    staleTime: staleTimes.dashboard,
  });
export const useRoomAvailability = () =>
  useQuery({
    queryKey: ["dashboard", "room-availability"],
    queryFn: dashboardApi.roomAvailability,
    staleTime: staleTimes.dashboard,
  });
export const useRevenueChart = () =>
  useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: dashboardApi.revenueChart,
  });
export const useReservationsChart = () =>
  useQuery({
    queryKey: ["dashboard", "reservations"],
    queryFn: dashboardApi.reservationsChart,
  });
export const usePlatformBreakdown = () =>
  useQuery({
    queryKey: ["dashboard", "platform"],
    queryFn: dashboardApi.platformBreakdown,
  });
export const useRecentBookings = () =>
  useQuery({
    queryKey: ["dashboard", "recent-bookings"],
    queryFn: dashboardApi.recentBookings,
    staleTime: staleTimes.dashboard,
  });
export const useDashboardRatings = () =>
  useQuery({
    queryKey: ["dashboard", "ratings"],
    queryFn: dashboardApi.ratings,
  });
export const useDashboardTasks = () =>
  useQuery({ queryKey: ["dashboard", "tasks"], queryFn: dashboardApi.tasks });
export const useActivityFeed = () =>
  useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: dashboardApi.activityFeed,
    staleTime: staleTimes.dashboard,
  });

// ---- Rooms ----------------------------------------------------------------
export const useRooms = (filters: RoomFilters = {}) =>
  useQuery({
    queryKey: ["rooms", filters],
    queryFn: () => roomsApi.list(filters),
  });
export const useRoom = (id: number | null) =>
  useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsApi.get(id as number),
    enabled: id != null,
  });
export const useRoomTypeSummary = () =>
  useQuery({ queryKey: ["rooms", "summary"], queryFn: roomsApi.typeSummary });

export function useRoomMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["rooms"] });
  return {
    create: useMutation({
      mutationFn: roomsApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Room created");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => roomsApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Room updated");
      },
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        roomsApi.updateStatus(id, status),
      onSuccess: () => {
        invalidate();
        toast.success("Status updated");
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => roomsApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Room removed");
      },
    }),
  };
}

// ---- Guests ---------------------------------------------------------------
export const useGuests = (filters: GuestFilters = {}) =>
  useQuery({
    queryKey: ["guests", filters],
    queryFn: () => guestsApi.list(filters),
  });
export const useGuest = (id: number | null) =>
  useQuery({
    queryKey: ["guests", id],
    queryFn: () => guestsApi.get(id as number),
    enabled: id != null,
  });
export const useGuestBookings = (id: number | null) =>
  useQuery({
    queryKey: ["guests", id, "bookings"],
    queryFn: () => guestsApi.bookings(id as number),
    enabled: id != null,
  });
export const useGuestInvoices = (id: number | null) =>
  useQuery({
    queryKey: ["guests", id, "invoices"],
    queryFn: () => guestsApi.invoices(id as number),
    enabled: id != null,
  });

export function useGuestMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["guests"] });
  return {
    create: useMutation({
      mutationFn: guestsApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Guest created");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => guestsApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Guest updated");
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => guestsApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Guest removed");
      },
    }),
  };
}

// ---- Bookings -------------------------------------------------------------
export const useBookings = (filters: BookingFilters = {}) =>
  useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingsApi.list(filters),
  });
export const useBooking = (id: string | null) =>
  useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingsApi.get(id as string),
    enabled: id != null,
  });
export const useGantt = (params: {
  start_date: string;
  end_date: string;
  room_type?: string;
}) =>
  useQuery({
    queryKey: ["bookings", "gantt", params],
    queryFn: () => bookingsApi.gantt(params),
    staleTime: staleTimes.gantt,
  });
export const useTodayBookings = () =>
  useQuery({ queryKey: ["bookings", "today"], queryFn: bookingsApi.today });

export function useBookingMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["rooms"] });
  };
  return {
    create: useMutation({
      mutationFn: bookingsApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Booking created");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: string;
        body: Record<string, unknown>;
      }) => bookingsApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Booking updated");
      },
    }),
    cancel: useMutation({
      mutationFn: (id: string) => bookingsApi.cancel(id),
      onSuccess: () => {
        invalidate();
        toast.success("Booking cancelled");
      },
    }),
    checkIn: useMutation({
      mutationFn: (id: string) => bookingsApi.checkIn(id),
      onSuccess: () => {
        invalidate();
        toast.success("Checked in");
      },
    }),
    checkOut: useMutation({
      mutationFn: (id: string) => bookingsApi.checkOut(id),
      onSuccess: () => {
        invalidate();
        qc.invalidateQueries({ queryKey: ["invoices"] });
        toast.success("Checked out — invoice generated");
      },
    }),
  };
}

// ---- Housekeeping ---------------------------------------------------------
export const useTasks = (filters: TaskFilters = {}) =>
  useQuery({
    queryKey: ["housekeeping", filters],
    queryFn: () => housekeepingApi.list(filters),
  });
export const useBoard = () =>
  useQuery({
    queryKey: ["housekeeping", "board"],
    queryFn: housekeepingApi.board,
  });

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["housekeeping"] });
  return {
    create: useMutation({
      mutationFn: housekeepingApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Task created");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => housekeepingApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Task updated");
      },
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        housekeepingApi.updateStatus(id, status),
      onSuccess: () => invalidate(),
    }),
    remove: useMutation({
      mutationFn: (id: number) => housekeepingApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Task deleted");
      },
    }),
  };
}

// ---- Inventory ------------------------------------------------------------
export const useInventory = (filters: InventoryFilters = {}) =>
  useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => inventoryApi.list(filters),
  });

export function useInventoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["inventory"] });
  return {
    create: useMutation({
      mutationFn: inventoryApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Item added");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => inventoryApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Item updated");
      },
    }),
    restock: useMutation({
      mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
        inventoryApi.restock(id, { quantity }),
      onSuccess: () => {
        invalidate();
        toast.success("Item restocked");
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => inventoryApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Item removed");
      },
    }),
  };
}

// ---- Messages -------------------------------------------------------------
export const useConversations = (
  filter: "all" | "unread" | "flagged" = "all",
) =>
  useQuery({
    queryKey: ["messages", "conversations", filter],
    queryFn: () => messagesApi.conversations(filter),
  });
export const useThread = (guestId: number | null) =>
  useQuery({
    queryKey: ["messages", "thread", guestId],
    queryFn: () => messagesApi.thread(guestId as number),
    enabled: guestId != null,
  });
export const useUnreadCount = () =>
  useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: messagesApi.unreadCount,
    staleTime: staleTimes.dashboard,
  });

export function useMessageMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["messages"] });
  return {
    send: useMutation({
      mutationFn: ({
        guestId,
        content,
      }: {
        guestId: number;
        content: string;
      }) => messagesApi.send(guestId, { content }),
      onSuccess: () => invalidate(),
    }),
    markRead: useMutation({
      mutationFn: (id: number) => messagesApi.markRead(id),
      onSuccess: () => invalidate(),
    }),
    toggleFlag: useMutation({
      mutationFn: (id: number) => messagesApi.toggleFlag(id),
      onSuccess: () => invalidate(),
    }),
    remove: useMutation({
      mutationFn: (id: number) => messagesApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Message deleted");
      },
    }),
  };
}

// ---- Financials -----------------------------------------------------------
export const useFinancialOverview = () =>
  useQuery({
    queryKey: ["financials", "overview"],
    queryFn: financialsApi.overview,
  });
export const useEarnings = (year?: number) =>
  useQuery({
    queryKey: ["financials", "earnings", year],
    queryFn: () => financialsApi.earnings(year),
  });
export const useExpenseBreakdown = (year?: number) =>
  useQuery({
    queryKey: ["financials", "breakdown", year],
    queryFn: () => financialsApi.breakdown(year),
  });
export const useIncomeSources = (year?: number) =>
  useQuery({
    queryKey: ["financials", "income", year],
    queryFn: () => financialsApi.incomeSources(year),
  });
export const useExpenses = (filters: ExpenseFilters = {}) =>
  useQuery({
    queryKey: ["financials", "expenses", filters],
    queryFn: () => financialsApi.expenses(filters),
  });

export function useExpenseMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["financials"] });
  return {
    create: useMutation({
      mutationFn: financialsApi.createExpense,
      onSuccess: () => {
        invalidate();
        toast.success("Expense added");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => financialsApi.updateExpense(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Expense updated");
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => financialsApi.removeExpense(id),
      onSuccess: () => {
        invalidate();
        toast.success("Expense deleted");
      },
    }),
  };
}

// ---- Invoices -------------------------------------------------------------
export const useInvoices = (filters: InvoiceFilters = {}) =>
  useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => invoicesApi.list(filters),
  });
export const useInvoice = (id: number | null) =>
  useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoicesApi.get(id as number),
    enabled: id != null,
  });

export function useInvoiceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["invoices"] });
  return {
    pay: useMutation({
      mutationFn: (id: number) => invoicesApi.pay(id),
      onSuccess: () => {
        invalidate();
        toast.success("Invoice marked paid");
      },
    }),
    send: useMutation({
      mutationFn: (id: number) => invoicesApi.send(id),
      onSuccess: () => toast.success("Invoice emailed to guest"),
    }),
  };
}

// ---- Reviews --------------------------------------------------------------
export const useReviews = (filters: ReviewFilters = {}) =>
  useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => reviewsApi.list(filters),
  });
export const useReviewSummary = () =>
  useQuery({ queryKey: ["reviews", "summary"], queryFn: reviewsApi.summary });

export function useReviewMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["reviews"] });
  return {
    reply: useMutation({
      mutationFn: ({ id, reply }: { id: number; reply: string }) =>
        reviewsApi.reply(id, reply),
      onSuccess: () => {
        invalidate();
        toast.success("Reply posted");
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => reviewsApi.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Review removed");
      },
    }),
  };
}

// ---- Concierge ------------------------------------------------------------
export const useConcierge = (filters: ConciergeFilters = {}) =>
  useQuery({
    queryKey: ["concierge", filters],
    queryFn: () => conciergeApi.list(filters),
  });
export const useConciergePending = () =>
  useQuery({
    queryKey: ["concierge", "pending"],
    queryFn: conciergeApi.pending,
  });

export function useConciergeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["concierge"] });
  return {
    create: useMutation({
      mutationFn: conciergeApi.create,
      onSuccess: () => {
        invalidate();
        toast.success("Request created");
      },
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: Record<string, unknown>;
      }) => conciergeApi.update(id, body),
      onSuccess: () => {
        invalidate();
        toast.success("Request updated");
      },
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        conciergeApi.updateStatus(id, status),
      onSuccess: () => invalidate(),
    }),
    cancel: useMutation({
      mutationFn: (id: number) => conciergeApi.cancel(id),
      onSuccess: () => {
        invalidate();
        toast.success("Request cancelled");
      },
    }),
  };
}

// ---- Calendar -------------------------------------------------------------
export const useCalendarMonth = (year: number, month: number) =>
  useQuery({
    queryKey: ["calendar", "month", year, month],
    queryFn: () => calendarApi.month(year, month),
  });
export const useCalendarDay = (date: string | null) =>
  useQuery({
    queryKey: ["calendar", "day", date],
    queryFn: () => calendarApi.day(date as string),
    enabled: date != null,
  });

// ---- Settings / Notifications ---------------------------------------------
export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: settingsApi.get });

export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
  });
}

export const useNotifications = (
  params: { page?: number; limit?: number } = {},
) =>
  useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.list(params),
  });
export const useUnreadNotifications = () =>
  useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationsApi.unread,
    staleTime: staleTimes.dashboard,
  });
