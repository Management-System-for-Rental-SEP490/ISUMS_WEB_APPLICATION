import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  LayoutDashboard,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

export default function Sidebar({
  isOpen,
  onToggle,
  onLogout,
  unreadCount = 0,
}) {
  const roles = useAuthStore((s) => s.roles ?? []);
  const canSeePendingSign =
    roles.includes("ADMIN") || roles.includes("LANDLORD");

  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const isExpanded = isOpen;

  const sections = [
    {
      id: "tong-quan",
      label: "Tổng Quan",
      icon: LayoutDashboard,
      collapsible: false,
      items: [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
        { id: "utilities", label: "Tiện Ích", icon: Zap, path: "/utilities" },
        {
          id: "maintenance",
          label: "Lịch Làm Việc",
          icon: CalendarDays,
          path: "/maintenance",
        },
      ],
    },
    {
      id: "bat-dong-san-group",
      label: "Bất Động Sản",
      icon: Building2,
      collapsible: true,
      items: [
        {
          id: "houses",
          label: "Quản lý nhà",
          icon: Building2,
          path: "/houses",
        },
        {
          id: "assets",
          label: "Thiết bị trong nhà",
          icon: Wrench,
          disabled: true,
        },
      ],
    },
    {
      id: "nguoi-dung-group",
      label: "Người Dùng",
      icon: Users,
      collapsible: true,
      items: [
        { id: "users", label: "Khách thuê", icon: Users, path: "/users" },
        { id: "staff", label: "Nhân viên", icon: UserCog, path: "/staff" },
      ],
    },
    {
      id: "hop-dong-group",
      label: "Hợp Đồng",
      icon: FileText,
      collapsible: true,
      items: [
        {
          id: "contracts",
          label: "Quản lý hợp đồng",
          icon: FileText,
          path: "/contracts",
        },
        ...(canSeePendingSign
          ? [
              {
                id: "contracts-sign",
                label: "Hợp đồng cần xử lý",
                icon: PenLine,
                path: "/contracts/pending",
              },
            ]
          : []),
      ],
    },
    {
      id: "bao-tri-group",
      label: "Bảo Trì",
      icon: ClipboardList,
      collapsible: true,
      items: [
        {
          id: "maintenance-plans",
          label: "Kế hoạch bảo trì",
          icon: ClipboardList,
          path: "/maintenance/plans",
        },
        {
          id: "maintenance-jobs",
          label: "Công việc bảo trì",
          icon: ClipboardList,
          path: "/maintenance/jobs",
        },
        {
          id: "maintenance-inspections",
          label: "Kiểm tra nhà cửa",
          icon: ClipboardList,
          path: "/maintenance/inspections",
        },
      ],
    },
    {
      id: "sua-chua-group",
      label: "Sửa Chữa",
      icon: AlertCircle,
      collapsible: true,
      items: [
        {
          id: "issue-requests",
          label: "Danh sách thắc mắc",
          icon: MailQuestionIcon,
          path: "/issues",
        },
        {
          id: "issue-assignment",
          label: "Phân công xử lý",
          icon: UserCheck,
          path: "/issues/assignment",
        },
        {
          id: "issue-quote-approval",
          label: "Xác nhận báo giá",
          icon: CheckCircle,
          path: "/issues/quotes",
        },
        {
          id: "issue-history",
          label: "Lịch sử theo BĐS",
          icon: BarChart2,
          path: "/issues/history",
        },
        {
          id: "issue-price-list",
          label: "Bảng giá thiết bị",
          icon: Tag,
          path: "/issues/price-list",
        },
      ],
    },
    {
      id: "he-thong",
      label: "Hệ Thống",
      icon: Settings,
      collapsible: false,
      items: [
        {
          id: "notifications",
          label: "Thông báo",
          icon: Bell,
          path: "/notifications",
          badge: unreadCount,
        },
        { id: "settings", label: "Cài Đặt", icon: Settings, path: "/settings" },
      ],
    },
  ];

  const isItemActive = (item) => location.pathname === item.path;

  const hasActiveChild = (section) =>
    section.items?.some((item) => item.path && location.pathname === item.path);

  // Brand gradient style (matches mobile: #3bb582 → #2096d8, diagonal)
  const brandGradientStyle = {
    background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
  };

  return (
    <aside
      onMouseEnter={() => !isOpen && onToggle()}
      className={[
        "bg-slate-100 border-r border-slate-200 text-slate-800 fixed left-0 inset-y-0 z-40",
        "lg:sticky lg:top-0 lg:h-screen",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isExpanded ? "lg:w-64" : "lg:w-[72px]",
      ].join(" ")}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* ── Logo ── */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow ring-2 ring-[#3bb582]/40">
                <img
                  src={logo}
                  alt="ISUMS Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className="font-extrabold text-sm tracking-wide truncate"
                  style={{ color: "#3bb582" }}
                >
                  ISUMS
                </h1>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Hệ thống nhà cho thuê thông minh
                </p>
              </div>
              {isOpen && (
                <button
                  type="button"
                  onClick={onToggle}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  <span className="lg:hidden">
                    <X className="w-4 h-4" />
                  </span>
                  <span className="hidden lg:block">
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-3.5 gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow ring-2 ring-[#3bb582]/40">
                <img
                  src={logo}
                  alt="ISUMS Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="p-1 rounded-lg hover:bg-slate-200 transition text-slate-400 hover:text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-2">
          {/* ══ COLLAPSED: 1 icon đại diện mỗi section ══ */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-1">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = hasActiveChild(section);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      const first = section.items.find(
                        (i) => !i.disabled && i.path,
                      );
                      if (first) navigate(first.path);
                    }}
                    title={section.label}
                    style={isActive ? brandGradientStyle : undefined}
                    className={[
                      "relative flex items-center justify-center w-11 h-11 rounded-xl transition",
                      isActive
                        ? "text-white shadow-sm"
                        : "text-slate-400 hover:bg-white hover:shadow-sm",
                    ].join(" ")}
                  >
                    <SectionIcon className="w-[18px] h-[18px]" />
                    {section.items.some((i) => i.badge > 0) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ══ EXPANDED: card sections đầy đủ ══ */}
          {isExpanded &&
            sections.map((section) => {
              const isGroupExpanded = !!openGroups[section.id];
              const sectionHasActive = hasActiveChild(section);

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
                        "w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50",
                        isGroupExpanded ? "border-b border-slate-100" : "",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "text-[11px] font-bold uppercase tracking-widest",
                          sectionHasActive ? "" : "text-slate-400",
                        ].join(" ")}
                        style={
                          sectionHasActive ? { color: "#3bb582" } : undefined
                        }
                      >
                        {section.label}
                      </span>
                      <ChevronDown
                        className={[
                          "w-3.5 h-3.5 transition-transform duration-200",
                          isGroupExpanded ? "rotate-180" : "",
                        ].join(" ")}
                        style={
                          sectionHasActive
                            ? { color: "#3bb582" }
                            : { color: "#cbd5e1" }
                        }
                      />
                    </button>
                  ) : (
                    <div className="px-4 py-3 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {section.label}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  {(!section.collapsible || isGroupExpanded) && (
                    <div className="p-1.5 space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = isItemActive(item);
                        const Icon = item.icon;

                        if (item.disabled) {
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed"
                            >
                              <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                              <span className="text-sm text-slate-400 flex-1">
                                {item.label}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                                Soon
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigate(item.path)}
                            style={isActive ? brandGradientStyle : undefined}
                            className={[
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                              isActive
                                ? "text-white shadow-sm"
                                : "text-slate-600 hover:bg-[#3bb582]/10 hover:text-[#3bb582]",
                            ].join(" ")}
                          >
                            <Icon
                              className={[
                                "w-4 h-4 flex-shrink-0",
                                isActive ? "text-white" : "text-slate-400",
                              ].join(" ")}
                            />
                            <span
                              className={[
                                "text-sm flex-1 text-left",
                                isActive ? "font-semibold" : "",
                              ].join(" ")}
                            >
                              {item.label}
                            </span>
                            {item.badge > 0 && (
                              <span
                                className={[
                                  "min-w-[20px] h-5 text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                                  isActive
                                    ? "bg-white/30 text-white"
                                    : "bg-red-500 text-white",
                                ].join(" ")}
                              >
                                {item.badge > 9 ? "9+" : item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {/* ── Logout ── */}
        <div className="px-2 py-3 flex-shrink-0">
          <button
            type="button"
            onClick={onLogout}
            title={!isExpanded ? "Đăng Xuất" : undefined}
            className={[
              "flex items-center gap-3 py-2.5 rounded-xl w-full transition",
              "text-slate-500 hover:bg-red-50 hover:text-red-600",
              !isExpanded ? "justify-center px-0" : "px-3",
            ].join(" ")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {isExpanded && (
              <span className="text-sm font-medium">Đăng Xuất</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
