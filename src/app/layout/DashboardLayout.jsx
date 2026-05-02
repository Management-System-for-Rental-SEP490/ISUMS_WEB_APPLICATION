import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import Sidebar from "../../components/dashboard/Sidebar";
import {
  authActions,
  useAuthStore,
} from "../../features/auth/store/auth.store";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";
import { Search, Menu, MapPin, User, LogOut, ChevronDown } from "lucide-react";
import keycloak from "../../keycloak";

// path pattern → i18n key (no t() needed at module level)
const PATH_TITLE_KEYS = {
  "/dashboard":                    "pages.dashboard",
  "/houses":                       "pages.manageProperties",
  "/houses/:id":                   "pages.propertyDetail",
  "/utilities":                    "pages.utilities",
  "/users":                        "pages.tenants",
  "/staff":                        "pages.staff",
  "/contracts":                    "pages.contracts",
  "/contracts/pending":            "pages.pendingContracts",
  "/contracts/relocations":        "pages.relocationRequests",
  "/maintenance":                  "pages.workSchedule",
  "/maintenance/plans":            "pages.maintenancePlans",
  "/maintenance/jobs":             "pages.maintenanceJobs",
  "/maintenance/inspections":      "pages.handoverResults",
  "/maintenance/inspections/:id":  "pages.inspectionDetail",
  "/houses/:id/floors/:floorNo":   "pages.floorDetail",
  "/issues":                       "pages.issueRequests",
  "/issues/assignment":            "pages.issueAssignment",
  "/issues/quotes":                "pages.quoteApproval",
  "/issues/history":               "pages.issueHistory",
  "/issues/price-list":            "pages.priceList",
  "/reports":                      "pages.reports",
  "/notifications":                "pages.notifications",
  "/settings":                     "pages.settings",
  "/audit-logs":                   "pages.auditLogs",
  "/assets":                       "pages.assets",
};

const BREADCRUMB_PARENT_KEYS = {
  "/houses/:id": [
    { labelKey: "pages.manageProperties", path: "/houses" },
  ],
  "/houses/:id/floors/:floorNo": [
    { labelKey: "pages.manageProperties", path: "/houses" },
    { labelKey: "pages.propertyDetail",   path: "/houses/:id" },
  ],
  "/maintenance/inspections/:id": [
    { labelKey: "pages.handoverResults", path: "/maintenance/inspections" },
  ],
};

const ROLE_KEYS = { LANDLORD: "roles.LANDLORD", MANAGER: "roles.MANAGER" };

function resolvePathPattern(pathPattern, matchedPattern, pathname) {
  const patternParts = matchedPattern.split("/");
  const pathParts = pathname.split("/");
  const params = {};
  patternParts.forEach((part, i) => {
    if (part.startsWith(":")) params[part.slice(1)] = pathParts[i];
  });
  return pathPattern.replace(/:([^/]+)/g, (_, key) => params[key] ?? "");
}

export default function DashboardLayout() {
  const { t } = useTranslation("common");

  if (keycloak?.authenticated) keycloak.updateToken(30);

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const roles = useAuthStore((s) => s.roles ?? []);

  const roleLabel = (() => {
    for (const role of roles) if (ROLE_KEYS[role]) return t(ROLE_KEYS[role]);
    return roles[0] ?? t("roles.user");
  })();

  const isOnDashboard = location.pathname === "/dashboard";

  const matchedPattern = Object.keys(PATH_TITLE_KEYS).find(
    (pattern) =>
      pattern.includes(":") &&
      new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$").test(
        location.pathname,
      ),
  );

  const titleKey =
    PATH_TITLE_KEYS[location.pathname] ??
    (matchedPattern ? PATH_TITLE_KEYS[matchedPattern] : null) ??
    "pages.dashboard";

  const currentTitle = t(titleKey);

  const parentCrumbs = matchedPattern
    ? (BREADCRUMB_PARENT_KEYS[matchedPattern] ?? []).map((crumb) => ({
        label: t(crumb.labelKey),
        path: crumb.path.includes(":")
          ? resolvePathPattern(crumb.path, matchedPattern, location.pathname)
          : crumb.path,
      }))
    : [];

  const userMenuItems = [
    { key: "accountInfo", label: t("layout.accountInfo"), icon: User },
    { key: "settings",    label: t("sidebar.settings"),  icon: SettingOutlined },
  ];

  return (
    <div className="min-h-screen flex items-start bg-slate-100">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
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

      <div
        className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden"
        style={{ transition: "width 250ms ease-in-out" }}
      >
        {/* ── Topbar ── */}
        <header
          className="sticky top-0 z-30 flex-shrink-0 flex items-center px-4 md:px-6 gap-3"
          style={{
            height: 64,
            background: "#FFFFFF",
            borderBottom: "1px solid #C4DED5",
            boxShadow: "0 1px 4px 0 rgba(16,24,40,0.06)",
          }}
        >
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="p-2 rounded-lg flex-shrink-0 transition"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,181,130,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 min-w-0 justify-center">
            <div
              className="flex items-center px-3.5 py-2 transition-all duration-200 w-full"
              style={{ maxWidth: 480, background: "#F3F4F6", border: "1px solid transparent", borderRadius: 12 }}
              onFocusCapture={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "rgba(59,181,130,0.4)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.1)";
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Search className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder={t("layout.searchPlaceholder")}
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#1E2D28" }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
            <button
              type="button"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.background = "transparent"; }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#3bb582" }} />
              <MapPin className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
              TP. HCM
            </button>

            <div className="hidden lg:block h-5 w-px" style={{ background: "#C4DED5" }} />

            <NotificationDropdown />

            <button
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold shadow-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)", borderRadius: 10, transition: "opacity 0.2s ease, transform 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t("layout.addNew")}
            </button>

            <div className="h-5 w-px" style={{ background: "#C4DED5" }} />

            {/* User dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
                >
                  A
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-tight" style={{ color: "#1E2D28" }}>
                    {keycloak?.tokenParsed?.name || "Admin"}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ color: "#5A7A6E" }}>
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
                    style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 10px 40px -10px rgba(32,150,216,0.18)" }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #C4DED5" }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
                        >
                          A
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
                            {keycloak?.tokenParsed?.name || "Admin User"}
                          </p>
                          <p className="text-xs" style={{ color: "#5A7A6E" }}>
                            {keycloak?.tokenParsed?.email || "admin@smartutil.vn"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {userMenuItems.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate("/settings"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                          style={{ color: "#1E2D28" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {Icon && <Icon className="w-4 h-4" style={{ color: "#5A7A6E" }} />}
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1" style={{ borderTop: "1px solid #C4DED5" }}>
                      <button
                        type="button"
                        onClick={() => { setIsUserMenuOpen(false); authActions.logout(); navigate("/login"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: "#D95F4B" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(217,95,75,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("layout.logout")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 px-4 pt-4 pb-12 md:px-6 lg:px-8 bg-slate-100">
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
                      {t("layout.home")}
                    </span>
                  ),
                },
                ...(!isOnDashboard
                  ? [
                      ...parentCrumbs.map((crumb) => ({
                        title: (
                          <span
                            className="cursor-pointer transition"
                            style={{ color: "#5A7A6E" }}
                            onClick={() => navigate(crumb.path)}
                          >
                            {crumb.label}
                          </span>
                        ),
                      })),
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
