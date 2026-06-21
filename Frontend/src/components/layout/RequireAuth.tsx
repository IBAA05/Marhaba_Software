import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    const redirectState = { from: location.pathname };
    return <Navigate to="/login" replace state={redirectState} />;
  }
  return <Outlet />;
}
