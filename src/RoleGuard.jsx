import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/auth.store";
import { FullPageLoading } from "./components/shared/Loading";

export default function RoleGuard({ allow = [] }) {
  const { isReady, isAuthenticated, roles } = useAuthStore((s) => ({
    isReady: s.isReady,
    isAuthenticated: s.isAuthenticated,
    roles: s.roles || [],
  }));

  if (!isReady) return <FullPageLoading label="Đang xác thực phiên đăng nhập..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const ok = allow.length === 0 || allow.some((r) => roles.includes(r));
  if (!ok) return <Navigate to="/403" replace />;

  return <Outlet />;
}
