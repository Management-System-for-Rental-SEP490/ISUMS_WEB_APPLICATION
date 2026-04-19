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
      <div className="rounded-2xl p-16 flex flex-col items-center gap-3"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "#3bb582" }} />
        <span className="text-sm" style={{ color: "#5A7A6E" }}>Đang tải danh sách hợp đồng...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl p-16 flex flex-col items-center gap-3"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
          <FileText className="w-7 h-7" style={{ color: "#C4DED5" }} />
        </div>
        <p className="text-sm font-medium" style={{ color: "#5A7A6E" }}>Không tìm thấy hợp đồng nào</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr style={{ background: "#EAF4F0", borderBottom: "1px solid #C4DED5" }}>
              <th className="w-10 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>#</th>
              <th className="w-56 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>Số hợp đồng</th>
              <th className="w-44 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>Khách thuê</th>
              <th className="w-32 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>Thanh toán</th>
              <th className="w-36 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>Trạng thái</th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((contract, idx) => {
              const payLabel = PAYMENT_LABEL[contract.paymentType] ?? contract.paymentType ?? "—";
              return (
                <tr
                  key={contract.id}
                  className="group transition-colors"
                  style={{ borderBottom: "1px solid #EAF4F0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(59,181,130,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td className="px-5 py-3.5 text-xs font-medium align-middle" style={{ color: "#5A7A6E" }}>{idx + 1}</td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }} title={contract.contractNumber}>
                      {contract.contractNumber}
                    </p>
                    {(contract.startDate || contract.endDate) && (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: "#5A7A6E" }}>
                        {formatDateVi(contract.startDate) ?? "?"} → {formatDateVi(contract.endDate) ?? "?"}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm font-medium truncate" style={{ color: "#1E2D28" }} title={contract.tenant}>
                      {hasRealValue(contract.tenant) ? contract.tenant : "—"}
                    </p>
                    {hasRealValue(contract.property) && (
                      <p className="text-[11px] truncate" style={{ color: "#5A7A6E" }}>{contract.property}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <p className="text-sm" style={{ color: "#1E2D28" }}>{payLabel}</p>
                    {contract.autoRenew && (
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: "#3bb582" }}>Tự động gia hạn</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => onViewDetail(contract.id)}
                        className="p-1.5 rounded-lg transition" style={{ color: "#5A7A6E" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,181,130,0.10)"; e.currentTarget.style.color = "#3bb582"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
                        title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onEdit(contract.id)}
                        className="p-1.5 rounded-lg transition" style={{ color: "#5A7A6E" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(32,150,216,0.10)"; e.currentTarget.style.color = "#2096d8"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
                        title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onDelete(contract.id)}
                        className="p-1.5 rounded-lg transition" style={{ color: "#5A7A6E" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,95,75,0.10)"; e.currentTarget.style.color = "#D95F4B"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
                        title="Xóa">
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
