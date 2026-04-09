import React from "react";
import {
  FileText,
  Calendar,
  Users,
  Building2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "../../../../components/shared/Loading";
import { formatDateVi } from "../../utils/contract.format";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  PAYMENT_LABEL,
} from "../../utils/contract.constants";

export default function ContractsTable({
  items,
  onViewDetail,
  onEdit,
  onDelete,
  loading,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Danh Sách Hợp Đồng</h3>
        </div>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner
            size="lg"
            showLabel
            label="Đang tải danh sách hợp đồng..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Danh Sách Hợp Đồng ({items.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[600px]">
          <colgroup>
            <col className="w-10" />
            <col className="w-[40%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số hợp đồng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách thuê
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((contract, idx) => {
              return (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-center text-xs font-medium text-gray-400 whitespace-nowrap">{idx + 1}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate" title={contract.contractNumber}>
                        {contract.contractNumber}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate" title={contract.tenant}>
                        {contract.tenant}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {PAYMENT_LABEL[contract.paymentType] ?? contract.paymentType}
                    </span>
                    {contract.autoRenew && (
                      <div className="text-xs text-green-600 mt-0.5">Tự động gia hạn</div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_BADGE[contract.status] ??
                        STATUS_BADGE[(contract.status ?? "").toLowerCase()] ??
                        STATUS_BADGE.pending
                      }`}
                    >
                      {STATUS_LABEL[contract.status] ??
                        STATUS_LABEL[(contract.status ?? "").toLowerCase()] ??
                        contract.status ??
                        "—"}
                    </span>
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail(contract.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(contract.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(contract.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy hợp đồng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
