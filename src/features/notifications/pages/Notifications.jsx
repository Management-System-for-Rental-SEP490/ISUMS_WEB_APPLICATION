import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  AlertTriangle,
  Check,
  Search,
  RefreshCw,
  Loader2,
  BellOff,
  XCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import {
  TYPE_CONFIG,
  resolveNotifType,
} from "../constants/notification.constants";
import { NOTIFICATION_METADATA_LABEL_KEYS } from "../constants/notificationMetadataLabels";
import InspectionResultDrawer from "../../maintenance/components/InspectionResultDrawer";

const QUICK_FILTER_KEYS = [
  { key: "all",      labelKey: "notifications.filterAll"    },
  { key: "unread",   labelKey: "notifications.filterUnread" },
  { key: "critical", labelKey: "notifications.typeCritical" },
];

const SORT_OPTION_KEYS = [
  { key: "newest", labelKey: "notifications.sortNewest" },
  { key: "oldest", labelKey: "notifications.sortOldest" },
];

export default function Notifications() {
  const { t } = useTranslation("common");
  const [filterKey, setFilterKey] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);
  const [inspectionId, setInspectionId] = useState(null);

  function formatTime(dateStr) {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return t("notifications.justNow");
      if (diffMin < 60) return t("notifications.minutesAgo", { count: diffMin });
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return t("notifications.hoursAgo", { count: diffH });
      const diffD = Math.floor(diffH / 24);
      if (diffD < 7) return t("notifications.daysAgo", { count: diffD });
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  function resolveMetaLabel(metadata) {
    if (!metadata) return null;
    const parts = [];
    if (metadata.type === "CHECK_IN") parts.push(t("notifications.metaCheckIn"));
    else if (metadata.type === "CHECK_OUT") parts.push(t("notifications.metaCheckOut"));
    if (metadata.contractId)
      parts.push(`${t("notifications.metaContractShort")} #${String(metadata.contractId).slice(-6).toUpperCase()}`);
    return parts;
  }

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    refresh,
  } = useNotifications();

  const criticalCount = notifications.filter(
    (n) => resolveNotifType(n) === "critical",
  ).length;
  const warningCount = notifications.filter(
    (n) => resolveNotifType(n) === "warning",
  ).length;

  const filtered = notifications
    .filter((n) => {
      const text =
        `${n.title ?? ""} ${n.message ?? ""} ${n.content ?? ""}`.toLowerCase();
      const matchSearch =
        !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchFilter =
        filterKey === "all" ||
        (filterKey === "unread" && !n.read) ||
        resolveNotifType(n) === filterKey;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const ta = new Date(a.createdAt ?? a.time ?? 0).getTime();
      const tb = new Date(b.createdAt ?? b.time ?? 0).getTime();
      return sortKey === "newest" ? tb - ta : ta - tb;
    });

  const STATS = [
    {
      label: t("notifications.statTotal"),
      value: notifications.length,
      icon: <Bell className="w-5 h-5 text-teal-500" />,
      iconBg: "bg-teal-50",
    },
    {
      label: t("notifications.statUnread"),
      value: unreadCount,
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    {
      label: t("notifications.typeCritical"),
      value: criticalCount,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      iconBg: "bg-red-50",
      valueColor: criticalCount > 0 ? "text-red-600" : "text-gray-900",
    },
    {
      label: t("notifications.typeWarning"),
      value: warningCount,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
<h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>{t("notifications.pageTitle")}</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className="w-4 h-4" style={{ color: "#3bb582" }} />
            {t("actions.refresh")}
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Check className="w-4 h-4" />
            {t("notifications.markAllRead")}
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon, iconBg, valueColor }) => (
          <div
            key={label}
            className="rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider leading-none" style={{ color: "#5A7A6E" }}>
                {label}
              </p>
              <p className={`text-3xl font-heading font-bold leading-none ${valueColor ?? ""}`} style={!valueColor ? { color: "#1E2D28" } : {}}>
                {value}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── List Panel ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Search + Tabs + Sort */}
        <div style={{ borderBottom: "1px solid #C4DED5" }}>
          {/* Search row */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
              <input
                type="text"
                placeholder={t("notifications.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition"
                style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
                onFocus={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
                onBlur={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Tabs + Sort */}
          <div className="flex items-center justify-between px-5">
            <div className="flex">
              {QUICK_FILTER_KEYS.map(({ key, labelKey }) => {
                const isActive = filterKey === key;
                const count =
                  key === "all"
                    ? notifications.length
                    : key === "unread"
                      ? unreadCount
                      : notifications.filter((n) => resolveNotifType(n) === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterKey(key)}
                    className="relative flex items-center gap-1.5 pb-3 pt-1 pr-5 text-sm font-medium transition"
                    style={{ color: isActive ? "#3bb582" : "#5A7A6E" }}
                    onMouseEnter={e => !isActive && (e.currentTarget.style.color = "#1E2D28")}
                    onMouseLeave={e => !isActive && (e.currentTarget.style.color = "#5A7A6E")}
                  >
                    {t(labelKey)}
                    {count > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={isActive
                          ? { background: "rgba(59,181,130,0.12)", color: "#3bb582" }
                          : { background: "#EAF4F0", color: "#5A7A6E" }}
                      >
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-4 h-[2px] rounded-t" style={{ background: "#3bb582" }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 pb-3 pt-1">
              <span className="text-xs" style={{ color: "#5A7A6E" }}>{t("notifications.sortBy")}:</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="text-xs font-medium border-none bg-transparent outline-none cursor-pointer pr-1"
                style={{ color: "#1E2D28" }}
              >
                {SORT_OPTION_KEYS.map(({ key, labelKey }) => (
                  <option key={key} value={key}>{t(labelKey)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2.5" style={{ color: "#5A7A6E" }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#3bb582" }} />
            <span className="text-sm">{t("notifications.loading")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <BellOff className="w-7 h-7" style={{ color: "#C4DED5" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#5A7A6E" }}>
              {t("notifications.empty")}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((notif) => {
              const type = resolveNotifType(notif);
              const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
              const isUnread = !notif.read;
              const isExpanded = expandedId === notif.id;
              const metaTags = resolveMetaLabel(notif.metadata);
              const bodyText =
                notif.body ?? notif.message ?? notif.content ?? "";
              const metadata = notif.metadata ?? {};

              return (
                <div
                  key={notif.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(196,222,213,0.4)", background: isUnread ? "rgba(59,181,130,0.04)" : isExpanded ? "#F0FAF6" : "transparent" }}
                  onMouseEnter={e => !isExpanded && !isUnread && (e.currentTarget.style.background = "#F0FAF6")}
                  onMouseLeave={e => !isExpanded && !isUnread && (e.currentTarget.style.background = "transparent")}
                >
                  {/* Main row — clickable to expand */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(notif.id)}
                    className="w-full text-left flex items-start gap-4 px-5 py-4"
                  >
                    {/* Circle icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}
                    >
                      <span className={cfg.iconColor}>{cfg.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold leading-snug mb-0.5"
                            style={{ color: isUnread ? "#1E2D28" : "#5A7A6E" }}
                          >
                            {notif.title ?? notif.category ?? t("notifications.defaultTitle")}
                            {isUnread && (
                              <span
                                className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 mb-0.5 align-middle ${cfg.dot}`}
                              />
                            )}
                          </p>
                          {bodyText && !isExpanded && (
                            <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: "#5A7A6E" }}>
                              {bodyText}
                            </p>
                          )}
                          {/* Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${cfg.badge}`}
                            >
                              {t(cfg.labelKey)}
                            </span>
                            {metaTags?.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                style={{ background: "#EAF4F0", color: "#5A7A6E" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right: time + chevron + actions */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs whitespace-nowrap" style={{ color: "#5A7A6E" }}>
                            {formatTime(notif.createdAt ?? notif.time)}
                          </span>
                          <div className="flex items-center gap-1">
                            {isUnread && (
                              <span
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markRead(notif.id);
                                }}
                                title={t("notifications.markRead")}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition"
                              style={{ color: "#5A7A6E" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.10)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="w-7 h-7 rounded-full flex items-center justify-center transition" style={{ color: "#5A7A6E" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-4 ml-14 space-y-3">
                      {bodyText && (
                        <p className="text-sm leading-relaxed rounded-xl px-4 py-3" style={{ color: "#1E2D28", background: "#ffffff", border: "1px solid #C4DED5" }}>
                          {bodyText}
                        </p>
                      )}
                      {Object.keys(metadata).length > 0 && (
                        <div className="space-y-1.5">
                          {Object.entries(metadata).map(
                            ([k, v]) =>
                              v != null && (
                                <div key={k} className="flex items-center gap-2 text-xs">
                                  <span className="font-medium w-28 flex-shrink-0" style={{ color: "#5A7A6E" }}>
                                    {NOTIFICATION_METADATA_LABEL_KEYS[k] ? t(NOTIFICATION_METADATA_LABEL_KEYS[k]) : k}
                                  </span>
                                  <span className="font-mono truncate" style={{ color: "#1E2D28" }}>
                                    {String(v)}
                                  </span>
                                </div>
                              ),
                          )}
                        </div>
                      )}

                      {metadata.inspectionId && (
                        <button
                          type="button"
                          onClick={() => setInspectionId(metadata.inspectionId)}
                          className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
                          style={{ color: "#3bb582", background: "rgba(59,181,130,0.10)", border: "1px solid rgba(59,181,130,0.25)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,181,130,0.18)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,181,130,0.10)"}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          {t("notifications.viewInspection")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="py-4 flex justify-center" style={{ borderTop: "1px solid #C4DED5" }}>
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full transition disabled:opacity-50"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("notifications.loadingMore")}
                </>
              ) : (
                t("notifications.loadMore")
              )}
            </button>
          </div>
        )}
      </div>

      <InspectionResultDrawer
        inspectionId={inspectionId}
        onClose={() => setInspectionId(null)}
      />
    </div>
  );
}
