import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertsList from "../../components/dashboard/AlertsList";
import ChartSection from "../../components/dashboard/ChartSection";
import StatsCard from "../../components/dashboard/StatsCard";
import Houses from "../../features/houses/pages/Houses";
import Utilities from "./Utilities";
import Tenants from "../../features/tenants/pages/Tenants";
import ContractsPage from "../../features/contracts/pages/ContractsPage";
import Reports from "../../features/reports/pages/Reports";
import Notifications from "../../features/notifications/pages/Notifications";
import Settings from "../../features/settings/pages/Settings";
import { authActions } from "../../features/auth/store/auth.store";
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

  useEffect(() => {
    if (location.state?.menu) {
      setActiveMenu(location.state.menu);
    }
  }, [location.state?.menu]);

  const headerTitles = {
    dashboard: "Dashboard",
    houses: "Bất động sản",
    utilities: "Tiện ích",
    tenants: "Khách thuê",
    contracts: "Hợp đồng",
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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Toggle chỉ dành cho mobile để header gọn hơn */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label={isSidebarOpen ? "Đóng menu" : "Mở menu"}
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h1 className="text-xl font-bold text-gray-900">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2.5 w-72 border border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
            <button
              type="button"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              HCMC
            </button>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                  A
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
              </button>

              {isUserMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                    aria-label="Close menu"
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {keycloak?.tokenParsed?.name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {keycloak?.tokenParsed?.email || "admin@smartutil.vn"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveMenu("settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4" />
                      Thông tin tài khoản
                    </button>

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
          {activeMenu === "tenants" && <Tenants />}
          {activeMenu === "contracts" && (
            <ContractsPage onNavigateMenu={setActiveMenu} />
          )}
          {activeMenu === "reports" && <Reports />}
          {activeMenu === "notifications" && <Notifications />}
          {activeMenu === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
