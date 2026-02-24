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
import { LoadingSpinner } from "../../../components/shared/Loading";
import { formatDateVi } from "../utils/contract.format";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  PAYMENT_LABEL,
} from "../utils/contract.constants";

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
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số hợp đồng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách thuê
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bất động sản */}
              {/* </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời hạn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiền thuê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((contract) => {
              return (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {contract.contractNumber}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {contract.tenant}
                      </span>
                    </div>
                  </td>

                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {contract.property}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contract.unit}
                        </div>
                      </div>
                    </div>
                  </td> */}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDateVi(contract.startDate)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₫{(contract.rent || 0).toLocaleString("vi-VN")}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cọc: ₫{((contract.deposit || 0) / 1000000).toFixed(0)}M
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {PAYMENT_LABEL[contract.paymentType] ??
                        contract.paymentType}
                    </span>
                    {contract.autoRenew && (
                      <div className="text-xs text-green-600 mt-1">
                        Tự động gia hạn
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
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

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(contract.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(contract.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(contract.id)}
                        className="p-2 hover:bg-gray-100 rounded"
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
