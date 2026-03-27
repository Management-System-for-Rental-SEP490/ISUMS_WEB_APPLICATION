import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertsList from "../../components/dashboard/AlertsList";
import ChartSection from "../../components/dashboard/ChartSection";
import StatsCard from "../../components/dashboard/StatsCard";
import Houses from "../../features/houses/pages/Houses";
import Utilities from "./Utilities";
import UsersPage from "../../features/tenants/pages/UsersPage";
import ContractsPage from "../../features/contracts/pages/ContractsPage";
import ContractsPendingSignPage from "../../features/contracts/pages/ContractsPendingSignPage";
import SchedulePage from "../../features/schedule/pages/SchedulePage";
import MaintenancePlansPage from "../../features/schedule/pages/MaintenancePlansPage";
import MaintenanceJobsPage from "../../features/schedule/pages/MaintenanceJobsPage";
import IssueRequestsPage from "../../features/issues/pages/IssueRequestsPage";
import IssueAssignmentPage from "../../features/issues/pages/IssueAssignmentPage";
import IssueHistoryByPropertyPage from "../../features/issues/pages/IssueHistoryByPropertyPage";
import Reports from "../../features/reports/pages/Reports";
import Notifications from "../../features/notifications/pages/Notifications";
import Settings from "../../features/settings/pages/Settings";
import { authActions, useAuthStore } from "../../features/auth/store/auth.store";

const ROLE_LABELS = {
  LANDLORD: "Chủ nhà",
  MANAGER: "Quản lý",
};

function getRoleLabel(roles = []) {
  for (const role of roles) {
    if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  }
  return roles[0] ?? "Người dùng";
}
import {
  Search,
  Menu,
  X,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Droplet,
  Flame,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import keycloak from "../../keycloak";

export default function Dashboard() {
  if (keycloak?.authenticated) {
    keycloak.updateToken(30);
  }
  console.log(keycloak?.authenticated);
  console.log(keycloak?.token);
  console.log(keycloak?.tokenParsed);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [activeTab, setActiveTab] = useState("electricity");
  const [activeMenu, setActiveMenu] = useState(
    () => location.state?.menu ?? "dashboard",
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const roles = useAuthStore((s) => s.roles ?? []);
  const roleLabel = getRoleLabel(roles);

  useEffect(() => {
    if (location.state?.menu) {
      setActiveMenu(location.state.menu);
    }
  }, [location.state?.menu]);

  const headerTitles = {
    dashboard: "Dashboard",
    houses: "Bất động sản",
    utilities: "Tiện ích",
    users: "Người Dùng",
    contracts: "Hợp đồng",
    "contracts-sign": "Hợp Đồng Cần Ký",
    maintenance: "Lịch Làm Việc",
    "maintenance-plans": "Kế Hoạch Bảo Trì",
    "maintenance-jobs":     "Công Việc Bảo Trì",
    "issue-requests":       "Yêu Cầu Sửa Chữa",
    "issue-assignment":     "Phân Công Xử Lý",
    "issue-history":        "Lịch Sử Theo BĐS",
    reports: "Báo cáo",
    notifications: "Thông báo",
    settings: "Cài đặt",
  };
  const currentTitle = headerTitles[activeMenu] ?? headerTitles.dashboard;

  const stats = [
    {
      title: "Tổng Bất Động Sản",
      value: "18",
      subtitle: "Quận 1, 2, 7, Bình Thạnh",
      change: "12.5%",
      isIncrease: true,
      icon: Building2,
      color: "teal",
    },
    {
      title: "Khách Thuê",
      value: "234",
      subtitle: "97.2% tỷ lệ lấp đầy",
      change: "3.8%",
      isIncrease: true,
      icon: Users,
      color: "green",
    },
    {
      title: "Tiết Kiệm Năng Lượng",
      value: "15.2%",
      subtitle: "so với tháng trước",
      change: "15.2%",
      isIncrease: true,
      icon: TrendingUp,
      color: "yellow",
    },
    {
      title: "Tiết Kiệm Chi Phí",
      value: "₫45.8M",
      subtitle: "Tháng này",
      change: "8.4%",
      isIncrease: true,
      icon: DollarSign,
      color: "blue",
    },
  ];

  const alerts = [
    {
      id: 1,
      property: "Vinhomes Central Park",
      issue: "Phát hiện điện năng bất thường",
      severity: "critical",
      time: "2 phút trước",
      icon: Zap,
    },
    {
      id: 2,
      property: "Masteri Thảo Điền",
      issue: "Phát hiện rò rỉ nước",
      severity: "warning",
      time: "15 phút trước",
      icon: Droplet,
    },
    {
      id: 3,
      property: "Saigon Pearl",
      issue: "Tiêu thụ gas cao",
      severity: "warning",
      time: "1 giờ trước",
      icon: Flame,
    },
    {
      id: 4,
      property: "Landmark 81",
      issue: "Sắp chạm giới hạn công suất",
      severity: "warning",
      time: "3 giờ trước",
      icon: Zap,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((v) => !v)}
        onLogout={() => {
          authActions.logout();
          navigate("/login");
        }}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3.5 flex items-center gap-4 justify-between">
          {/* LEFT: Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            {/* Hamburger — hiện trên màn hình nhỏ (< lg) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-gray-200" />

            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm">
              <button
                type="button"
                onClick={() => setActiveMenu("dashboard")}
                className="text-gray-400 hover:text-teal-600 transition font-medium"
              >
                Trang chủ
              </button>
              {activeMenu !== "dashboard" && (
                <>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-700 font-semibold">
                    {currentTitle}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* CENTER: Search */}
          <div className="flex-1 max-w-xl flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/10 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm hợp đồng, khách thuê, bất động sản..."
              className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* RIGHT: Actions + User */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Location */}
            <button
              type="button"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-teal-300 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              TP. HCM
            </button>

            {/* Divider */}
            <div className="hidden lg:block h-5 w-px bg-gray-200 mx-1" />

            {/* Notifications bell */}
            <button
              type="button"
              onClick={() => setActiveMenu("notifications")}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Thông báo"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Quick add */}
            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm mới
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 mx-1" />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  A
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {keycloak?.tokenParsed?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
              </button>

              {isUserMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                    aria-label="Close menu"
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {keycloak?.tokenParsed?.name || "Admin User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {keycloak?.tokenParsed?.email ||
                              "admin@smartutil.vn"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveMenu("settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Thông tin tài khoản
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveMenu("settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Cài đặt
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          authActions.logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 pt-6 pb-10 bg-gray-50">
          {/* Render content dựa trên activeMenu */}
          {activeMenu === "dashboard" && (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Xin chào, Chủ nhà 👋
                  </h2>
                  <p className="text-gray-600">Quản lý tiện ích thông minh</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2">
                    <MapPin size={16} /> Bản đồ
                  </button>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
                    Thêm Bất Động Sản
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((s, i) => (
                  <StatsCard key={i} {...s} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <ChartSection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
                <AlertsList alerts={alerts} />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-6">
                  Danh Sách Bất Động Sản
                </h3>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {properties.map((p) => (
                    // <PropertyCard key={p.id} property={p} />
                  ))}
                </div> */}
              </div>
            </>
          )}

          {activeMenu === "houses" && <Houses />}
          {activeMenu === "utilities" && <Utilities />}
          {activeMenu === "users" && <UsersPage />}
          {activeMenu === "contracts" && (
            <ContractsPage onNavigateMenu={setActiveMenu} />
          )}
          {activeMenu === "contracts-sign" && <ContractsPendingSignPage />}
          {activeMenu === "maintenance" && <SchedulePage />}
          {activeMenu === "maintenance-plans" && <MaintenancePlansPage />}
          {activeMenu === "maintenance-jobs"  && <MaintenanceJobsPage />}
          {activeMenu === "issue-requests"   && <IssueRequestsPage />}
          {activeMenu === "issue-assignment" && <IssueAssignmentPage />}
          {activeMenu === "issue-history"    && <IssueHistoryByPropertyPage />}
          {activeMenu === "reports" && <Reports />}
          {activeMenu === "notifications" && <Notifications />}
          {activeMenu === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
