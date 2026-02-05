import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/auth.store";

export default function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuthStore();

  if (!isReady) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
