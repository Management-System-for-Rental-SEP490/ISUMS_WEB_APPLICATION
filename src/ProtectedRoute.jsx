import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/auth.store";
import { FullPageLoading } from "./components/shared/Loading";

export default function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuthStore();

  if (!isReady)
    return <FullPageLoading label="Đang xác thực phiên đăng nhập..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
