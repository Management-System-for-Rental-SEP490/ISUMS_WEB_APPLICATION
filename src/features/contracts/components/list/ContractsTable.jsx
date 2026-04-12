import React from "react";
import { Eye, Edit, Trash2, RefreshCw, FileText } from "lucide-react";
import { formatDateVi } from "../../utils/contract.format";
import { STATUS_BADGE, STATUS_LABEL, PAYMENT_LABEL } from "../../utils/contract.constants";

const DOT_COLOR = {
  DRAFT:                  "bg-slate-400",
  PENDING_TENANT_REVIEW:  "bg-sky-500",
  CORRECTING:             "bg-orange-500",
  READY:                  "bg-blue-500",
  IN_PROGRESS:            "bg-amber-500",
  COMPLETED:              "bg-emerald-500",
  CANCELLED_BY_TENANT:    "bg-red-500",
  CANCELLED_BY_LANDLORD:  "bg-rose-500",
};

function StatusBadge({ status }) {
  const cls   = STATUS_BADGE[status] ?? STATUS_BADGE[(status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  const label = STATUS_LABEL[status] ?? STATUS_LABEL[(status ?? "").toLowerCase()] ?? status ?? "—";
  const dot   = DOT_COLOR[status] ?? "bg-gray-400";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

const hasRealValue = (v) => v && v !== "—";

export default function ContractsTable({ items, onViewDetail, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center gap-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
        <span className="text-sm">Đang tải danh sách hợp đồng...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Không tìm thấy hợp đồng nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="w-10 px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">#</th>
              <th className="w-56 px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Số hợp đồng</th>
              <th className="w-44 px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Khách thuê</th>
              <th className="w-32 px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Thanh toán</th>
              <th className="w-36 px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((contract, idx) => {
              const payLabel = PAYMENT_LABEL[contract.paymentType] ?? contract.paymentType ?? "—";
              return (
                <tr key={contract.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-400 align-middle">{idx + 1}</td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={contract.contractNumber}>
                      {contract.contractNumber}
                    </p>
                    {(contract.startDate || contract.endDate) && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {formatDateVi(contract.startDate) ?? "?"} → {formatDateVi(contract.endDate) ?? "?"}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm font-medium text-slate-800 truncate" title={contract.tenant}>
                      {hasRealValue(contract.tenant) ? contract.tenant : "—"}
                    </p>
                    {hasRealValue(contract.property) && (
                      <p className="text-[11px] text-slate-400 truncate">{contract.property}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm text-slate-600">{payLabel}</p>
                    {contract.autoRenew && (
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Tự động gia hạn</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => onViewDetail(contract.id)}
                        className="p-1.5 rounded-lg hover:bg-teal-50 hover:text-teal-600 text-slate-500 transition" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onEdit(contract.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onDelete(contract.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-500 transition" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
