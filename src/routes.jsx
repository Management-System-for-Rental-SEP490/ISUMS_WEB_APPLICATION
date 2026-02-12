import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AuthLayout from "./app/layout/AuthLayout";
import DashboardLayout from "./app/layout/DashboardLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import ContractDetailStandalone from "./features/contracts/pages/ContractDetailStandalone";
import ContractEditStandalone from "./features/contracts/pages/ContractEditStandalone";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  // public
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  // protected
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardLayout /> },
      { path: "/contracts/:id", element: <ContractDetailStandalone /> },
       { path: "/contracts/:id/edit", element: <ContractEditStandalone /> },
    ],
  },

  { path: "*", element: <div className="p-6">404 Not Found</div> },
]);
