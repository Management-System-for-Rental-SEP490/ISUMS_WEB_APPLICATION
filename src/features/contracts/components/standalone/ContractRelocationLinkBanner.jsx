import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, FileText, Repeat, History } from "lucide-react";
import { getContractRelocationLink } from "../../../relocations/api/relocations.api";

const KIND_LABEL_VI = {
  ACTIVE_LEASE_TENANT_UPGRADE: "Khách đổi nhà theo nhu cầu",
  PRE_HANDOVER_TENANT_REQUEST: "Khách đổi nhà trước bàn giao",
  LANDLORD_FAULT_UNINHABITABLE: "Nhà không đủ điều kiện sử dụng",
};

const STATUS_LABEL_VI = {
  REQUESTED: "Chờ duyệt",
  QUOTED: "Chờ khách xác nhận báo giá",
  APPROVED: "Đã duyệt",
  CONTRACT_CREATED: "Đã tạo HĐ thay thế",
  ADDITIONAL_PAYMENT_PENDING: "Chờ thu thêm",
  REFUND_PENDING: "Chờ hoàn tiền",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

function shortId(value) {
  if (!value) return "—";
  return String(value).slice(0, 8).toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ContractRelocationLinkBanner({ contractId }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!contractId) {
      setLink(null);
      setLoading(false);
      return () => {};
    }
    setLoading(true);
    getContractRelocationLink(contractId)
      .then((data) => {
        if (!cancelled) setLink(data);
      })
      .catch(() => {
        if (!cancelled) setLink(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contractId]);

  if (loading || !link) return null;

  const isCurrentOld = String(link.oldContractId ?? "") === String(contractId);
  const linkedId = isCurrentOld ? link.newContractId : link.oldContractId;
  const linkedNumber = isCurrentOld ? link.newContractNumber : link.oldContractNumber;
  if (!linkedId) return null;

  const kindLabel = KIND_LABEL_VI[link.requestKind] ?? link.requestKind ?? "—";
  const statusLabel = STATUS_LABEL_VI[link.status] ?? link.status ?? "—";

  const tone = isCurrentOld
    ? {
        bg: "bg-slate-100",
        border: "border-slate-300",
        title: "text-slate-700",
        accent: "text-slate-500",
      }
    : {
        bg: "bg-sky-50",
        border: "border-sky-200",
        title: "text-sky-900",
        accent: "text-sky-700",
      };

  return (
    <div
      className={`rounded-2xl ${tone.bg} ${tone.border} border p-5 shadow-sm`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white ${tone.accent}`}>
          {isCurrentOld ? <History className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-bold uppercase tracking-wide ${tone.title}`}>
            {isCurrentOld
              ? "Hợp đồng này đã được thay thế"
              : "Hợp đồng thay thế"}
          </div>
          <div className="mt-1 text-[13px] text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className={tone.accent}>
                {isCurrentOld ? "Thay thế bởi:" : "Thay thế cho:"}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/contracts/${linkedId}`)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 font-mono text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5" />
                {linkedNumber || `#${shortId(linkedId)}`}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <div>
                <span className={tone.accent}>Lý do: </span>
                <span className="font-medium">{kindLabel}</span>
              </div>
              <div>
                <span className={tone.accent}>Trạng thái: </span>
                <span className="font-medium">{statusLabel}</span>
              </div>
              <div>
                <span className={tone.accent}>Ngày bàn giao: </span>
                <span className="font-medium">{formatDate(link.newHandoverDate || link.contractCreatedAt)}</span>
              </div>
              <div>
                <span className={tone.accent}>Cọc đã chuyển: </span>
                <span className="font-medium">{formatMoney(link.transferredDepositAmount)}</span>
              </div>
              {Number(link.totalAdditionalPaymentAmount ?? link.additionalDepositAmount ?? 0) > 0 && (
                <div className="sm:col-span-2">
                  <span className={tone.accent}>Bên B nộp thêm: </span>
                  <span className="font-semibold text-amber-700">
                    {formatMoney(link.totalAdditionalPaymentAmount ?? link.additionalDepositAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
