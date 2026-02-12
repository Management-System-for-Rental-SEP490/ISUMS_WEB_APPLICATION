import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/auth.store";

export default function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuthStore();

  if (!isReady)
    return (
      <div className="p-6 text-gray-600 text-sm">Đang tải phiên đăng nhập...</div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
