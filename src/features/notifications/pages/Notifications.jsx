import { useState } from 'react';
import {
  Bell, AlertTriangle, Check, Search, RefreshCw,
  Loader2, BellOff, XCircle, MoreVertical, Mail,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { TYPE_CONFIG, resolveNotifType } from '../constants/notification.constants';

function formatTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

function resolveMetaLabel(metadata) {
  if (!metadata) return null;
  const parts = [];
  if (metadata.type === 'CHECK_IN') parts.push('Bàn giao nhà');
  else if (metadata.type === 'CHECK_OUT') parts.push('Kết thúc HĐ');
  if (metadata.contractId) parts.push(`HĐ #${String(metadata.contractId).slice(-6).toUpperCase()}`);
  return parts;
}

const QUICK_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'critical', label: 'Khẩn cấp' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'oldest', label: 'Cũ nhất' },
];

export default function Notifications() {
  const [filterKey, setFilterKey] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('newest');

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

  const criticalCount = notifications.filter((n) => resolveNotifType(n) === 'critical').length;
  const warningCount = notifications.filter((n) => resolveNotifType(n) === 'warning').length;

  const filtered = notifications
    .filter((n) => {
      const text = `${n.title ?? ''} ${n.message ?? ''} ${n.content ?? ''}`.toLowerCase();
      const matchSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchFilter =
        filterKey === 'all' ||
        (filterKey === 'unread' && !n.read) ||
        resolveNotifType(n) === filterKey;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const ta = new Date(a.createdAt ?? a.time ?? 0).getTime();
      const tb = new Date(b.createdAt ?? b.time ?? 0).getTime();
      return sortKey === 'newest' ? tb - ta : ta - tb;
    });

  const STATS = [
    {
      label: 'Tổng thông báo',
      value: notifications.length,
      icon: <Bell className="w-5 h-5 text-teal-500" />,
      iconBg: 'bg-teal-50',
    },
    {
      label: 'Chưa đọc',
      value: unreadCount,
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Khẩn cấp',
      value: criticalCount,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-50',
      valueColor: criticalCount > 0 ? 'text-red-600' : 'text-gray-900',
    },
    {
      label: 'Cảnh báo',
      value: warningCount,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý các cập nhật quan trọng từ hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon, iconBg, valueColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 px-5 pt-4 pb-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-600 leading-none">{label}</p>
              <p className={`text-3xl font-bold leading-none ${valueColor ?? 'text-gray-900'}`}>{value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── List Panel ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search + Tabs + Sort */}
        <div className="border-b border-gray-100">
          {/* Search row */}
          <div className="px-5 pt-4 pb-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition placeholder-gray-400"
              />
            </div>
          </div>

          {/* Tabs + Sort */}
          <div className="flex items-center justify-between px-5">
            <div className="flex">
              {QUICK_FILTERS.map(({ key, label }) => {
                const isActive = filterKey === key;
                const count =
                  key === 'all'
                    ? notifications.length
                    : key === 'unread'
                    ? unreadCount
                    : notifications.filter((n) => resolveNotifType(n) === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterKey(key)}
                    className={`relative flex items-center gap-1.5 pb-3 pt-1 pr-5 text-sm font-medium transition ${
                      isActive ? 'text-teal-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                          isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-4 h-[2px] bg-teal-600 rounded-t" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 pb-3 pt-1">
              <span className="text-xs text-gray-400">Sắp xếp theo:</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="text-xs font-medium text-gray-700 border-none bg-transparent outline-none cursor-pointer pr-1"
              >
                {SORT_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2.5 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-sm">Đang tải thông báo...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BellOff className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((notif) => {
              const type = resolveNotifType(notif);
              const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
              const isUnread = !notif.read;
              const metaTags = resolveMetaLabel(notif.metadata);

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition ${
                    isUnread ? 'bg-gray-50/40' : ''
                  }`}
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
                          className={`text-sm font-semibold leading-snug mb-0.5 ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notif.title ?? notif.category ?? 'Thông báo'}
                          {isUnread && (
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 mb-0.5 align-middle ${cfg.dot}`} />
                          )}
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-2">
                          {notif.message ?? notif.content ?? ''}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          {metaTags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide bg-gray-100 text-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: time + actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(notif.createdAt ?? notif.time)}
                        </span>
                        <div className="flex items-center gap-1">
                          {isUnread && (
                            <button
                              onClick={() => markRead(notif.id)}
                              title="Đánh dấu đã đọc"
                              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="Tùy chọn"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="py-4 border-t border-gray-100 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {isLoadingMore ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</>
              ) : (
                'Xem thêm thông báo cũ hơn'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
