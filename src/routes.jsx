import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AuthLayout from "./app/layout/AuthLayout"; // sửa path đúng dự án bạn
import DashboardLayout from "./app/layout/DashboardLayout"; // sửa path đúng dự án bạn
import LoginPage from "./features/auth/pages/LoginPage"; // đúng như bạn đang dùng

export const router = createBrowserRouter([
  // vào / thì đi thẳng /dashboard (ProtectedRoute sẽ đá về /login nếu chưa auth)
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // public
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  // protected
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <DashboardLayout /> }],
  },

  { path: "*", element: <div className="p-6">404 Not Found</div> },
]);
