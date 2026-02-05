import React from "react";
import Breadcrumbs from "../../components/components/Breadscrumbs";

export default function ContractEditView({ contract, onBack, onNavigateMenu }) {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => onNavigateMenu?.("dashboard") },
          { label: "Quản lý hợp đồng", onClick: onBack },
          { label: contract?.contractNumber ?? "Chi tiết" },
          { label: "Chỉnh sửa" },
        ]}
      />

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Chỉnh sửa: {contract?.contractNumber}
        </h2>

        <div className="mt-4 text-sm text-gray-500">
          (Placeholder) Form chỉnh sửa hợp đồng sẽ được thêm tại đây.
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
