import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Check,
  Loader2,
  ArrowRight,
  FileSignature,
} from "lucide-react";

import MultiLangText from "../../../components/shared/i18n/MultiLangText";
import { useUnreadCount } from "../hooks/useUnreadCount";

// Pick the right value to feed into MultiLangText: prefer the translation
// map (so the auto-badge + locale picking kicks in); fall back to the legacy
// flat string when the backend hasn't migrated yet.
const titleValue = (n) => n?.titleTranslations || n?.title;
const bodyValue  = (n) => n?.bodyTranslations  || n?.body || n?.message || n?.content;
import {
  getManagerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications.api";

const CATEGORY_TYPE = {
  CONTRACT_EXPIRED: "warning",
  INSPECTION_DONE: "success",
  PAYMENT_DUE: "critical",
  PAYMENT_RECEIVED: "success",
  CONTRACT_READY_FOR_LANDLORD_SIGNATURE: "contract",
};

const TYPE_ICON = {
  critical: <XCircle className="w-4 h-4 text-red-500   flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500  flex-shrink-0" />,
  success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
  contract: <FileSignature className="w-4 h-4 text-teal-500  flex-shrink-0" />,
};

const TYPE_DOT = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  success: "bg-green-500",
  contract: "bg-teal-500",
};

const TYPE_ICON_BG = {
  critical: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
  success: "bg-emerald-50",
  contract: "bg-teal-50",
};

const TYPE_ACCENT = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#10b981",
  contract: "#3bb582",
};

const TYPE_TEXT_COLOR = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
  success: "text-green-500",
  contract: "text-teal-600",
};


function resolveType(category) {
  const mapped = CATEGORY_TYPE[category] ?? category?.toLowerCase() ?? "info";
  return TYPE_ICON[mapped] ? mapped : "info";
}

export default function NotificationDropdown() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

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
      return t("notifications.daysAgo", { count: Math.floor(diffH / 24) });
    } catch {
      return dateStr;
    }
  }
  const [isOpen, setIsOpen] = useState(false);
  const [fetched, setFetched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const prevLiveCountRef = useRef(0);

  const { unreadCount, decrementCount, resetCount, liveNotifs, connStatus } =
    useUnreadCount();

  // ── Merge liveNotifs + fetched, dedupe by id, newest first ───────────────
  const previews = useMemo(() => {
    const fetchedIds = new Set(fetched.map((n) => n.id));
    const freshLive = liveNotifs.filter((n) => !fetchedIds.has(n.id));
    return [...freshLive, ...fetched].slice(0, 8);
  }, [fetched, liveNotifs]);

  // ── Toast on incoming SSE notification ───────────────────────────────────
  useEffect(() => {
    if (liveNotifs.length <= prevLiveCountRef.current) {
      prevLiveCountRef.current = liveNotifs.length;
      return;
    }
    const notif = liveNotifs[0];
    prevLiveCountRef.current = liveNotifs.length;

    const type = resolveType(notif.category ?? "");
    const accent = TYPE_ACCENT[type] ?? "#3bb582";
    toast(
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer flex items-start gap-3"
        onClick={() => navigate(notif.actionUrl ?? "/notifications")}
        onKeyDown={(e) =>
          e.key === "Enter" && navigate(notif.actionUrl ?? "/notifications")
        }
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_ICON_BG[type] ?? "bg-teal-50"}`}
        >
          {TYPE_ICON[type] ?? <Bell className="w-4 h-4 text-teal-600" />}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
            <MultiLangText value={titleValue(notif)} fallback={t("notifications.newNotification")} />
          </p>
          {bodyValue(notif) && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              <MultiLangText value={bodyValue(notif)} />
            </p>
          )}
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] font-medium" style={{ color: accent }}>
              {t("notifications.justNow")}
            </p>
            <span
              className="text-[11px] font-semibold flex items-center gap-0.5"
              style={{ color: accent }}
            >
              {t("notifications.viewDetail")} →
            </span>
          </div>
        </div>
      </div>,
      {
        icon: false,
        autoClose: 6000,
        className:
          "!rounded-2xl !shadow-lg !border !border-gray-100 !bg-white !p-4",
        progressStyle: {
          background: "linear-gradient(90deg, #3bb582 0%, #2096d8 100%)",
          height: 3,
        },
      },
    );
  }, [liveNotifs, navigate]);

  // ── Fetch list when dropdown opens ───────────────────────────────────────
  const fetchPreviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getManagerNotifications(0, 8);
      const items = Array.isArray(res?.data?.content)
        ? res.data.content
        : Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
      setFetched(items);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchPreviews();
  }, [isOpen, fetchPreviews]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleItemClick = useCallback(
    (notif) => {
      setIsOpen(false);
      if (!notif.read) {
        markNotificationRead(notif.id).catch(() => {});
        decrementCount();
        setFetched((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
        );
      }
      navigate(notif.actionUrl ?? "/notifications");
    },
    [navigate, decrementCount],
  );

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setFetched((prev) => prev.map((n) => ({ ...n, read: true })));
      resetCount();
    } catch {
      // silent
    } finally {
      setIsMarkingAll(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label={t("notifications.pageTitle")}
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Subtle reconnecting indicator */}
        {connStatus === "reconnecting" && (
          <span
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-amber-400 border border-white"
            title={t("notifications.reconnecting")}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ zIndex: 1001 }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">{t("notifications.pageTitle")}</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("notifications.unreadCount", { count: unreadCount })}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:text-teal-700 disabled:opacity-50 transition"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t("notifications.loading")}</span>
              </div>
            ) : previews.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">{t("notifications.empty")}</p>
              </div>
            ) : (
              previews.map((notif) => {
                const category = notif.category ?? notif.type ?? "";
                const type = resolveType(category);
                const isUnread = !notif.read;
                const titleVal = titleValue(notif);
                const bodyVal = bodyValue(notif);

                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleItemClick(notif)}
                    className={`w-full text-left border-b border-gray-50 last:border-0 px-5 py-3.5 flex items-start gap-3 transition-colors ${isUnread ? "bg-blue-50/50" : ""} hover:bg-gray-50/70`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {TYPE_ICON[type] ?? (
                        <Bell className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug mb-0.5 ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        <MultiLangText value={titleVal} fallback={category || t("notifications.defaultTitle")} />
                      </p>
                      {bodyVal && (
                        <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                          <MultiLangText value={bodyVal} />
                        </p>
                      )}
                      <p
                        className={`text-[11px] mt-1 font-medium ${TYPE_TEXT_COLOR[type] ?? "text-gray-400"}`}
                      >
                        {formatTime(notif.createdAt ?? notif.time)}
                      </p>
                    </div>
                    {isUnread && (
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${TYPE_DOT[type] ?? "bg-blue-500"}`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition py-1"
            >
              {t("notifications.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

