import React from 'react';
import { Zap, Droplet, Flame, TrendingUp } from 'lucide-react';

export default function ChartSection({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'electricity', label: 'Điện', icon: Zap, color: 'amber' },
    { id: 'water', label: 'Nước', icon: Droplet, color: 'blue' },
    { id: 'gas', label: 'Gas', icon: Flame, color: 'red' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Biểu Đồ Tiêu Thụ</h3>
        </div>

        {/* Navbar chuyển đổi tab */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} // Khi click sẽ cập nhật state ở Dashboard.jsx
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? `text-${tab.color}-500` : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phần vẽ Biểu đồ - Chỉ hiện đường line của tab đang chọn */}
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {activeTab === 'electricity' && (
            <path d="M 0 100 Q 100 90 200 85 T 400 60 T 600 50 T 800 80" fill="rgba(251, 191, 36, 0.1)" stroke="rgb(251, 191, 36)" strokeWidth="3" />
          )}
          {activeTab === 'water' && (
            <path d="M 0 130 Q 100 125 200 120 T 400 100 T 600 95 T 800 110" fill="rgba(59, 130, 246, 0.1)" stroke="rgb(59, 130, 246)" strokeWidth="3" />
          )}
          {activeTab === 'gas' && (
            <path d="M 0 150 Q 100 148 200 145 T 400 140 T 600 142 T 800 155" fill="rgba(239, 68, 68, 0.1)" stroke="rgb(239, 68, 68)" strokeWidth="3" />
          )}
        </svg>
      </div>
    </div>
  );
}