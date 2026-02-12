import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Building2, Filter, BarChart3, PieChart, LineChart } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'revenue', label: 'Doanh Thu', icon: DollarSign, color: 'green' },
    { id: 'utilities', label: 'Tiện Ích', icon: BarChart3, color: 'blue' },
    { id: 'occupancy', label: 'Tỷ Lệ Lấp Đầy', icon: PieChart, color: 'teal' },
    { id: 'maintenance', label: 'Bảo Trì', icon: TrendingUp, color: 'amber' },
  ];

  const revenueData = [
    { month: 'Tháng 1', revenue: 450000000, properties: 18, occupancy: 94 },
    { month: 'Tháng 2', revenue: 480000000, properties: 18, occupancy: 95 },
    { month: 'Tháng 3', revenue: 465000000, properties: 18, occupancy: 93 },
    { month: 'Tháng 4', revenue: 490000000, properties: 18, occupancy: 96 },
    { month: 'Tháng 5', revenue: 510000000, properties: 18, occupancy: 97 },
    { month: 'Tháng 6', revenue: 495000000, properties: 18, occupancy: 95 },
  ];

  const utilityData = [
    { type: 'Điện', total: 125000, average: 6944, trend: '+5%', color: 'amber' },
    { type: 'Nước', total: 68000, average: 3778, trend: '+2%', color: 'blue' },
    { type: 'Gas', total: 14500, average: 806, trend: '+8%', color: 'red' },
  ];

  const occupancyData = [
    { property: 'Vinhomes Central Park', occupancy: 94, total: 32, occupied: 30 },
    { property: 'Masteri Thảo Điền', occupancy: 100, total: 24, occupied: 24 },
    { property: 'Saigon Pearl', occupancy: 89, total: 28, occupied: 25 },
    { property: 'Landmark 81', occupancy: 88, total: 48, occupied: 42 },
  ];

  const getReportContent = () => {
    switch (reportType) {
      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Báo Cáo Doanh Thu</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tháng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh Thu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số BĐS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tỷ Lệ Lấp Đầy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₫{(item.revenue / 1000000).toFixed(0)}M</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.properties}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.occupancy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tổng doanh thu</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₫{(revenueData.reduce((sum, item) => sum + item.revenue, 0) / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">6 tháng gần nhất</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Trung bình/tháng</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₫{(revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">6 tháng gần nhất</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tăng trưởng</span>
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">+8.2%</p>
                <p className="text-xs text-gray-500 mt-1">So với kỳ trước</p>
              </div>
            </div>
          </div>
        );
      case 'utilities':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Báo Cáo Tiêu Thụ Tiện Ích</h3>
              <div className="space-y-4">
                {utilityData.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{item.type}</h4>
                      <span className={`text-sm font-medium ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng tiêu thụ</p>
                        <p className="text-xl font-bold text-gray-900">{item.total.toLocaleString()} {item.type === 'Điện' ? 'kWh' : item.type === 'Nước' ? 'm³' : 'kg'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Trung bình/BĐS</p>
                        <p className="text-xl font-bold text-gray-900">{item.average.toLocaleString()} {item.type === 'Điện' ? 'kWh' : item.type === 'Nước' ? 'm³' : 'kg'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'occupancy':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Báo Cáo Tỷ Lệ Lấp Đầy</h3>
              <div className="space-y-4">
                {occupancyData.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <h4 className="font-semibold text-gray-900">{item.property}</h4>
                      </div>
                      <span className={`text-lg font-bold ${
                        item.occupancy >= 95 ? 'text-green-600' : 
                        item.occupancy >= 85 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {item.occupancy}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.occupied}/{item.total} đơn vị</span>
                        <span className="text-gray-600">{item.total - item.occupied} trống</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.occupancy >= 95 ? 'bg-green-500' : 
                            item.occupancy >= 85 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tổng Quan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tỷ lệ trung bình</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(occupancyData.reduce((sum, item) => sum + item.occupancy, 0) / occupancyData.length).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng đơn vị</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {occupancyData.reduce((sum, item) => sum + item.total, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đã cho thuê</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {occupancyData.reduce((sum, item) => sum + item.occupied, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Báo Cáo Bảo Trì</h3>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Dữ liệu bảo trì đang được cập nhật</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Báo Cáo & Phân Tích</h2>
          <p className="text-gray-600">Xem và xuất các báo cáo chi tiết</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition">
            <Download className="w-4 h-4" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                  reportType === type.id
                    ? `bg-${type.color}-100 text-${type.color}-700 font-semibold`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {getReportContent()}
    </div>
  );
}
