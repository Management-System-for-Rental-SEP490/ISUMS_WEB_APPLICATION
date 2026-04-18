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
import HouseDetailPage from "./features/houses/pages/HouseDetailPage";

import DashboardPage from "./features/dashboard/DashboardPage";
import Houses from "./features/houses/pages/Houses";
import Utilities from "./app/layout/Utilities";
import UsersPage from "./features/tenants/pages/UsersPage";
import StaffPage from "./features/tenants/pages/StaffPage";
import ContractsPage from "./features/contracts/pages/ContractsPage";
import ContractsPendingSignPage from "./features/contracts/pages/ContractsPendingSignPage";
import SchedulePage from "./features/schedule/pages/SchedulePage";
import MaintenancePlansPage from "./features/maintenance/pages/MaintenancePlansPage";
import MaintenanceJobsPage from "./features/maintenance/pages/MaintenanceJobsPage";
import InspectionsPage from "./features/maintenance/pages/InspectionsPage";
import InspectionResultPage from "./features/maintenance/pages/InspectionResultPage";
import IssueRequestsPage from "./features/issues/pages/IssueRequestsPage";
import IssueAssignmentPage from "./features/issues/pages/IssueAssignmentPage";
import IssueHistoryByPropertyPage from "./features/issues/pages/IssueHistoryByPropertyPage";
import IssuePriceListPage from "./features/issues/pages/IssuePriceListPage";
import IssueQuoteApprovalPage from "./features/issues/pages/IssueQuoteApprovalPage";
import Reports from "./features/reports/pages/Reports";
import Notifications from "./features/notifications/pages/Notifications";
import Settings from "./features/settings/pages/Settings";

const ALLOWED_ROLES = ["ADMIN", "LANDLORD", "MANAGER"];

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },

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
          {
            element: <DashboardLayout />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/houses", element: <Houses /> },
              { path: "/houses/:id", element: <HouseDetailPage /> },
              { path: "/utilities", element: <Utilities /> },
              { path: "/users", element: <UsersPage /> },
              { path: "/staff", element: <StaffPage /> },
              { path: "/contracts", element: <ContractsPage /> },
              { path: "/contracts/pending", element: <ContractsPendingSignPage /> },
              { path: "/maintenance", element: <SchedulePage /> },
              { path: "/maintenance/plans", element: <MaintenancePlansPage /> },
              { path: "/maintenance/jobs", element: <MaintenanceJobsPage /> },
              { path: "/maintenance/inspections", element: <InspectionsPage /> },
              { path: "/maintenance/inspections/:id", element: <InspectionResultPage /> },
              { path: "/issues", element: <IssueRequestsPage /> },
              { path: "/issues/assignment", element: <IssueAssignmentPage /> },
              { path: "/issues/quotes", element: <IssueQuoteApprovalPage /> },
              { path: "/issues/history", element: <IssueHistoryByPropertyPage /> },
              { path: "/issues/price-list", element: <IssuePriceListPage /> },
              { path: "/reports", element: <Reports /> },
              { path: "/notifications", element: <Notifications /> },
              { path: "/settings", element: <Settings /> },
            ],
          },
          { path: "/contracts/:id", element: <ContractDetailStandalone /> },
          { path: "/contracts/:id/edit", element: <ContractEditStandalone /> },
          { path: "/contracts/:id/sign", element: <AdminSignContract /> },
        ],
      },
    ],
  },

  { path: "*", element: <div className="p-6">404 Not Found</div> },
]);
