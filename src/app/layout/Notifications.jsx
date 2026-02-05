import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, Filter, Check, Trash2, Search } from 'lucide-react';

export default function Notifications() {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'critical',
      title: 'Phát hiện điện năng bất thường',
      message: 'Vinhomes Central Park - Đơn vị A101 đang tiêu thụ điện vượt mức cho phép 15%',
      time: '2 phút trước',
      property: 'Vinhomes Central Park',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Phát hiện rò rỉ nước',
      message: 'Masteri Thảo Điền - Đơn vị B205 có dấu hiệu rò rỉ nước',
      time: '15 phút trước',
      property: 'Masteri Thảo Điền',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Hợp đồng sắp hết hạn',
      message: 'Hợp đồng HD-2024-045 của khách thuê Hoàng Văn E sẽ hết hạn trong 15 ngày',
      time: '1 giờ trước',
      property: 'Vinhomes Central Park',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Thanh toán thành công',
      message: 'Khách thuê Trần Thị B đã thanh toán tiền thuê tháng 6 thành công',
      time: '2 giờ trước',
      property: 'Masteri Thảo Điền',
      read: true,
    },
    {
      id: 5,
      type: 'warning',
      title: 'Tiêu thụ gas cao',
      message: 'Saigon Pearl - Đơn vị C301 đang tiêu thụ gas cao hơn bình thường',
      time: '3 giờ trước',
      property: 'Saigon Pearl',
      read: false,
    },
    {
      id: 6,
      type: 'info',
      title: 'Bảo trì định kỳ',
      message: 'Đã đến lịch bảo trì hệ thống điện cho Landmark 81',
      time: '5 giờ trước',
      property: 'Landmark 81',
      read: true,
    },
    {
      id: 7,
      type: 'critical',
      title: 'Sắp chạm giới hạn công suất',
      message: 'Landmark 81 đang sử dụng 92% công suất điện cho phép',
      time: '1 ngày trước',
      property: 'Landmark 81',
      read: false,
    },
    {
      id: 8,
      type: 'success',
      title: 'Khách thuê mới',
      message: 'Đã ký hợp đồng mới với khách thuê Võ Thị F tại Masteri Thảo Điền',
      time: '2 ngày trước',
      property: 'Masteri Thảo Điền',
      read: true,
    },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
      success: 'bg-green-100 text-green-700 border-green-200',
    };
    return styles[type] || styles.info;
  };

  const getTypeLabel = (type) => {
    const labels = {
      critical: 'Khẩn cấp',
      warning: 'Cảnh báo',
      info: 'Thông tin',
      success: 'Thành công',
    };
    return labels[type] || type;
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notif.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Thông Báo</h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition">
            <Check className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition">
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
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
          <p className="text-2xl font-bold text-gray-900">
            {notifications.filter(n => n.type === 'critical').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cảnh báo</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {notifications.filter(n => n.type === 'warning').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
          <h3 className="text-lg font-semibold">Danh Sách Thông Báo ({filteredNotifications.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 hover:bg-gray-50 transition ${
                !notif.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeBadge(notif.type)}`}>
                          {getTypeLabel(notif.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{notif.property}</span>
                        <span>•</span>
                        <span>{notif.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <button className="p-2 hover:bg-gray-200 rounded" title="Đánh dấu đã đọc">
                          <Check className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-200 rounded" title="Xóa">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
