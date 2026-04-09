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
  UserCog,
  Wrench,
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
  unreadCount = 0,
}) {
  const roles = useAuthStore((s) => s.roles ?? []);
  const canSeePendingSign =
    roles.includes("ADMIN") || roles.includes("LANDLORD");

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleNavClick = (e, menuId) => {
    e.preventDefault();
    setActiveMenu(menuId);
  };

  const sections = [
    {
      id: "tong-quan",
      label: "Tổng Quan",
      collapsible: false,
      items: [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "utilities", label: "Tiện Ích", icon: Zap },
        { id: "maintenance", label: "Lịch Làm Việc", icon: CalendarDays },
      ],
    },
    {
      id: "bat-dong-san-group",
      label: "Bất Động Sản",
      collapsible: true,
      items: [
        { id: "houses", label: "Quản lý nhà", icon: Building2 },
        { id: "assets", label: "Thiết bị trong nhà", icon: Wrench, disabled: true },
      ],
    },
    {
      id: "nguoi-dung-group",
      label: "Người Dùng",
      collapsible: true,
      items: [
        { id: "users", label: "Khách thuê", icon: Users },
        { id: "staff", label: "Nhân viên", icon: UserCog },
      ],
    },
    {
      id: "bao-tri-group",
      label: "Bảo Trì",
      collapsible: true,
      items: [
        { id: "maintenance-plans", label: "Kế hoạch bảo trì", icon: ClipboardList },
        { id: "maintenance-jobs", label: "Công việc bảo trì", icon: ClipboardList },
        { id: "maintenance-inspections", label: "Kiểm tra nhà cửa", icon: ClipboardList },
      ],
    },
    {
      id: "sua-chua-group",
      label: "Sửa Chữa",
      collapsible: true,
      items: [
        { id: "issue-requests", label: "Danh sách thắc mắc", icon: MailQuestionIcon },
        { id: "issue-assignment", label: "Phân công xử lý", icon: UserCheck },
        { id: "issue-quote-approval", label: "Xác nhận báo giá", icon: CheckCircle },
        { id: "issue-history", label: "Lịch sử theo BĐS", icon: BarChart2 },
        { id: "issue-price-list", label: "Bảng giá thiết bị", icon: Tag },
      ],
    },
    {
      id: "hop-dong-group",
      label: "Hợp Đồng",
      collapsible: true,
      items: [
        { id: "contracts", label: "Quản lý hợp đồng", icon: FileText },
        ...(canSeePendingSign
          ? [{ id: "contracts-sign", label: "Hợp đồng cần xử lý", icon: PenLine }]
          : []),
      ],
    },
    {
      id: "he-thong",
      label: "Hệ Thống",
      collapsible: false,
      items: [
        { id: "notifications", label: "Thông báo", icon: Bell, badge: unreadCount },
        { id: "settings", label: "Cài Đặt", icon: Settings },
      ],
    },
  ];

  const hasActiveChild = (section) =>
    section.items?.some((c) => c.id === activeMenu);

  return (
    <aside
      className={[
        "bg-slate-100 border-r border-slate-200 text-slate-800 fixed left-0 inset-y-0 z-40",
        "lg:sticky lg:top-0 lg:h-screen",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        "lg:translate-x-0",
        !isOpen ? "lg:w-[70px]" : "lg:w-64",
      ].join(" ")}
    >
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Logo ── */}
        <div className="bg-white border-b border-slate-200 flex-shrink-0">
          {isOpen ? (
            /* Expanded: logo + text + chevron ngang */
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow ring-2 ring-teal-200">
                <img src={logo} alt="ISUMS Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-sm text-teal-700 tracking-wide truncate">ISUMS</h1>
                <p className="text-[10px] text-slate-400 leading-snug">Hệ thống nhà cho thuê thông minh</p>
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <span className="lg:hidden"><X className="w-4 h-4" /></span>
                <span className="hidden lg:block"><ChevronLeft className="w-4 h-4" /></span>
              </button>
            </div>
          ) : (
            /* Collapsed: logo căn giữa + chevron nhỏ bên dưới */
            <div className="flex flex-col items-center py-3 gap-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow ring-2 ring-teal-200">
                <img src={logo} alt="ISUMS Logo" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
              >
                <span className="lg:hidden"><X className="w-3.5 h-3.5" /></span>
                <span className="hidden lg:block"><ChevronRight className="w-3.5 h-3.5" /></span>
              </button>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {sections.map((section) => {
            const isExpanded = !!openGroups[section.id];
            const sectionHasActive = hasActiveChild(section);

            // ── Thu nhỏ (icon only) ──
            if (!isOpen) {
              return (
                <div key={section.id} className="space-y-0.5">
                  <div className="my-1 border-t border-slate-200 mx-1" />
                  {section.items.filter(i => !i.disabled).map((item) => {
                    const isActive = activeMenu === item.id;
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href="#"
                        onClick={(e) => handleNavClick(e, item.id)}
                        title={item.label}
                        className={[
                          "relative flex items-center justify-center p-2.5 rounded-xl transition",
                          isActive
                            ? "bg-teal-500 text-white shadow-sm"
                            : "text-slate-500 hover:bg-white hover:text-teal-600 hover:shadow-sm",
                        ].join(" ")}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {item.badge > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </a>
                    );
                  })}
                </div>
              );
            }

            // ── Full sidebar ──
            return (
              <div
                key={section.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Header */}
                {section.collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(section.id)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 transition-colors",
                      isExpanded ? "border-b border-slate-100" : "",
                      "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className={[
                      "text-[11px] font-bold uppercase tracking-widest",
                      sectionHasActive ? "text-teal-600" : "text-slate-400",
                    ].join(" ")}>
                      {section.label}
                    </span>
                    <ChevronDown
                      className={[
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isExpanded ? "rotate-180" : "",
                        sectionHasActive ? "text-teal-400" : "text-slate-300",
                      ].join(" ")}
                    />
                  </button>
                ) : (
                  <div className="px-4 py-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {section.label}
                    </span>
                  </div>
                )}

                {/* Items — pill style */}
                {(!section.collapsible || isExpanded) && (
                  <div className="p-1.5 space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = activeMenu === item.id;
                      const Icon = item.icon;

                      if (item.disabled) {
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed"
                          >
                            <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                            <span className="text-sm text-slate-400 flex-1">{item.label}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">Soon</span>
                          </div>
                        );
                      }

                      return (
                        <a
                          key={item.id}
                          href="#"
                          onClick={(e) => handleNavClick(e, item.id)}
                          className={[
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                            isActive
                              ? "bg-teal-500 text-white shadow-sm shadow-teal-200"
                              : "text-slate-600 hover:bg-teal-50 hover:text-teal-700",
                          ].join(" ")}
                        >
                          <Icon className={["w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-slate-400"].join(" ")} />
                          <span className={["text-sm flex-1", isActive ? "font-semibold" : ""].join(" ")}>{item.label}</span>
                          {item.badge > 0 && (
                            <span className={[
                              "min-w-[20px] h-5 text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                              isActive ? "bg-white/30 text-white" : "bg-red-500 text-white",
                            ].join(" ")}>
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <div className={["bg-white px-3 py-3 border-t border-slate-200 flex-shrink-0", !isOpen ? "lg:px-2" : ""].join(" ")}>
          <button
            type="button"
            onClick={onLogout}
            title={!isOpen ? "Đăng Xuất" : undefined}
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition",
              "text-slate-500 hover:bg-red-50 hover:text-red-600",
              !isOpen ? "lg:justify-center" : "",
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
