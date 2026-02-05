import React from "react";
import { Plus } from "lucide-react";

export default function ContractsHeader({ total, onCreate }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Hợp Đồng</h2>
        <p className="text-gray-600">Tổng cộng {total} hợp đồng</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCreate}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          Tạo Hợp Đồng Mới
        </button>
      </div>
    </div>
  );
}
