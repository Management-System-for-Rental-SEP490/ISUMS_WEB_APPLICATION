import { useState } from "react";
import { useAuthStore } from "../../features/auth/store/auth.store";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Paperclip,
  PenLine,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

export default function Sidebar({
  isOpen,
  onToggle,
  onLogout,
  activeMenu,
  setActiveMenu,
}) {
  const [contractsOpen, setContractsOpen] = useState(
    activeMenu === "contracts" || activeMenu === "contracts-sign",
  );
  const [maintenanceOpen, setMaintenanceOpen] = useState(
    activeMenu === "maintenance" ||
      activeMenu === "maintenance-plans" ||
      activeMenu === "maintenance-jobs",
  );
  const roles = useAuthStore((s) => s.roles ?? []);
  const isAdmin = roles.includes("ADMIN");
  const isLandlord = roles.includes("LANDLORD");
  const canSeePendingSign = isAdmin || isLandlord;

  const handleNavClick = (e, menuId) => {
    e.preventDefault();
    setActiveMenu(menuId);
  };

  const handleContractsToggle = (e) => {
    e.preventDefault();
    if (!isOpen) {
      setActiveMenu("contracts");
    } else {
      setContractsOpen((prev) => !prev);
    }
  };

  const topMenuItems = [
    { id: "dashboard", label: "Bảng Điều Khiển", icon: Home },
    { id: "houses", label: "Bất Động Sản", icon: Building2 },
    { id: "utilities", label: "Tiện Ích", icon: Zap },
    { id: "users", label: "Người Dùng", icon: Users },
  ];

  const isMaintenanceActive =
    activeMenu === "maintenance" ||
    activeMenu === "maintenance-plans" ||
    activeMenu === "maintenance-jobs";

  const handleMaintenanceToggle = (e) => {
    e.preventDefault();
    if (!isOpen) {
      setActiveMenu("maintenance");
    } else {
      setMaintenanceOpen((prev) => !prev);
    }
  };

  const isContractsActive =
    activeMenu === "contracts" || activeMenu === "contracts-sign";

  const activeItemCls = "bg-teal-500 text-white shadow-sm shadow-teal-200";
  const inactiveItemCls =
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  return (
    <aside
      className={[
        "bg-white border-r border-slate-200 text-slate-800 fixed left-0 inset-y-0 z-40",
        "lg:sticky lg:top-0 lg:h-screen",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        "lg:translate-x-0",
        !isOpen ? "lg:w-20" : "lg:w-64",
      ].join(" ")}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className={[
            "px-4 py-4 border-b border-slate-100",
            !isOpen ? "lg:px-2" : "",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center gap-3",
              isOpen
                ? "justify-between"
                : "lg:flex-col lg:gap-2 justify-center",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center gap-2.5 min-w-0",
                !isOpen ? "lg:flex-col" : "",
              ].join(" ")}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-teal-200">
                <img
                  src={logo}
                  alt="ISUMS Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              {isOpen && (
                <div className="min-w-0">
                  <h1 className="font-extrabold text-base text-teal-700 leading-tight tracking-wide truncate">
                    ISUMS
                  </h1>
                  <p className="text-[10px] font-medium text-slate-400 leading-snug whitespace-normal">
                    Hệ thống nhà cho thuê
                    <br />
                    thông minh
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label={isOpen ? "Thu nhỏ menu" : "Mở rộng menu"}
              title={isOpen ? "Thu nhỏ menu" : "Mở rộng menu"}
            >
              <span className="lg:hidden">
                <X className="w-4 h-4" />
              </span>
              <span className="hidden lg:block">
                {isOpen ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* ── Nav ────────────────────────────────────────────── */}
        <nav className="flex-1 py-3 overflow-y-auto px-3 space-y-0.5">
          {isOpen && (
            <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Menu Chính
            </p>
          )}

          {topMenuItems.map((item) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => handleNavClick(e, item.id)}
              className={[
                "flex items-center gap-3 py-2.5 px-3 transition rounded-xl",
                !isOpen && "lg:justify-center",
                activeMenu === item.id ? activeItemCls : inactiveItemCls,
              ].join(" ")}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </a>
          ))}

          {/* Maintenance group */}
          <a
            href="#"
            onClick={handleMaintenanceToggle}
            className={[
              "flex items-center gap-3 py-2.5 px-3 transition rounded-xl",
              !isOpen && "lg:justify-center",
              isMaintenanceActive ? activeItemCls : inactiveItemCls,
            ].join(" ")}
            title={!isOpen ? "Lịch Sửa Chữa" : undefined}
          >
            <CalendarDays className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && (
              <>
                <span className="text-sm font-medium flex-1">
                  Lịch Sửa Chữa
                </span>
                <ChevronDown
                  className={[
                    "w-4 h-4 transition-transform duration-200",
                    isMaintenanceActive ? "text-white/70" : "text-slate-400",
                    maintenanceOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </>
            )}
          </a>

          {isOpen && maintenanceOpen && (
            <div className="ml-4 border-l-2 border-teal-100 pl-2 space-y-0.5">
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "maintenance")}
                className={[
                  "flex items-center gap-3 py-2 px-3 transition rounded-xl text-sm",
                  activeMenu === "maintenance"
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")}
              >
                <CalendarDays className="w-4 h-4 flex-shrink-0" />
                <span>Lịch làm việc</span>
              </a>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "maintenance-plans")}
                className={[
                  "flex items-center gap-3 py-2 px-3 transition rounded-xl text-sm",
                  activeMenu === "maintenance-plans"
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")}
              >
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>Kế hoạch bảo trì</span>
              </a>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "maintenance-jobs")}
                className={[
                  "flex items-center gap-3 py-2 px-3 transition rounded-xl text-sm",
                  activeMenu === "maintenance-jobs"
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")}
              >
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>Công việc bảo trì</span>
              </a>
            </div>
          )}

          {/* Contracts group */}
          <a
            href="#"
            onClick={handleContractsToggle}
            className={[
              "flex items-center gap-3 py-2.5 px-3 transition rounded-xl",
              !isOpen && "lg:justify-center",
              isContractsActive ? activeItemCls : inactiveItemCls,
            ].join(" ")}
            title={!isOpen ? "Hợp Đồng" : undefined}
          >
            <FileText className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && (
              <>
                <span className="text-sm font-medium flex-1">Hợp Đồng</span>
                <ChevronDown
                  className={[
                    "w-4 h-4 transition-transform duration-200",
                    isContractsActive ? "text-white/70" : "text-slate-400",
                    contractsOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </>
            )}
          </a>

          {isOpen && contractsOpen && (
            <div className="ml-4 border-l-2 border-teal-100 pl-2 space-y-0.5">
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "contracts")}
                className={[
                  "flex items-center gap-3 py-2 px-3 transition rounded-xl text-sm",
                  activeMenu === "contracts"
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                ].join(" ")}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Quản lý hợp đồng</span>
              </a>
              {canSeePendingSign && (
                <a
                  href="#"
                  onClick={(e) => handleNavClick(e, "contracts-sign")}
                  className={[
                    "flex items-center gap-3 py-2 px-3 transition rounded-xl text-sm",
                    activeMenu === "contracts-sign"
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                  ].join(" ")}
                >
                  <PenLine className="w-4 h-4 flex-shrink-0" />
                  <span>Hợp đồng cần xử lý</span>
                </a>
              )}
            </div>
          )}

          {/* Reports */}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, "reports")}
            className={[
              "flex items-center gap-3 py-2.5 px-3 transition rounded-xl",
              !isOpen && "lg:justify-center",
              activeMenu === "reports" ? activeItemCls : inactiveItemCls,
            ].join(" ")}
            title={!isOpen ? "Báo Cáo" : undefined}
          >
            <Paperclip className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Báo Cáo</span>}
          </a>

          {/* System section */}
          {isOpen ? (
            <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-5 mb-2">
              Hệ Thống
            </p>
          ) : (
            <div className="my-3 border-t border-slate-100 mx-1" />
          )}

          <a
            href="#"
            onClick={(e) => handleNavClick(e, "notifications")}
            className={[
              "flex items-center gap-3 py-2.5 px-3 relative rounded-xl transition",
              !isOpen && "lg:justify-center",
              activeMenu === "notifications" ? activeItemCls : inactiveItemCls,
            ].join(" ")}
            title={!isOpen ? "Thông báo" : undefined}
          >
            <Bell className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Thông báo</span>}
            {isOpen ? (
              <span className="absolute right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                4
              </span>
            ) : (
              <span className="absolute lg:right-2 lg:top-2 right-4 top-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </a>

          <a
            href="#"
            onClick={(e) => handleNavClick(e, "settings")}
            className={[
              "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
              !isOpen && "lg:justify-center",
              activeMenu === "settings" ? activeItemCls : inactiveItemCls,
            ].join(" ")}
            title={!isOpen ? "Cài đặt" : undefined}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Cài Đặt</span>}
          </a>
        </nav>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div
          className={[
            "px-3 py-3 border-t border-slate-100",
            !isOpen ? "lg:px-2" : "",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onLogout}
            className={[
              "flex items-center gap-3 py-2.5 px-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl w-full transition",
              !isOpen && "lg:justify-center",
            ].join(" ")}
            title={!isOpen ? "Đăng Xuất" : undefined}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Đăng Xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
