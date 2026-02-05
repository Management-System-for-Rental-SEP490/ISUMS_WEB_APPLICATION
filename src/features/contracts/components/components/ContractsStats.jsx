import React from "react";
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function ContractsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tổng hợp đồng</span>
          <FileText className="w-5 h-5 text-teal-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Đang hiệu lực</span>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Chờ duyệt</span>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tổng giá trị</span>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          ₫{((stats.totalRent || 0) / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs text-gray-500 mt-1">Tháng</p>
      </div>
    </div>
  );
}
