import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

import AuthLayout from "./app/layout/AuthLayout";
import DashboardLayout from "./app/layout/DashboardLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import UnauthorizedPage from "./features/auth/pages/UnauthorizedPage";
import AdminSignContract from "./features/contracts/pages/AdminSignContract";
import ContractDetailStandalone from "./features/contracts/pages/ContractDetailStandalone";
import ContractEditStandalone from "./features/contracts/pages/ContractEditStandalone";

const ALLOWED_ROLES = ["ADMIN", "LANDLORD", "MANAGER"];

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  // public
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  // 403
  { path: "/403", element: <UnauthorizedPage /> },

  // protected – chỉ ADMIN / LANDLORD / MANAGER
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allow={ALLOWED_ROLES} />,
        children: [
          { path: "/dashboard", element: <DashboardLayout /> },
          { path: "/contracts/:id", element: <ContractDetailStandalone /> },
          { path: "/contracts/:id/edit", element: <ContractEditStandalone /> },
          { path: "/contracts/:id/sign", element: <AdminSignContract /> },
        ],
      },
    ],
  },

  { path: "*", element: <div className="p-6">404 Not Found</div> },
]);
