// ============================================================================
// Shared domain types for the Hotel Management System frontend.
// These mirror the backend Pydantic schemas / API response envelopes.
// ============================================================================

export type Role = "super_admin" | "receptionist";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination?: PaginationMeta;
}

// ---- Auth -----------------------------------------------------------------
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user: User;
}

// ---- Rooms ----------------------------------------------------------------
export type RoomType = "single" | "double" | "suite" | "family" | "deluxe";
export type RoomStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "out_of_order"
  | "need_ready"
  | "cleaning";

export interface Room {
  id: number;
  room_number: string;
  type: RoomType;
  floor: number;
  price_per_night: number;
  max_occupancy: number;
  description?: string;
  amenities: string[];
  photos: string[];
  has_panorama: boolean;
  status: RoomStatus;
  created_at: string;
}

export interface RoomTypeSummary {
  type: RoomType;
  total: number;
  available: number;
}

// ---- Guests ---------------------------------------------------------------
export type LoyaltyTier = "none" | "bronze" | "silver" | "gold";

export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  id_passport_number?: string;
  loyalty_tier: LoyaltyTier;
  total_stays: number;
  notes?: string;
  created_at: string;
}

// ---- Bookings -------------------------------------------------------------
export type BookingStatus =
  | "new"
  | "confirmed"
  | "due_in"
  | "checked_in"
  | "due_out"
  | "checked_out"
  | "booking_offer"
  | "out_of_order"
  | "cancelled";

export type PlatformSource =
  | "direct"
  | "booking_com"
  | "airbnb"
  | "expedia"
  | "agoda"
  | "other";

export interface Booking {
  id: string;
  booking_ref: string;
  guest_id: number;
  room_id: number;
  guest_name?: string;
  room_number?: string;
  room_type?: RoomType;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  total_price: number;
  status: BookingStatus;
  platform: PlatformSource;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface GanttRoom {
  id: number;
  number: string;
  type: RoomType;
  status: RoomStatus;
  bookings: {
    id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    status: BookingStatus;
    color: string;
  }[];
}

export interface GanttResponse {
  rooms: GanttRoom[];
  availability_counts: Record<string, Record<string, number>>;
}

// ---- Housekeeping ---------------------------------------------------------
export type TaskStatus = "pending" | "in_progress" | "completed" | "inspected";
export type TaskType =
  | "cleaning"
  | "inspection"
  | "turndown"
  | "maintenance"
  | "custom";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface HousekeepingTask {
  id: number;
  room_id: number;
  room_number?: string;
  assigned_to?: number | null;
  assigned_name?: string | null;
  task_type: TaskType;
  priority: Priority;
  notes?: string;
  status: TaskStatus;
  due_time?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface BoardRoom {
  room_id: number;
  room_number: string;
  type: RoomType;
  floor: number;
  status: RoomStatus;
  task_status?: TaskStatus | null;
  assigned_name?: string | null;
}

// ---- Inventory ------------------------------------------------------------
export type InventoryCategory =
  | "linens"
  | "toiletries"
  | "minibar"
  | "cleaning"
  | "maintenance"
  | "other";
export type StockStatus = "sufficient" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorder_level: number;
  stock_status: StockStatus;
  last_restocked?: string | null;
  supplier?: string;
  notes?: string;
  created_at: string;
}

// ---- Messages -------------------------------------------------------------
export type MessageSender = "guest" | "staff";

export interface Message {
  id: number;
  guest_id: number;
  sender: MessageSender;
  staff_user_id?: number | null;
  content: string;
  is_read: boolean;
  is_flagged: boolean;
  attachment_url?: string | null;
  sent_at: string;
}

export interface ConversationSummary {
  guest_id: number;
  guest_name: string;
  last_message: string;
  last_sent_at: string;
  unread_count: number;
  is_flagged: boolean;
}

// ---- Financials -----------------------------------------------------------
export type ExpenseCategory =
  | "salaries"
  | "utilities"
  | "maintenance"
  | "supplies"
  | "marketing"
  | "miscellaneous";
export type ExpenseStatus = "completed" | "pending" | "cancelled";

export interface Expense {
  id: number;
  name: string;
  category: ExpenseCategory;
  quantity: number;
  amount: number;
  date: string;
  status: ExpenseStatus;
  notes?: string;
  created_by?: number;
  created_at: string;
}

export interface FinancialOverview {
  total_balance: number;
  total_income: number;
  total_expenses: number;
  income_trend: number;
  expense_trend: number;
}

export interface EarningsPoint {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface IncomeSource {
  platform: string;
  amount: number;
  percentage: number;
}

// ---- Invoices -------------------------------------------------------------
export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: number;
  invoice_ref: string;
  booking_id: string;
  guest_id: number;
  guest_name?: string;
  room_number?: string;
  nights?: number;
  room_charges: number;
  extras: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  issued_at: string;
  due_date: string;
  paid_at?: string | null;
}

// ---- Reviews --------------------------------------------------------------
export type ReviewSource = "direct" | "google" | "tripadvisor";

export interface Review {
  id: number;
  guest_id: number;
  guest_name?: string;
  booking_id: string;
  overall_rating: number;
  cleanliness: number;
  staff: number;
  comfort: number;
  location: number;
  value: number;
  comment?: string;
  staff_reply?: string | null;
  source: ReviewSource;
  created_at: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  cleanliness: number;
  staff: number;
  comfort: number;
  location: number;
  value: number;
}

// ---- Concierge ------------------------------------------------------------
export type RequestType =
  | "airport_transfer"
  | "restaurant_reservation"
  | "spa"
  | "wake_up_call"
  | "extra_amenities"
  | "laundry"
  | "room_service"
  | "custom";
export type RequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ConciergeRequest {
  id: number;
  guest_id: number;
  guest_name?: string;
  booking_id: string;
  room_number?: string;
  request_type: RequestType;
  description?: string;
  priority: Priority;
  assigned_to?: number | null;
  assigned_name?: string | null;
  status: RequestStatus;
  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string;
  created_at: string;
}

// ---- Dashboard ------------------------------------------------------------
export interface DashboardStats {
  new_bookings_today: number;
  checkins_today: number;
  checkouts_today: number;
  revenue_this_month: number | null;
  new_bookings_trend?: number;
  checkins_trend?: number;
  checkouts_trend?: number;
  revenue_trend?: number;
}

export interface RoomAvailability {
  occupied: number;
  reserved: number;
  available: number;
  need_ready: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface ReservationsPoint {
  label: string;
  booked: number;
  cancelled: number;
}

export interface PlatformBreakdown {
  platform: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: "checkin" | "checkout" | "message" | "task" | "booking";
  description: string;
  created_at: string;
}

// ---- Settings -------------------------------------------------------------
export interface HotelSettings {
  id: number;
  hotel_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  currency: string;
  timezone: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  check_in_time?: string;
  check_out_time?: string;
  tax_rate: number;
  updated_at: string;
}

// ---- Notifications --------------------------------------------------------
export interface NotificationLog {
  id: number;
  type: "email" | "sms" | "internal";
  recipient_email?: string;
  subject: string;
  message: string;
  status: "sent" | "failed" | "pending";
  related_entity?: "booking" | "invoice" | "task" | "concierge";
  related_id?: string;
  is_read?: boolean;
  sent_at: string;
}
