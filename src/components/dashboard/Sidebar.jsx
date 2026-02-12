import React from "react";
import {
  Building2,
  Home,
  Zap,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  Paperclip,
  Building,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onToggle,
  onLogout,
  activeMenu,
  setActiveMenu,
}) {
  // Hàm xử lý khi click vào menu
  const handleNavClick = (e, menuId) => {
    e.preventDefault();
    setActiveMenu(menuId);
  };

  const menuItems = [
    { id: "dashboard", label: "Bảng Điều Khiển", icon: Home },
    { id: "houses", label: "Bất Động Sản", icon: Building2 },
    { id: "utilities", label: "Tiện Ích", icon: Zap },
    { id: "tenants", label: "Khách Thuê", icon: Users },
    { id: "contracts", label: "Hợp Đồng", icon: FileText },
    { id: "reports", label: "Báo Cáo", icon: Paperclip },
  ];

  return (
    <aside
      className={[
        "bg-slate-900 text-white fixed lg:sticky top-0 h-screen z-40",
        "transition-all duration-300 ease-in-out",
        // Mobile: slide in/out
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        // Width: desktop expanded/collapsed
        "w-64",
        isOpen ? "lg:w-64" : "lg:w-20",
      ].join(" ")}
      aria-label="Sidebar"
    >
      <div
        className={`flex flex-col h-full ${isOpen ? "w-64" : "lg:w-20 w-64"} overflow-hidden`}
      >
        <div
          className={`p-4 border-b border-slate-800 ${isOpen ? "" : "lg:px-2"}`}
        >
          <div
            className={`flex items-center ${isOpen ? "justify-between" : "lg:flex-col lg:gap-2 justify-center"} gap-3`}
          >
            <div
              className={`flex items-center gap-3 ${isOpen ? "" : "lg:flex-col"}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Building className="w-6 h-6 text-white" />
              </div>
              {isOpen && (
                <div>
                  <h1 className="font-bold text-base tracking-wide">
                    SmartUtil
                  </h1>
                  <p className="text-xs text-slate-400">
                    Quản lý tiện ích IoT
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={[
                "p-2 rounded-lg hover:bg-slate-800 transition flex-shrink-0",
                "flex items-center justify-center",
              ].join(" ")}
              aria-label={isOpen ? "Thu nhỏ menu" : "Mở rộng menu"}
              title={isOpen ? "Thu nhỏ menu" : "Mở rộng menu"}
            >
              {/* Mobile: đóng drawer */}
              <span className="lg:hidden">
                <X className="w-5 h-5 text-slate-200" />
              </span>
              {/* Desktop: collapse/expand */}
              <span className="hidden lg:block">
                {isOpen ? (
                  <ChevronLeft className="w-5 h-5 text-slate-200" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                )}
              </span>
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {isOpen && (
            <p className="px-6 text-xs font-semibold text-slate-500 uppercase mb-3">
              Menu Chính
            </p>
          )}
          {menuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => handleNavClick(e, item.id)}
              className={[
                "flex items-center gap-3 py-3 transition rounded-lg",
                isOpen ? "px-6" : "lg:px-0 lg:justify-center px-6",
                activeMenu === item.id
                  ? "bg-slate-800/90 text-white border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/70",
              ].join(" ")}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </a>
          ))}

          {isOpen && (
            <p className="px-6 text-xs font-semibold text-slate-500 uppercase mt-6 mb-3">
              Hệ Thống
            </p>
          )}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, "notifications")}
            className={[
              "flex items-center gap-3 py-3 relative rounded-lg",
              isOpen ? "px-6" : "lg:px-0 lg:justify-center px-6",
              activeMenu === "notifications"
                ? "bg-slate-800/90 text-white border border-slate-700"
                : "text-slate-300 hover:bg-slate-800/70",
            ].join(" ")}
            title={!isOpen ? "Thông báo" : undefined}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm">Thông báo</span>}
            {isOpen ? (
              <span className="absolute right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
            ) : (
              <span className="absolute lg:right-2 lg:top-3 right-4 top-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </a>
          <a
            href="#"
            onClick={(e) => handleNavClick(e, "settings")}
            className={[
              "flex items-center gap-3 py-3 rounded-lg",
              isOpen ? "px-6" : "lg:px-0 lg:justify-center px-6",
              activeMenu === "settings"
                ? "bg-slate-800/90 text-white border border-slate-700"
                : "text-slate-300 hover:bg-slate-800/70",
            ].join(" ")}
            title={!isOpen ? "Cài đặt" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm">Cài Đặt</span>}
          </a>
        </nav>

        <div
          className={`p-4 border-t border-slate-800 ${isOpen ? "" : "lg:px-2"}`}
        >
          <button
            onClick={onLogout}
            className={[
              "flex items-center gap-3 py-3 text-slate-300 hover:bg-slate-800/70 rounded-lg w-full transition",
              isOpen ? "px-4" : "lg:px-0 lg:justify-center px-4",
            ].join(" ")}
            title={!isOpen ? "Đăng Xuất" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm">Đăng Xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
