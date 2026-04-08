import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmByAdmin, getContractById } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import Icons from "../components/standalone/ContractDetailIcons";
import ContractPdfViewer from "../components/shared/ContractPdfViewer";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { STATUS_LABEL } from "../utils/contract.constants";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  DRAFT:                  { bg: "rgba(148,163,184,0.12)", color: "#475569", border: "rgba(148,163,184,0.4)", dot: "#94a3b8" },
  PENDING_TENANT_REVIEW:  { bg: "rgba(14,165,233,0.1)",  color: "#0369a1", border: "rgba(14,165,233,0.3)",  dot: "#0ea5e9" },
  READY:                  { bg: "rgba(59,130,246,0.1)",   color: "#1e40af", border: "rgba(59,130,246,0.3)",  dot: "#3b82f6" },
  IN_PROGRESS:            { bg: "rgba(245,158,11,0.1)",   color: "#92400e", border: "rgba(245,158,11,0.3)",  dot: "#f59e0b" },
  CONFIRM_BY_TENANT:      { bg: "rgba(6,182,212,0.1)",    color: "#0e7490", border: "rgba(6,182,212,0.3)",   dot: "#06b6d4" },
  COMPLETED:              { bg: "rgba(16,185,129,0.1)",   color: "#065f46", border: "rgba(16,185,129,0.3)",  dot: "#10b981" },
  CORRECTING:             { bg: "rgba(249,115,22,0.1)",   color: "#9a3412", border: "rgba(249,115,22,0.3)",  dot: "#f97316" },
  CANCELLED:              { bg: "rgba(113,113,122,0.1)",  color: "#3f3f46", border: "rgba(113,113,122,0.3)", dot: "#71717a" },
  CANCELLED_BY_TENANT:    { bg: "rgba(239,68,68,0.1)",    color: "#991b1b", border: "rgba(239,68,68,0.3)",   dot: "#ef4444" },
  CANCELLED_BY_LANDLORD:  { bg: "rgba(244,63,94,0.1)",    color: "#9f1239", border: "rgba(244,63,94,0.3)",   dot: "#f43f5e" },
  REJECTED_BY_TENANT:     { bg: "rgba(239,68,68,0.1)",    color: "#991b1b", border: "rgba(239,68,68,0.3)",   dot: "#ef4444" },
  REJECTED_BY_LANDLORD:   { bg: "rgba(244,63,94,0.1)",    color: "#9f1239", border: "rgba(244,63,94,0.3)",   dot: "#f43f5e" },
  default:                { bg: "rgba(107,114,128,0.1)",  color: "#374151", border: "rgba(107,114,128,0.2)", dot: "#9ca3af" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.default;
  const label = STATUS_LABEL[status] ?? "Không rõ";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
        borderWidth: 1,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: style.dot, boxShadow: `0 0 0 3px ${style.bg}` }}
      />
      {label}
    </span>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionButton({
  onClick,
  disabled,
  variant = "outline",
  icon,
  children,
  className = "",
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    outline:
      "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    teal: "border border-teal-500 text-teal-700 bg-transparent hover:bg-teal-50",
    primary:
      "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md hover:shadow-lg",
    violet:
      "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:shadow-lg",
    danger: "border border-red-300 text-red-600 bg-transparent hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  confirming,
  title,
  description,
  confirmLabel,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[calc(100%-32px)] max-w-md rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/70 bg-amber-50 text-amber-700">
            <Icons.AlertTriangle />
          </div>
          <div>
            <h3 className="m-0 text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        </div>
        <div className="mb-5 h-px bg-slate-100" />
        <div className="flex justify-end gap-2.5">
          <ActionButton
            onClick={onClose}
            disabled={confirming}
            variant="outline"
            icon={<Icons.X />}
          >
            Hủy bỏ
          </ActionButton>
          <ActionButton
            onClick={onConfirm}
            disabled={confirming}
            variant="primary"
            icon={confirming ? <Icons.Loader /> : <Icons.Send />}
          >
            {confirming ? "Đang xử lý..." : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContractDetailStandalone() {
  const { id } = useParams();
  const navigate = useNavigate();
  const roles = useAuthStore((s) => s.roles ?? []);

  const isLandlord = roles.includes("LANDLORD");

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Manager confirm dialog (DRAFT → PENDING_TENANT_REVIEW)
  const [showManagerConfirm, setShowManagerConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        setStatus(raw.status);
        const mapped = mapContractFromApi(raw);
        if (mounted) setContract(mapped);
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          status === 403
            ? "Bạn không có quyền xem hợp đồng này."
            : status === 404
              ? "Không tìm thấy hợp đồng."
              : "Không thể tải hợp đồng, vui lòng thử lại.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const refetchContract = async () => {
    const raw = await getContractById(id);
    setStatus(raw.status);
    setContract(mapContractFromApi(raw));
  };

  // Manager xác nhận DRAFT → PENDING_TENANT_REVIEW
  const handleManagerConfirm = async () => {
    if (!id || confirming) return;
    setShowManagerConfirm(false);
    setConfirming(true);
    try {
      await confirmByAdmin(id);
      toast.success(
        "Xác nhận thành công! Email đã được gửi cho khách thuê xem xét.",
      );
      await refetchContract();
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400
          ? "Không thể xác nhận hợp đồng này (hợp đồng không đủ điều kiện)."
          : status === 403
            ? "Bạn không có quyền xác nhận hợp đồng này."
            : status === 404
              ? "Không tìm thấy hợp đồng."
              : "Xác nhận thất bại, vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  const normalizedStatus = (status ?? "").toUpperCase();
  const isDraft =
    normalizedStatus === "DRAFT" ||
    normalizedStatus === "PENDING_TENANT_REVIEW";
  const pdfUrl = contract?.pdfUrl ?? null;
  const html = contract?.html ?? "";

  // Điều kiện hiển thị buttons
  const canConfirm = normalizedStatus === "DRAFT";
  const canLandlordSign = isLandlord && normalizedStatus === "READY";
  const canDownload = normalizedStatus === "COMPLETED" && !!pdfUrl;

  const goBack = () => navigate("/dashboard", { state: { menu: "contracts" } });

  const handleDownload = async () => {
    if (!pdfUrl) return;
    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${contract?.contractNumber ?? contract?.name ?? id}.pdf`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Không thể tải file, vui lòng thử lại.");
    }
  };

  console.log("DEBUG", { status, normalizedStatus, pdfUrl, canDownload });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="h-16 flex items-center px-4 gap-3">
          {/* Back — sát trái */}
          <button
            type="button"
            onClick={goBack}
            className="flex-shrink-0 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <Icons.ArrowLeft />
            <span className="whitespace-nowrap ">Quay lại danh sách</span>
          </button>

          <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

          {/* Title block */}
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
              Chi tiết hợp đồng thuê nhà
            </h1>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wide truncate leading-tight">
              Mã hồ sơ:{" "}
              {contract?.contractNumber ?? contract?.name ?? id ?? "—"}
            </p>
          </div>

          {/* Status badge */}
          {status && <StatusBadge status={normalizedStatus} />}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canConfirm && (
              <ActionButton
                onClick={() => navigate(`/contracts/${id}/edit`)}
                icon={<Icons.Edit />}
                variant="teal"
              >
                Chỉnh sửa
              </ActionButton>
            )}
            {canConfirm && (
              <ActionButton
                onClick={() => setShowManagerConfirm(true)}
                disabled={confirming || loading || !!error}
                variant="primary"
                icon={confirming ? <Icons.Loader /> : <Icons.CheckCircle />}
              >
                {confirming ? "Đang xử lý..." : "Xác nhận hợp đồng"}
              </ActionButton>
            )}
            {canLandlordSign && (
              <ActionButton
                onClick={() => navigate(`/contracts/${id}/sign`)}
                disabled={loading || !!error}
                variant="violet"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                }
              >
                Ký hợp đồng
              </ActionButton>
            )}
            {canDownload && (
              <ActionButton
                onClick={handleDownload}
                variant="teal"
                icon={<Icons.Download />}
              >
                Tải về
              </ActionButton>
            )}
            {/* Close button — dark filled như stitch */}
            <button
              type="button"
              onClick={goBack}
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              <Icons.X />
              Đóng
            </button>
          </div>
        </div>
      </header>

      <LoadingOverlay
        open={confirming}
        label="Đang gửi hợp đồng cho khách thuê..."
      />

      {/* Main content */}
      <main className="px-6 pb-10 pt-6">
        {loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
            <LoadingSpinner size="lg" showLabel label="Đang tải hợp đồng..." />
          </div>
        )}

        {error && !loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-red-200 shadow-sm px-12 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Icons.AlertTriangle />
            </div>
            <p className="mb-1 font-semibold text-red-600">{error}</p>
            <p className="mb-6 text-[13px] text-slate-400">
              Không thể tải nội dung hợp đồng. Vui lòng thử lại.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Icons.ArrowLeft /> Quay lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-3xl mx-auto">
            {isDraft ? (
              <iframe
                title="Contract HTML"
                srcDoc={html}
                className="block w-full min-h-[1000px] rounded-2xl border border-slate-200 bg-white shadow-md"
                sandbox=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <ContractPdfViewer pdfUrl={pdfUrl} />
            )}
          </div>
        )}
      </main>

      {/* Dialog: Manager xác nhận DRAFT → READY */}
      <ConfirmDialog
        open={showManagerConfirm}
        onClose={() => !confirming && setShowManagerConfirm(false)}
        onConfirm={handleManagerConfirm}
        confirming={confirming}
        title="Xác nhận hợp đồng"
        description="Hợp đồng sẽ được gửi cho người thuê xem và xác nhận. Bạn vẫn có thể chỉnh sửa nếu chủ nhà yêu cầu."
        confirmLabel="Xác nhận & Gửi"
      />
    </div>
  );
}
