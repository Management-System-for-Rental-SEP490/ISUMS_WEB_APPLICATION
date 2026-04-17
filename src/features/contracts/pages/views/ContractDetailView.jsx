import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Download } from "lucide-react";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs";
import { LoadingSpinner } from "../../../../components/shared/Loading";
import { formatDateVi, formatMoneyVND } from "../../utils/contract.format";
import { STATUS_BADGE, STATUS_LABEL } from "../../utils/contract.constants";
import ContractPdfViewer from "../../components/shared/ContractPdfViewer";

export default function ContractDetailView({
  contract,
  contractId,
  loading,
  error,
  onBack,
  onEdit,
}) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const pdfUrl = contract?.pdfUrl ?? null;
  const contractHtml = contract?.html ?? "";
  const statusRaw = String(contract?.status ?? "pending");
  const statusKey = statusRaw.toLowerCase();
  const statusKeyUpper = statusRaw.toUpperCase();
  const isDraft = statusKeyUpper === "DRAFT" || statusKeyUpper === "PENDING_TENANT_REVIEW";
  const canDownload = statusKeyUpper === "COMPLETED" && !!pdfUrl;
  const startDateRaw =
    contract?.startDate ||
    contract?.startAt ||
    contract?.fromDate ||
    contract?.createdAt;
  const endDateRaw =
    contract?.endDate || contract?.endAt || contract?.toDate || null;
  const rentValue =
    contract?.rent ??
    contract?.rentAmount ??
    contract?.price ??
    contract?.monthlyRent ??
    contract?.amount ??
    0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Trang chủ", onClick: () => navigate("/dashboard") },
            { label: "Quản lý hợp đồng", onClick: onBack },
            { label: "Đang tải..." },
          ]}
        />
        <div className="bg-white rounded-xl border shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" showLabel label="Đang tải chi tiết hợp đồng..." />
          <p className="text-gray-600">Đang tải chi tiết hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Trang chủ", onClick: () => navigate("/dashboard") },
            { label: "Quản lý hợp đồng", onClick: onBack },
            { label: "Chi tiết" },
          ]}
        />
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
          <p className="text-red-600 font-medium mb-4">
            {error ?? "Không tìm thấy hợp đồng này."}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusBadge =
    STATUS_BADGE[statusKey] ??
    STATUS_BADGE[statusKeyUpper] ??
    STATUS_BADGE.draft;
  const statusLabel =
    STATUS_LABEL[statusKey] ??
    STATUS_LABEL[statusKeyUpper] ??
    contract?.status;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => navigate("/dashboard") },
          { label: "Quản lý hợp đồng", onClick: onBack },
          { label: contract?.contractNumber ?? contract?.name ?? "Chi tiết" },
        ]}
      />

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {contract?.contractNumber ?? contract?.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {contract?.tenant} • {contract?.property ?? "—"} (
              {contract?.unit ?? "—"})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canDownload && (
              <button
                type="button"
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true);
                  try {
                    const res = await fetch(pdfUrl);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${contract?.contractNumber ?? contract?.name ?? "hopдong"}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch {
                    window.open(pdfUrl, "_blank");
                  } finally {
                    setDownloading(false);
                  }
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Đang tải..." : "Tải về"}
              </button>
            )}
            {isDraft && (
              <button
                type="button"
                onClick={() => onEdit(contract?.id ?? contractId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Thời hạn</div>
            <div className="mt-1 text-gray-900 font-medium">
              {startDateRaw ? formatDateVi(startDateRaw) : "—"} →{" "}
              {endDateRaw ? formatDateVi(endDateRaw) : "—"}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Tiền thuê</div>
            <div className="mt-1 text-gray-900 font-medium">
              {formatMoneyVND(rentValue)}
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-sm text-gray-500">Trạng thái</div>
            <div className="mt-1">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-gray-500 mb-2">Nội dung hợp đồng</div>
          {isDraft ? (
            <iframe
              title="Contract HTML"
              srcDoc={contractHtml}
              className="w-full min-h-[900px] rounded-lg border border-slate-200 bg-white"
              sandbox=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <ContractPdfViewer pdfUrl={pdfUrl} />
          )}
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
