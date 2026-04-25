import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";
import {
  AlertCircle, BarChart2, Bell, Building2, CalendarDays,
  ChevronDown, ClipboardList,
  FileText, Home, LogOut, CheckCircle, MailQuestionIcon,
  PenLine, Tag, Settings, UserCheck, Users, UserCog,
  Wrench, Zap, LayoutDashboard, ShieldCheck,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

export default function Sidebar({ isOpen, onLogout, unreadCount = 0 }) {
  const { t } = useTranslation("common");
  const roles = useAuthStore((s) => s.roles ?? []);
  const canSeePendingSign = roles.includes("ADMIN") || roles.includes("LANDLORD");

  const navigate  = useNavigate();
  const location  = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  const [isHovering, setIsHovering] = useState(false);

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const isExpanded = isOpen || isHovering;

  // Auto-close all groups when sidebar collapses (not just hover)
  useEffect(() => {
    if (!isOpen && !isHovering) setOpenGroups({});
  }, [isOpen, isHovering]);

  const sections = [
    {
      id: "tong-quan", label: t("sidebar.overview"), icon: LayoutDashboard, collapsible: false,
      items: [
        { id: "dashboard",   label: t("sidebar.dashboard"), icon: Home,         path: "/dashboard" },
        { id: "utilities",   label: t("sidebar.utilities"), icon: Zap,          path: "/utilities" },
        { id: "maintenance", label: t("sidebar.schedule"),  icon: CalendarDays, path: "/maintenance" },
      ],
    },
    {
      id: "bat-dong-san-group", label: t("sidebar.realEstate"), icon: Building2, collapsible: true,
      items: [
        { id: "houses", label: t("sidebar.manageHouses"), icon: Building2, path: "/houses" },
        { id: "assets", label: t("sidebar.devices"),       icon: Wrench,    path: "/assets" },
      ],
    },
    {
      id: "nguoi-dung-group", label: t("sidebar.users"), icon: Users, collapsible: true,
      items: [
        { id: "users", label: t("sidebar.tenants"), icon: Users,   path: "/users" },
        { id: "staff", label: t("sidebar.staff"),   icon: UserCog, path: "/staff" },
      ],
    },
    {
      id: "hop-dong-group", label: t("sidebar.contracts"), icon: FileText, collapsible: true,
      items: [
        { id: "contracts",               label: t("sidebar.manageContracts"),   icon: FileText,      path: "/contracts" },
        ...(canSeePendingSign ? [{
          id: "contracts-sign",          label: t("sidebar.pendingContracts"),  icon: PenLine,       path: "/contracts/pending",
        }] : []),
        { id: "maintenance-inspections", label: t("sidebar.checkinCheckout"),   icon: ClipboardList, path: "/maintenance/inspections" },
      ],
    },
    {
      id: "bao-tri-group", label: t("sidebar.maintenance"), icon: ClipboardList, collapsible: true,
      items: [
        { id: "maintenance-plans", label: t("sidebar.maintenancePlans"), icon: ClipboardList, path: "/maintenance/plans" },
        { id: "maintenance-jobs",  label: t("sidebar.maintenanceJobs"),  icon: ClipboardList, path: "/maintenance/jobs" },
      ],
    },
    {
      id: "sua-chua-group", label: t("sidebar.repair"), icon: AlertCircle, collapsible: true,
      items: [
        { id: "issue-requests",       label: t("sidebar.issuesList"),        icon: MailQuestionIcon, path: "/issues" },
        { id: "issue-assignment",     label: t("sidebar.assignment"),         icon: UserCheck,        path: "/issues/assignment" },
        { id: "issue-quote-approval", label: t("sidebar.quoteApproval"),      icon: CheckCircle,      path: "/issues/quotes" },
        { id: "issue-history",        label: t("sidebar.historyByProperty"),  icon: BarChart2,        path: "/issues/history" },
        { id: "issue-price-list",     label: t("sidebar.priceList"),          icon: Tag,              path: "/issues/price-list" },
      ],
    },
    {
      id: "he-thong", label: t("sidebar.system"), icon: Settings, collapsible: false,
      items: [
        { id: "notifications", label: t("sidebar.notifications"), icon: Bell,        path: "/notifications", badge: unreadCount },
        { id: "audit-logs",    label: t("sidebar.auditLogs"),     icon: ShieldCheck, path: "/audit-logs" },
        { id: "settings",      label: t("sidebar.settings"),      icon: Settings,    path: "/settings" },
      ],
    },
  ];

  const isItemActive   = (item)    => location.pathname === item.path;
  const hasActiveChild = (section) => section.items?.some((i) => i.path && location.pathname === i.path);

  const brandGradientStyle = { background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" };

  return (
    <aside
      className={[
        "bg-slate-100 border-r border-slate-200 text-slate-800 fixed left-0 inset-y-0 z-40",
        "lg:sticky lg:top-0 lg:h-screen",
        // Only animate transform (mobile) and width (desktop) — NOT transition-all
        "transition-[width,transform] duration-250 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isExpanded ? "lg:w-[260px]" : "lg:w-[72px]",
      ].join(" ")}
      style={{ willChange: "width, transform" }}
      aria-label="Sidebar"
      onMouseEnter={() => { if (!isOpen) setIsHovering(true); }}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Logo ── */}
        {/*
         * Clicking the brand lock-up takes the user home (`/dashboard`).
         * This matches the near-universal web convention — the top-left
         * logo is the "escape hatch" from any deep page. Using a
         * <button> (not <a>) keeps the SPA router in charge; React
         * Router's useNavigate() avoids a full page reload.
         * Accessible name comes from aria-label; the <img> alt is still
         * descriptive for screen readers that read both.
         */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label={t("sidebar.dashboard")}
            className="w-full flex items-center gap-3 px-4 transition-colors duration-150 hover:bg-[#3bb582]/5"
            style={{ height: 64, minHeight: 64 }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow ring-2 ring-[#3bb582]/40">
              <img src={logo} alt="ISUMS Logo" className="w-full h-full object-cover" />
            </div>
            {/* Text fades — no mount/unmount */}
            <h1
              className="font-bold tracking-wide truncate transition-opacity duration-200"
              style={{
                fontSize: 16,
                lineHeight: 1,
                background: "linear-gradient(135deg, #3bb582, #2096d8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                opacity: isExpanded ? 1 : 0,
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              ISUMS
            </h1>
          </button>
          <div
            className="mx-4"
            style={{
              height: 1,
              background: "linear-gradient(90deg, rgba(59,181,130,0.25), rgba(59,181,130,0.04))",
            }}
          />
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 overflow-x-hidden">

          {/* ── COLLAPSED view (icons only) — always in DOM, opacity toggled ── */}
          <div
            className="flex flex-col items-center gap-1 transition-opacity duration-200"
            style={{
              opacity: isExpanded ? 0 : 1,
              pointerEvents: isExpanded ? "none" : "auto",
              position: isExpanded ? "absolute" : "relative",
            }}
          >
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isActive    = hasActiveChild(section);
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    const first = section.items.find((i) => !i.disabled && i.path);
                    if (first) navigate(first.path);
                  }}
                  title={section.label}
                  style={isActive ? brandGradientStyle : undefined}
                  className={[
                    "relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-150",
                    isActive ? "text-white shadow-sm" : "text-slate-400 hover:bg-white hover:shadow-sm",
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

          {/* ── EXPANDED view (full cards) — always in DOM, opacity toggled ── */}
          {/* overflow:hidden + height:0 removes from layout flow when collapsed so nav doesn't get extra scroll height */}
          <div style={{ overflow: "hidden", height: isExpanded ? "auto" : 0 }}>
          <div
            className="space-y-2 transition-opacity duration-200"
            style={{
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          >
            {sections.map((section) => {
              const isGroupExpanded  = !!openGroups[section.id];
              const sectionHasActive = hasActiveChild(section);

              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                  style={{ boxShadow: "0px 1px 2px 0px rgba(16,24,40,0.05)" }}
                >
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
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={sectionHasActive ? { color: "#3bb582" } : { color: "#94a3b8" }}
                      >
                        {section.label}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupExpanded ? "rotate-180" : ""}`}
                        style={sectionHasActive ? { color: "#3bb582" } : { color: "#cbd5e1" }}
                      />
                    </button>
                  ) : (
                    <div className="px-4 py-3 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {section.label}
                      </span>
                    </div>
                  )}

                  {(!section.collapsible || isGroupExpanded) && (
                    <div className="p-1.5 space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = isItemActive(item);
                        const Icon     = item.icon;

                        if (item.disabled) {
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl opacity-40 cursor-not-allowed"
                            >
                              <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                              <span className="text-sm text-slate-400 flex-1">{item.label}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                                {t("sidebar.soon")}
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
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150",
                              isActive
                                ? "text-white shadow-sm"
                                : "text-slate-600 hover:bg-[#3bb582]/10 hover:text-[#3bb582]",
                            ].join(" ")}
                          >
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                            />
                            <span className={`text-sm flex-1 text-left ${isActive ? "font-semibold" : ""}`}>
                              {item.label}
                            </span>
                            {item.badge > 0 && (
                              <span
                                className={[
                                  "min-w-[20px] h-5 text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                                  isActive ? "bg-white/30 text-white" : "bg-red-500 text-white",
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
          </div>
          </div>
        </nav>

        {/* ── Logout — always at bottom ── */}
        <div className="px-2 py-3 flex-shrink-0">
          {/* Collapsed: icon centered exactly like section icons */}
          {!isExpanded && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onLogout}
                title={t("sidebar.logout")}
                className="flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-150 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}
          {/* Expanded: full label button */}
          {isExpanded && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors duration-150 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-sm font-medium">{t("sidebar.logout")}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
