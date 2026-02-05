import React from "react";
import { Search, Filter } from "lucide-react";

export default function ContractsFilters({ searchTerm, onSearch, filterStatus, onFilter }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số hợp đồng, khách thuê hoặc bất động sản..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="pending">Chờ duyệt</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>
      </div>
    </div>
  );
}
