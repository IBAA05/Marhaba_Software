import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types";

/**
 * Role guard HOC. Wrap protected pages:
 *   <RequireRole roles={["super_admin"]}><Financials /></RequireRole>
 * Redirects unauthorized users to /dashboard with a toast.
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!allowed) {
      toast.error("You don't have access to that page");
    }
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
