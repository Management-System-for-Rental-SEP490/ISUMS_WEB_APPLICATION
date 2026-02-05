import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/auth.store";

export default function RoleGuard({ allow = [] }) {
  const { isReady, isAuthenticated, roles } = useAuthStore((s) => ({
    isReady: s.isReady,
    isAuthenticated: s.isAuthenticated,
    roles: s.roles || [],
  }));

  if (!isReady) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const ok = allow.length === 0 || allow.some((r) => roles.includes(r));
  if (!ok) return <Navigate to="/403" replace />;

  return <Outlet />;
}
