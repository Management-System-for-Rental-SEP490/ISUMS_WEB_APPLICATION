import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell, CheckCircle, AlertTriangle, Info, XCircle,
  Check, Loader2, ArrowRight,
} from "lucide-react";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { getManagerNotifications, markAllNotificationsRead } from "../api/notifications.api";

// Map category từ API sang loại hiển thị
const CATEGORY_TYPE = {
  CONTRACT_EXPIRED: "warning",
  INSPECTION_DONE: "success",
  PAYMENT_DUE: "critical",
  PAYMENT_RECEIVED: "success",
};

const TYPE_ICON = {
  critical: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
};

const TYPE_DOT = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  success: "bg-green-500",
};

const TYPE_TEXT_COLOR = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
  success: "text-green-500",
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    return `${Math.floor(diffH / 24)} ngày trước`;
  } catch {
    return dateStr;
  }
}

/**
 * Bell icon + dropdown thông báo kiểu Facebook.
 * @param {{ onNavigate: (menu: string) => void }} props
 */
export default function NotificationDropdown({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const dropdownRef = useRef(null);
  const { unreadCount, resetCount } = useUnreadCount();

  // ── Fetch preview khi mở dropdown ─────────────────────────────────────────

  const fetchPreviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getManagerNotifications(0, 8);
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.content)
              ? res.data.content
              : [];
      setPreviews(items);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchPreviews();
  }, [isOpen, fetchPreviews]);

  // ── Đóng khi click ngoài ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleViewAll = () => {
    setIsOpen(false);
    onNavigate("notifications");
  };

  const handleItemClick = () => {
    setIsOpen(false);
    onNavigate("notifications");
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setPreviews((prev) => prev.map((n) => ({ ...n, read: true })));
      resetCount();
    } catch {
      // silent
    } finally {
      setIsMarkingAll(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Thông báo"
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

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount} chưa đọc
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
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            ) : previews.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Không có thông báo nào</p>
              </div>
            ) : (
              previews.map((notif) => {
                const category = notif.category ?? notif.type ?? "";
                const type = CATEGORY_TYPE[category] ?? category?.toLowerCase() ?? "info";
                const resolvedType = TYPE_ICON[type] ? type : "info";
                const isUnread = !notif.read;
                const metadata = notif.metadata ?? {};

                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={handleItemClick}
                    className={`w-full text-left px-5 py-3.5 hover:bg-gray-50 transition flex items-start gap-3 ${
                      isUnread ? "bg-blue-50/60" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="mt-0.5">
                      {TYPE_ICON[resolvedType] ?? <Bell className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug mb-0.5 ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {notif.title ?? category ?? "Thông báo"}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {notif.message ?? notif.content ?? ""}
                      </p>
                      {metadata.type && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {metadata.type === "CHECK_IN" ? "Bàn giao nhà" : metadata.type === "CHECK_OUT" ? "Kết thúc hợp đồng" : metadata.type}
                        </p>
                      )}
                      <p className={`text-[11px] mt-1 font-medium ${TYPE_TEXT_COLOR[resolvedType] ?? "text-gray-400"}`}>
                        {formatTime(notif.createdAt ?? notif.time)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${TYPE_DOT[resolvedType] ?? "bg-blue-500"}`} />
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
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition py-1"
            >
              Xem tất cả thông báo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
