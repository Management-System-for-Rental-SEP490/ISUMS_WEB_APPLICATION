import { useState } from "react";
import { useAuthStore } from "../../features/auth/store/auth.store";
import {
  AlertCircle,
  BarChart2,
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
  CheckCircle,
  MailQuestionIcon,
  PenLine,
  Tag,
  Settings,
  UserCheck,
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
  const roles = useAuthStore((s) => s.roles ?? []);
  const canSeePendingSign =
    roles.includes("ADMIN") || roles.includes("LANDLORD");

  // Group đang mở — bấm vào để toggle
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleNavClick = (e, menuId) => {
    e.preventDefault();
    setActiveMenu(menuId);
  };

  const activeCls = "bg-teal-500 text-white shadow-sm shadow-teal-200";
  const inactiveCls = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const subActiveCls = "bg-teal-50 text-teal-700 font-semibold";
  const subInactiveCls =
    "text-slate-500 hover:bg-slate-100 hover:text-slate-800";

  // navItems: item thường hoặc group có children (hover để xổ)
  const navItems = [
    { id: "dashboard", label: "Bảng Điều Khiển", icon: Home },
    { id: "houses", label: "Bất Động Sản", icon: Building2 },
    { id: "utilities", label: "Tiện Ích", icon: Zap },
    { id: "users", label: "Người Dùng", icon: Users },
    { id: "maintenance", label: "Lịch làm việc", icon: CalendarDays },
    {
      id: "bao-tri-group",
      label: "Bảo Trì",
      icon: ClipboardList,
      children: [
        {
          id: "maintenance-plans",
          label: "Kế hoạch bảo trì",
          icon: ClipboardList,
        },
        {
          id: "maintenance-jobs",
          label: "Danh sách công việc",
          icon: ClipboardList,
        },
        {
          id: "maintenance-inspections",
          label: "Kiểm tra nhà cửa",
          icon: ClipboardList,
        },
      ],
    },
    {
      id: "sua-chua-group",
      label: "Sửa Chữa",
      icon: AlertCircle,
      children: [
        {
          id: "issue-requests",
          label: "Danh sách thắc mắc",
          icon: MailQuestionIcon,
        },
        { id: "issue-assignment", label: "Phân công xử lý", icon: UserCheck },
        { id: "issue-quote-approval", label: "Xác nhận báo giá", icon: CheckCircle },
        { id: "issue-history", label: "Lịch sử theo BĐS", icon: BarChart2 },
        { id: "issue-price-list", label: "Bảng giá thiết bị", icon: Tag },
      ],
    },
    {
      id: "hop-dong-group",
      label: "Hợp Đồng",
      icon: FileText,
      children: [
        { id: "contracts", label: "Quản lý hợp đồng", icon: FileText },
        ...(canSeePendingSign
          ? [
              {
                id: "contracts-sign",
                label: "Hợp đồng cần xử lý",
                icon: PenLine,
              },
            ]
          : []),
      ],
    },
  ];

  const hasActiveChild = (item) =>
    item.children?.some((c) => c.id === activeMenu);

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
        {/* Header */}
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

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              // --- Group item (có children, bấm để xổ/thu) ---
              if (item.children) {
                const isExpanded = !!openGroups[item.id];
                const parentActive = hasActiveChild(item);

                return (
                  <div key={item.id}>
                    {/* Parent row — bấm để toggle */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      title={!isOpen ? item.label : undefined}
                      className={[
                        "flex items-center gap-3 py-2.5 px-3 rounded-xl w-full transition",
                        !isOpen ? "lg:justify-center" : "",
                        parentActive ? activeCls : inactiveCls,
                      ].join(" ")}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {isOpen && (
                        <>
                          <span className="text-sm flex-1 text-left">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={[
                              "w-3.5 h-3.5 transition-transform duration-200",
                              isExpanded ? "rotate-180" : "rotate-0",
                            ].join(" ")}
                          />
                        </>
                      )}
                    </button>

                    {/* Sub-items — chỉ hiện khi sidebar mở và đã bấm mở */}
                    {isOpen && isExpanded && (
                      <div className="mt-0.5 mb-1 space-y-0.5 pl-2">
                        {item.children.map((child) => {
                          const isActive = activeMenu === child.id;
                          return (
                            <a
                              key={child.id}
                              href="#"
                              onClick={(e) => handleNavClick(e, child.id)}
                              className={[
                                "flex items-center gap-3 py-2 px-3 rounded-xl transition",
                                isActive ? subActiveCls : subInactiveCls,
                              ].join(" ")}
                            >
                              <child.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">{child.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // --- Item thường ---
              const isActive = activeMenu === item.id;
              return (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => handleNavClick(e, item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={[
                    "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                    !isOpen ? "lg:justify-center" : "",
                    isActive ? activeCls : inactiveCls,
                  ].join(" ")}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </a>
              );
            })}
          </div>

          {/* System */}
          <div className="mt-4">
            {isOpen ? (
              <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Hệ Thống
              </p>
            ) : (
              <div className="my-2 border-t border-slate-100 mx-1" />
            )}
            <div className="space-y-0.5">
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "notifications")}
                title={!isOpen ? "Thông báo" : undefined}
                className={[
                  "flex items-center gap-3 py-2.5 px-3 relative rounded-xl transition",
                  !isOpen && "lg:justify-center",
                  activeMenu === "notifications" ? activeCls : inactiveCls,
                ].join(" ")}
              >
                <Bell className="w-[18px] h-[18px] flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Thông báo</span>
                )}
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
                title={!isOpen ? "Cài đặt" : undefined}
                className={[
                  "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                  !isOpen && "lg:justify-center",
                  activeMenu === "settings" ? activeCls : inactiveCls,
                ].join(" ")}
              >
                <Settings className="w-[18px] h-[18px] flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">Cài Đặt</span>}
              </a>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div
          className={[
            "px-3 py-3 border-t border-slate-100",
            !isOpen ? "lg:px-2" : "",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onLogout}
            title={!isOpen ? "Đăng Xuất" : undefined}
            className={[
              "flex items-center gap-3 py-2.5 px-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl w-full transition",
              !isOpen && "lg:justify-center",
            ].join(" ")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Đăng Xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
