import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { RequireRole } from "@/components/layout/RequireRole";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReservationsPage } from "@/pages/ReservationsPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { GuestsPage } from "@/pages/GuestsPage";
import { GuestProfilePage } from "@/pages/GuestProfilePage";
import { MessagesPage } from "@/pages/MessagesPage";
import { HousekeepingPage } from "@/pages/HousekeepingPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { FinancialsPage } from "@/pages/FinancialsPage";
import { InvoicesPage } from "@/pages/InvoicesPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { ConciergePage } from "@/pages/ConciergePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/guests/:id" element={<GuestProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route
            path="/financials"
            element={
              <RequireRole roles={["super_admin"]}>
                <FinancialsPage />
              </RequireRole>
            }
          />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/concierge" element={<ConciergePage />} />
          <Route
            path="/settings"
            element={
              <RequireRole roles={["super_admin"]}>
                <SettingsPage />
              </RequireRole>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
