import { api, unwrap, unwrapList } from "@/lib/axios";
import type {
  ActivityItem,
  BoardRoom,
  Booking,
  CategoryBreakdown,
  ConciergeRequest,
  ConversationSummary,
  DashboardStats,
  EarningsPoint,
  Expense,
  FinancialOverview,
  GanttResponse,
  Guest,
  HotelSettings,
  HousekeepingTask,
  IncomeSource,
  InventoryItem,
  Invoice,
  Message,
  NotificationLog,
  PaginationMeta,
  PlatformBreakdown,
  ReservationsPoint,
  RevenuePoint,
  Review,
  ReviewSummary,
  Room,
  RoomAvailability,
  RoomTypeSummary,
  TokenPair,
  User,
} from "@/types";

export interface ListResult<T> {
  items: T[];
  pagination?: PaginationMeta;
}

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

// ---- Auth -----------------------------------------------------------------
export const authApi = {
  login: (body: { username: string; password: string }) =>
    unwrap<TokenPair>(api.post("/auth/login", body)),
  refresh: (refresh_token: string) =>
    unwrap<{ access_token: string }>(
      api.post("/auth/refresh", { refresh_token }),
    ),
  logout: (refresh_token: string) =>
    unwrap<null>(api.post("/auth/logout", { refresh_token })),
  me: () => unwrap<User>(api.get("/auth/me")),
  updateMe: (body: Partial<Pick<User, "full_name" | "email" | "avatar_url">>) =>
    unwrap<User>(api.put("/auth/me", body)),
  changePassword: (body: { old_password: string; new_password: string }) =>
    unwrap<null>(api.put("/auth/me/password", body)),
};

// ---- Rooms ----------------------------------------------------------------
export interface RoomFilters {
  type?: string;
  floor?: number;
  status?: string;
  price_min?: number;
  price_max?: number;
  page?: number;
  limit?: number;
}

export const roomsApi = {
  list: (filters: RoomFilters = {}) =>
    unwrapList<Room>(api.get(`/rooms${qs(filters)}`)),
  get: (id: number) => unwrap<Room>(api.get(`/rooms/${id}`)),
  create: (body: Partial<Room>) => unwrap<Room>(api.post("/rooms", body)),
  update: (id: number, body: Partial<Room>) =>
    unwrap<Room>(api.put(`/rooms/${id}`, body)),
  remove: (id: number) => unwrap<null>(api.delete(`/rooms/${id}`)),
  updateStatus: (id: number, status: string) =>
    unwrap<Room>(api.put(`/rooms/${id}/status`, { status })),
  availability: (params: {
    check_in: string;
    check_out: string;
    type?: string;
  }) => unwrap<Room[]>(api.get(`/rooms/availability${qs(params)}`)),
  typeSummary: () => unwrap<RoomTypeSummary[]>(api.get("/rooms/types/summary")),
};

// ---- Guests ---------------------------------------------------------------
export interface GuestFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const guestsApi = {
  list: (filters: GuestFilters = {}) =>
    unwrapList<Guest>(api.get(`/guests${qs(filters)}`)),
  get: (id: number) => unwrap<Guest>(api.get(`/guests/${id}`)),
  create: (body: Partial<Guest>) => unwrap<Guest>(api.post("/guests", body)),
  update: (id: number, body: Partial<Guest>) =>
    unwrap<Guest>(api.put(`/guests/${id}`, body)),
  remove: (id: number) => unwrap<null>(api.delete(`/guests/${id}`)),
  bookings: (id: number) =>
    unwrap<Booking[]>(api.get(`/guests/${id}/bookings`)),
  invoices: (id: number) =>
    unwrap<Invoice[]>(api.get(`/guests/${id}/invoices`)),
  notify: (id: number, body: { subject: string; message: string }) =>
    unwrap<{ sent: boolean }>(api.post(`/guests/${id}/notify`, body)),
  search: (q: string) => unwrap<Guest[]>(api.get(`/guests/search${qs({ q })}`)),
};

// ---- Bookings -------------------------------------------------------------
export interface BookingFilters {
  status?: string;
  platform?: string;
  room_type?: string;
  date_from?: string;
  date_to?: string;
  guest_name?: string;
  booking_ref?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  list: (filters: BookingFilters = {}) =>
    unwrapList<Booking>(api.get(`/bookings${qs(filters)}`)),
  get: (id: string) => unwrap<Booking>(api.get(`/bookings/${id}`)),
  create: (body: Partial<Booking>) =>
    unwrap<Booking>(api.post("/bookings", body)),
  update: (id: string, body: Partial<Booking>) =>
    unwrap<Booking>(api.put(`/bookings/${id}`, body)),
  cancel: (id: string) => unwrap<null>(api.delete(`/bookings/${id}`)),
  updateStatus: (id: string, status: string) =>
    unwrap<Booking>(api.put(`/bookings/${id}/status`, { status })),
  checkIn: (id: string) => unwrap<Booking>(api.post(`/bookings/${id}/checkin`)),
  checkOut: (id: string) =>
    unwrap<{ booking: Booking; invoice: Invoice }>(
      api.post(`/bookings/${id}/checkout`),
    ),
  gantt: (params: {
    start_date: string;
    end_date: string;
    room_type?: string;
  }) => unwrap<GanttResponse>(api.get(`/bookings/gantt${qs(params)}`)),
  today: () =>
    unwrap<{ check_ins: Booking[]; check_outs: Booking[] }>(
      api.get("/bookings/today"),
    ),
  search: (q: string) =>
    unwrap<Booking[]>(api.get(`/bookings/search${qs({ q })}`)),
};

// ---- Housekeeping ---------------------------------------------------------
export interface TaskFilters {
  room_id?: number;
  status?: string;
  priority?: string;
  day?: string;
  page?: number;
  limit?: number;
}

export const housekeepingApi = {
  list: (filters: TaskFilters = {}) =>
    unwrapList<HousekeepingTask>(api.get(`/housekeeping${qs(filters)}`)),
  get: (id: number) => unwrap<HousekeepingTask>(api.get(`/housekeeping/${id}`)),
  create: (body: Partial<HousekeepingTask>) =>
    unwrap<HousekeepingTask>(api.post("/housekeeping", body)),
  update: (id: number, body: Partial<HousekeepingTask>) =>
    unwrap<HousekeepingTask>(api.put(`/housekeeping/${id}`, body)),
  updateStatus: (id: number, status: string) =>
    unwrap<HousekeepingTask>(api.put(`/housekeeping/${id}/status`, { status })),
  remove: (id: number) => unwrap<null>(api.delete(`/housekeeping/${id}`)),
  board: () => unwrap<BoardRoom[]>(api.get("/housekeeping/board")),
  today: () => unwrap<HousekeepingTask[]>(api.get("/housekeeping/today")),
};

// ---- Inventory ------------------------------------------------------------
export interface InventoryFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const inventoryApi = {
  list: (filters: InventoryFilters = {}) =>
    unwrapList<InventoryItem>(api.get(`/inventory${qs(filters)}`)),
  get: (id: number) => unwrap<InventoryItem>(api.get(`/inventory/${id}`)),
  create: (body: Partial<InventoryItem>) =>
    unwrap<InventoryItem>(api.post("/inventory", body)),
  update: (id: number, body: Partial<InventoryItem>) =>
    unwrap<InventoryItem>(api.put(`/inventory/${id}`, body)),
  remove: (id: number) => unwrap<null>(api.delete(`/inventory/${id}`)),
  restock: (id: number, body: { quantity: number }) =>
    unwrap<InventoryItem>(api.put(`/inventory/${id}/restock`, body)),
  lowStock: () => unwrap<InventoryItem[]>(api.get("/inventory/low-stock")),
  exportUrl: () =>
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/inventory/export`,
};

// ---- Messages -------------------------------------------------------------
export const messagesApi = {
  conversations: (filter: "all" | "unread" | "flagged" = "all") =>
    unwrap<ConversationSummary[]>(api.get(`/messages${qs({ filter })}`)),
  thread: (guestId: number) =>
    unwrap<Message[]>(api.get(`/messages/${guestId}`)),
  send: (guestId: number, body: { content: string; attachment_url?: string }) =>
    unwrap<Message>(api.post(`/messages/${guestId}`, body)),
  markRead: (id: number) => unwrap<Message>(api.put(`/messages/${id}/read`)),
  toggleFlag: (id: number) => unwrap<Message>(api.put(`/messages/${id}/flag`)),
  remove: (id: number) => unwrap<null>(api.delete(`/messages/${id}`)),
  unreadCount: () =>
    unwrap<{ unread_count: number }>(api.get("/messages/unread-count")),
};

// ---- Financials -----------------------------------------------------------
export interface ExpenseFilters {
  category?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const financialsApi = {
  overview: () => unwrap<FinancialOverview>(api.get("/financials/overview")),
  earnings: (year?: number) =>
    unwrap<EarningsPoint[]>(api.get(`/financials/earnings${qs({ year })}`)),
  breakdown: (year?: number) =>
    unwrap<CategoryBreakdown[]>(
      api.get(`/financials/breakdown${qs({ year })}`),
    ),
  incomeSources: (year?: number) =>
    unwrap<IncomeSource[]>(
      api.get(`/financials/income-sources${qs({ year })}`),
    ),
  expenses: (filters: ExpenseFilters = {}) =>
    unwrapList<Expense>(api.get(`/financials/expenses${qs(filters)}`)),
  getExpense: (id: number) =>
    unwrap<Expense>(api.get(`/financials/expenses/${id}`)),
  createExpense: (body: Partial<Expense>) =>
    unwrap<Expense>(api.post("/financials/expenses", body)),
  updateExpense: (id: number, body: Partial<Expense>) =>
    unwrap<Expense>(api.put(`/financials/expenses/${id}`, body)),
  removeExpense: (id: number) =>
    unwrap<null>(api.delete(`/financials/expenses/${id}`)),
  exportUrl: () =>
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/financials/expenses/export`,
};

// ---- Invoices -------------------------------------------------------------
export interface InvoiceFilters {
  status?: string;
  guest_name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const invoicesApi = {
  list: (filters: InvoiceFilters = {}) =>
    unwrapList<Invoice>(api.get(`/invoices${qs(filters)}`)),
  get: (id: number) => unwrap<Invoice>(api.get(`/invoices/${id}`)),
  create: (body: Partial<Invoice>) =>
    unwrap<Invoice>(api.post("/invoices", body)),
  update: (id: number, body: Partial<Invoice>) =>
    unwrap<Invoice>(api.put(`/invoices/${id}`, body)),
  pay: (id: number) => unwrap<Invoice>(api.put(`/invoices/${id}/pay`)),
  send: (id: number) =>
    unwrap<{ sent: boolean }>(api.post(`/invoices/${id}/send`)),
  overdue: () => unwrap<Invoice[]>(api.get("/invoices/overdue")),
  pdfUrl: (id: number) =>
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/invoices/${id}/pdf`,
};

// ---- Reviews --------------------------------------------------------------
export interface ReviewFilters {
  rating?: number;
  source?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const reviewsApi = {
  list: (filters: ReviewFilters = {}) =>
    unwrapList<Review>(api.get(`/reviews${qs(filters)}`)),
  get: (id: number) => unwrap<Review>(api.get(`/reviews/${id}`)),
  create: (body: Partial<Review>) => unwrap<Review>(api.post("/reviews", body)),
  reply: (id: number, staff_reply: string) =>
    unwrap<Review>(api.put(`/reviews/${id}/reply`, { staff_reply })),
  remove: (id: number) => unwrap<null>(api.delete(`/reviews/${id}`)),
  summary: () => unwrap<ReviewSummary>(api.get("/reviews/summary")),
};

// ---- Concierge ------------------------------------------------------------
export interface ConciergeFilters {
  request_type?: string;
  status?: string;
  priority?: string;
  guest_id?: number;
  page?: number;
  limit?: number;
}

export const conciergeApi = {
  list: (filters: ConciergeFilters = {}) =>
    unwrapList<ConciergeRequest>(api.get(`/concierge${qs(filters)}`)),
  get: (id: number) => unwrap<ConciergeRequest>(api.get(`/concierge/${id}`)),
  create: (body: Partial<ConciergeRequest>) =>
    unwrap<ConciergeRequest>(api.post("/concierge", body)),
  update: (id: number, body: Partial<ConciergeRequest>) =>
    unwrap<ConciergeRequest>(api.put(`/concierge/${id}`, body)),
  updateStatus: (id: number, status: string) =>
    unwrap<ConciergeRequest>(api.put(`/concierge/${id}/status`, { status })),
  cancel: (id: number) =>
    unwrap<ConciergeRequest>(api.delete(`/concierge/${id}`)),
  notify: (id: number) =>
    unwrap<{ sent: boolean }>(api.post(`/concierge/${id}/notify`)),
  pending: () => unwrap<{ pending: number }>(api.get("/concierge/pending")),
};

// ---- Dashboard / Calendar -------------------------------------------------
export const dashboardApi = {
  stats: () => unwrap<DashboardStats>(api.get("/dashboard/stats")),
  roomAvailability: () =>
    unwrap<RoomAvailability>(api.get("/dashboard/room-availability")),
  revenueChart: () =>
    unwrap<RevenuePoint[]>(api.get("/dashboard/revenue-chart")),
  reservationsChart: () =>
    unwrap<ReservationsPoint[]>(api.get("/dashboard/reservations-chart")),
  platformBreakdown: () =>
    unwrap<PlatformBreakdown[]>(api.get("/dashboard/platform-breakdown")),
  recentBookings: () =>
    unwrap<Booking[]>(api.get("/dashboard/recent-bookings")),
  ratings: () => unwrap<ReviewSummary>(api.get("/dashboard/ratings")),
  tasks: () => unwrap<HousekeepingTask[]>(api.get("/dashboard/tasks")),
  activityFeed: () =>
    unwrap<ActivityItem[]>(api.get("/dashboard/activity-feed")),
};

export const calendarApi = {
  month: (year: number, month: number) =>
    unwrap<
      Record<string, { bookings: number; checkins: number; checkouts: number }>
    >(api.get(`/calendar/month${qs({ year, month })}`)),
  day: (date: string) =>
    unwrap<{ arrivals: Booking[]; departures: Booking[] }>(
      api.get(`/calendar/day${qs({ date })}`),
    ),
};

// ---- Settings / Notifications ---------------------------------------------
export const settingsApi = {
  get: () => unwrap<HotelSettings>(api.get("/settings")),
  update: (body: Partial<HotelSettings>) =>
    unwrap<HotelSettings>(api.put("/settings", body)),
};

export const notificationsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    unwrapList<NotificationLog>(api.get(`/notifications${qs(params)}`)),
  unread: () => unwrap<NotificationLog[]>(api.get("/notifications/unread")),
  markRead: (id: number) =>
    unwrap<NotificationLog>(api.put(`/notifications/${id}/read`)),
};
