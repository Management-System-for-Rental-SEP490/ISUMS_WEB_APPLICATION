import React, { useState } from 'react';
import { Zap, Droplet, Flame, TrendingUp, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

export default function Utilities() {
  const [activeTab, setActiveTab] = useState('electricity');

  const utilityTypes = [
    { id: 'electricity', label: 'Điện', icon: Zap, color: 'amber' },
    { id: 'water', label: 'Nước', icon: Droplet, color: 'blue' },
    { id: 'gas', label: 'Gas', icon: Flame, color: 'red' },
  ];

  const electricityData = [
    { id: 1, property: 'Vinhomes Central Park', current: 8500, limit: 10000, unit: 'kWh', status: 'warning', trend: '+12%' },
    { id: 2, property: 'Masteri Thảo Điền', current: 6200, limit: 8000, unit: 'kWh', status: 'good', trend: '-5%' },
    { id: 3, property: 'Saigon Pearl', current: 7800, limit: 9000, unit: 'kWh', status: 'warning', trend: '+8%' },
    { id: 4, property: 'Landmark 81', current: 12400, limit: 15000, unit: 'kWh', status: 'good', trend: '-3%' },
  ];

  const waterData = [
    { id: 1, property: 'Vinhomes Central Park', current: 4800, limit: 6000, unit: 'm³', status: 'good', trend: '+2%' },
    { id: 2, property: 'Masteri Thảo Điền', current: 3100, limit: 4000, unit: 'm³', status: 'good', trend: '-1%' },
    { id: 3, property: 'Saigon Pearl', current: 3800, limit: 5000, unit: 'm³', status: 'good', trend: '+5%' },
    { id: 4, property: 'Landmark 81', current: 5200, limit: 7000, unit: 'm³', status: 'good', trend: '-2%' },
  ];

  const gasData = [
    { id: 1, property: 'Vinhomes Central Park', current: 680, limit: 800, unit: 'kg', status: 'warning', trend: '+15%' },
    { id: 2, property: 'Masteri Thảo Điền', current: 420, limit: 600, unit: 'kg', status: 'good', trend: '-8%' },
    { id: 3, property: 'Saigon Pearl', current: 560, limit: 700, unit: 'kg', status: 'good', trend: '+3%' },
    { id: 4, property: 'Landmark 81', current: 890, limit: 1000, unit: 'kg', status: 'warning', trend: '+10%' },
  ];

  const getData = () => {
    switch (activeTab) {
      case 'electricity': return electricityData;
      case 'water': return waterData;
      case 'gas': return gasData;
      default: return electricityData;
    }
  };

  const currentData = getData();
  const activeType = utilityTypes.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Tiện Ích</h2>
          <p className="text-gray-600">Theo dõi và quản lý tiêu thụ tiện ích</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition">
          <Plus className="w-4 h-4" />
          Thêm Cấu Hình
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="flex gap-2">
          {utilityTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                  activeTab === type.id
                    ? `bg-${type.color}-100 text-${type.color}-700 font-semibold`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Utility List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tiêu Thụ {activeType?.label}</h3>
          <p className="text-sm text-gray-500">Tháng hiện tại</p>
        </div>

        <div className="space-y-4">
          {currentData.map((item) => {
            const percentage = (item.current / item.limit) * 100;
            const isWarning = percentage >= 80;
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.property}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Đã sử dụng: {item.current.toLocaleString()} {item.unit}</span>
                      <span>Giới hạn: {item.limit.toLocaleString()} {item.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'good' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className={`text-sm font-medium ${item.status === 'good' ? 'text-green-600' : 'text-amber-600'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mức sử dụng</span>
                    <span className={`font-semibold ${isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWarning ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng tiêu thụ</span>
            <TrendingUp className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currentData.reduce((sum, item) => sum + item.current, 0).toLocaleString()} {activeType?.label === 'Điện' ? 'kWh' : activeType?.label === 'Nước' ? 'm³' : 'kg'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tháng này</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Trung bình</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(currentData.reduce((sum, item) => sum + item.current, 0) / currentData.length).toFixed(0)} {activeType?.label === 'Điện' ? 'kWh' : activeType?.label === 'Nước' ? 'm³' : 'kg'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Mỗi bất động sản</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cảnh báo</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currentData.filter(item => item.status === 'warning').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Bất động sản</p>
        </div>
      </div>
    </div>
  );
}
