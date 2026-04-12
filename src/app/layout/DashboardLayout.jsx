import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Sidebar from "../../components/dashboard/Sidebar";
import {
  authActions,
  useAuthStore,
} from "../../features/auth/store/auth.store";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";
import { Search, Menu, MapPin, User, LogOut, ChevronDown } from "lucide-react";
import keycloak from "../../keycloak";

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

const PATHNAME_TITLES = {
  "/dashboard": "Dashboard",
  "/houses": "Bất động sản",
  "/utilities": "Tiện ích",
  "/users": "Khách Thuê",
  "/staff": "Nhân Viên",
  "/contracts": "Hợp đồng",
  "/contracts/pending": "Hợp Đồng Cần Ký",
  "/maintenance": "Lịch Làm Việc",
  "/maintenance/plans": "Kế Hoạch Bảo Trì",
  "/maintenance/jobs": "Công Việc Bảo Trì",
  "/maintenance/inspections": "Kết quả bàn giao",
  "/maintenance/inspections/:id": "Chi tiết kiểm tra",
  "/issues": "Danh Sách Yêu Cầu",
  "/issues/assignment": "Phân Công Xử Lý",
  "/issues/quotes": "Xác Nhận Báo Giá",
  "/issues/history": "Lịch Sử Theo BĐS",
  "/issues/price-list": "Bảng Giá Thiết Bị",
  "/reports": "Báo cáo",
  "/notifications": "Thông báo",
  "/settings": "Cài đặt",
};

export default function DashboardLayout() {
  if (keycloak?.authenticated) {
    keycloak.updateToken(30);
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const roles = useAuthStore((s) => s.roles ?? []);
  const roleLabel = getRoleLabel(roles);

  const currentTitle =
    PATHNAME_TITLES[location.pathname] ??
    Object.entries(PATHNAME_TITLES).find(
      ([pattern]) =>
        pattern.includes(":") &&
        new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$").test(
          location.pathname,
        ),
    )?.[1] ??
    "Dashboard";
  const isOnDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex items-start">
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
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className="sticky top-0 z-30 px-6 py-3.5 flex items-center gap-4 justify-between"
          style={{
            background: "#FAFFFE",
            borderBottom: "1px solid #C4DED5",
            boxShadow: "0 2px 12px -2px rgba(59,181,130,0.08)",
          }}
        >
          {/* LEFT: Toggle */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg transition"
              style={{ color: "#5A7A6E" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(59,181,130,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* CENTER: Search */}
          <div
            className="flex-1 max-w-xl flex items-center rounded-full px-4 py-2 transition-all"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
            onFocus={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(59,181,130,0.12)";
              e.currentTarget.style.borderColor = "#3bb582";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "#EAF4F0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "#C4DED5";
            }}
          >
            <Search
              className="w-4 h-4 mr-2.5 flex-shrink-0"
              style={{ color: "#5A7A6E" }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm hợp đồng, khách thuê, bất động sản..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "#1E2D28" }}
            />
          </div>

          {/* RIGHT: Actions + User */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3bb582";
                e.currentTarget.style.background = "rgba(59,181,130,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#C4DED5";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
              TP. HCM
            </button>

            <div
              className="hidden lg:block h-5 w-px mx-1"
              style={{ background: "#C4DED5" }}
            />

            <NotificationDropdown />

            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-white rounded-full text-xs font-semibold transition shadow-sm"
              style={{
                background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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

            <div className="h-5 w-px mx-1" style={{ background: "#C4DED5" }} />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
                  }}
                >
                  A
                </div>
                <div className="hidden md:block text-left">
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: "#1E2D28" }}
                  >
                    {keycloak?.tokenParsed?.name || "Admin"}
                  </p>
                  <p
                    className="text-[10px] leading-tight"
                    style={{ color: "#5A7A6E" }}
                  >
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
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl py-1.5 z-20"
                    style={{
                      background: "#FAFFFE",
                      border: "1px solid #C4DED5",
                      boxShadow: "0 10px 40px -10px rgba(32,150,216,0.18)",
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: "1px solid #C4DED5" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
                          }}
                        >
                          A
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "#1E2D28" }}
                          >
                            {keycloak?.tokenParsed?.name || "Admin User"}
                          </p>
                          <p className="text-xs" style={{ color: "#5A7A6E" }}>
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
                          navigate("/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: "#1E2D28" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#EAF4F0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <User
                          className="w-4 h-4"
                          style={{ color: "#5A7A6E" }}
                        />
                        Thông tin tài khoản
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: "#1E2D28" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#EAF4F0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "#5A7A6E" }}
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

                    <div
                      className="pt-1"
                      style={{ borderTop: "1px solid #C4DED5" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          authActions.logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: "#D95F4B" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(217,95,75,0.06)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
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

        <main className="flex-1 px-8 pt-6 pb-12 bg-gray-50">
          {/* Breadcrumb — chuẩn enterprise: trên đầu content, dưới header */}
          <div className="mb-4">
            <Breadcrumb
              items={[
                {
                  title: (
                    <span
                      className="cursor-pointer flex items-center gap-1 transition"
                      style={{ color: "#5A7A6E" }}
                      onClick={() => navigate("/dashboard")}
                    >
                      <HomeOutlined />
                      Trang chủ
                    </span>
                  ),
                },
                ...(!isOnDashboard
                  ? [
                      {
                        title: (
                          <span style={{ color: "#1E2D28", fontWeight: 600 }}>
                            {currentTitle}
                          </span>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
