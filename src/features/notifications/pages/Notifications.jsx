import React, { useState } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Info, XCircle,
  Filter, Check, Search, RefreshCw, Wifi, WifiOff, Loader2,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const TYPE_ICON = {
  critical: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
};

const TYPE_BADGE = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
};

const TYPE_LABEL = {
  critical: 'Khẩn cấp',
  warning: 'Cảnh báo',
  info: 'Thông tin',
  success: 'Thành công',
};

function SseStatusBadge({ status }) {
  if (status === 'open') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <Wifi className="w-3.5 h-3.5" /> Realtime
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang kết nối...
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
      <WifiOff className="w-3.5 h-3.5" /> Mất kết nối
    </span>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
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

export default function Notifications() {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    sseStatus,
    loadMore,
    markRead,
    markAllRead,
    refresh,
  } = useNotifications();

  const filtered = notifications.filter((n) => {
    const text = `${n.title ?? ''} ${n.message ?? ''} ${n.content ?? ''} ${n.property ?? ''}`.toLowerCase();
    const matchSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
    const notifType = n.type?.toLowerCase();
    const matchFilter = filterType === 'all' || notifType === filterType;
    return matchSearch && matchFilter;
  });

  const criticalCount = notifications.filter((n) => n.type?.toLowerCase() === 'critical').length;
  const warningCount = notifications.filter((n) => n.type?.toLowerCase() === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Thông Báo</h2>
          <div className="flex items-center gap-3">
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
            </p>
            <SseStatusBadge status={sseStatus} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng thông báo</span>
            <Bell className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chưa đọc</span>
            <Bell className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Khẩn cấp</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cảnh báo</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{warningCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="critical">Khẩn cấp</option>
              <option value="warning">Cảnh báo</option>
              <option value="info">Thông tin</option>
              <option value="success">Thành công</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Danh Sách Thông Báo ({filtered.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Đang tải thông báo...</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((notif) => {
              const type = notif.type?.toLowerCase() ?? 'info';
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`p-6 hover:bg-gray-50 transition ${isUnread ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {TYPE_ICON[type] ?? <Bell className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title ?? notif.type ?? 'Thông báo'}
                            </h4>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            {type && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${TYPE_BADGE[type] ?? TYPE_BADGE.info}`}>
                                {TYPE_LABEL[type] ?? type}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notif.message ?? notif.content ?? ''}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {notif.property && <span>{notif.property}</span>}
                            {notif.property && <span>•</span>}
                            <span>{formatTime(notif.createdAt ?? notif.time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => markRead(notif.id)}
                              className="p-2 hover:bg-gray-200 rounded"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có thông báo nào</p>
              </div>
            )}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 text-sm text-teal-600 border border-teal-300 rounded-lg hover:bg-teal-50 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                </>
              ) : (
                'Tải thêm'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
