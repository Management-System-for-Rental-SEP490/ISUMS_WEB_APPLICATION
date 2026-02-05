import React from "react";
import { Edit } from "lucide-react";
import Breadcrumbs from "../../components/components/Breadscrumbs";
import { formatDateVi } from "../../utils/contract.format";
import { STATUS_BADGE, STATUS_LABEL } from "../../utils/contract.constains";

export default function ContractDetailView({ contract, onBack, onEdit, onNavigateMenu }) {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => onNavigateMenu?.("dashboard") },
          { label: "Quản lý hợp đồng", onClick: onBack },
          { label: contract?.contractNumber ?? "Chi tiết" },
        ]}
      />

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {contract?.contractNumber}
            </h2>
            <p className="text-gray-600 mt-1">
              {contract?.tenant} • {contract?.property} ({contract?.unit})
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEdit(contract?.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Thời hạn</div>
            <div className="mt-1 text-gray-900 font-medium">
              {formatDateVi(contract?.startDate)} → {formatDateVi(contract?.endDate)}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Tiền thuê</div>
            <div className="mt-1 text-gray-900 font-medium">
              ₫{(contract?.rent ?? 0).toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Trạng thái</div>
            <div className="mt-1">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  STATUS_BADGE[contract?.status] ?? STATUS_BADGE.pending
                }`}
              >
                {STATUS_LABEL[contract?.status] ?? contract?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    </div>
  );
}
