import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmContract, getContractById } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import Icons from "../components/standalone/ContractDetailIcons";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  DRAFT: {
    label: "Bản nháp",
    bg: "rgba(251,191,36,0.12)",
    color: "#b45309",
    border: "rgba(251,191,36,0.4)",
    dot: "#f59e0b",
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "rgba(16,185,129,0.1)",
    color: "#065f46",
    border: "rgba(16,185,129,0.3)",
    dot: "#10b981",
  },
  PENDING: {
    label: "Chờ ký",
    bg: "rgba(59,130,246,0.1)",
    color: "#1e40af",
    border: "rgba(59,130,246,0.3)",
    dot: "#3b82f6",
  },
  default: {
    label: "Không rõ",
    bg: "rgba(107,114,128,0.1)",
    color: "#374151",
    border: "rgba(107,114,128,0.2)",
    dot: "#9ca3af",
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.default;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide"
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
        boxShadow: "0 0 0 1px transparent",
        borderWidth: 1,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{
          background: cfg.dot,
          boxShadow: `0 0 0 3px ${cfg.bg}`,
        }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Header Action Button ─────────────────────────────────────────────────────
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
    danger:
      "border border-slate-300 text-slate-600 bg-transparent hover:bg-slate-50",
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
function ConfirmDialog({ open, onClose, onConfirm, confirming }) {
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
        {/* Icon header */}
        <div className="mb-5 flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/70 bg-amber-50 text-amber-700">
            <Icons.AlertTriangle />
          </div>
          <div>
            <h3 className="m-0 text-base font-bold text-slate-900">
              Xác nhận hợp đồng
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
              Hành động này sẽ gửi hợp đồng cho khách thuê để ký.
              <span className="font-semibold text-slate-800">
                {" "}
                Bạn không thể hủy sau khi xác nhận.
              </span>
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
            {confirming ? "Đang xử lý..." : "Xác nhận & Gửi"}
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
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [status, setStatus] = useState("null");
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
        if (mounted) setError(err?.message ?? "Không thể tải hợp đồng.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const openConfirmDialog = () => setShowConfirmDialog(true);
  const closeConfirmDialog = () => !confirming && setShowConfirmDialog(false);

  const handleConfirm = async () => {
    if (!id || confirming) return;
    setShowConfirmDialog(false);
    try {
      setConfirming(true);
      await confirmContract(id);
      toast.success(
        "Xác nhận hợp đồng thành công! Hợp đồng đã được gửi cho khách thuê ký.",
      );
      const raw = await getContractById(id);
      setStatus(raw.status);
      setContract(mapContractFromApi(raw));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Xác nhận hợp đồng thất bại.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  const html = contract?.html ?? "";
  const normalizedStatus = (status ?? "").toUpperCase();
  const canEditOrConfirm = normalizedStatus === "DRAFT" || normalizedStatus === "READY";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
          {/* Left: icon + title + meta */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Icons.FileText />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  Hợp đồng
                </h1>
                {status && status !== "null" && (
                  <StatusBadge status={status} />
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                <Icons.Hash />
                <span className="truncate">
                  {contract?.contractNumber ?? contract?.name ?? id}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex gap-2 shrink-0">
            {canEditOrConfirm && (
              <>
                <ActionButton
                  onClick={() => navigate(`/contracts/${id}/edit`)}
                  icon={<Icons.Edit />}
                  variant="teal"
                >
                  Chỉnh sửa
                </ActionButton>
                <ActionButton
                  onClick={openConfirmDialog}
                  disabled={confirming || loading || !!error}
                  variant="primary"
                  icon={confirming ? <Icons.Loader /> : <Icons.CheckCircle />}
                >
                  {confirming ? "Đang xác nhận..." : "Xác nhận hợp đồng"}
                </ActionButton>
              </>
            )}
            <ActionButton
              onClick={() =>
                navigate("/dashboard", { state: { menu: "contracts" } })
              }
              variant="outline"
              icon={<Icons.X />}
            >
              Đóng
            </ActionButton>
          </div>
        </div>
      </header>

      {/* Loading overlay when confirming */}
      <LoadingOverlay open={confirming} label="Đang xác nhận hợp đồng..." />

      {/* Main content */}
      <main className="px-6 pb-10 pt-6">
        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
            <LoadingSpinner
              size="lg"
              showLabel
              label="Đang tải hợp đồng..."
            />
          </div>
        )}

        {/* Error state */}
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
              <Icons.ArrowLeft />
              Quay lại
            </button>
          </div>
        )}

        {/* Contract iframe */}
        {!loading && !error && html && (
          <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            {/* Document toolbar */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex gap-1.5">
                {["bg-red-400", "bg-amber-300", "bg-emerald-400"].map(
                  (c, idx) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      className={`h-2.5 w-2.5 rounded-full ${c}`}
                    />
                  ),
                )}
              </div>
              <div className="ml-2 flex h-6 flex-1 items-center gap-1.5 rounded-md bg-slate-100 px-2.5 text-[11px] text-slate-400 font-mono">
                <Icons.Shield />
                <span>Hợp đồng thuê nhà</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Icons.Clock />
                <span>{new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <iframe
              title="Contract HTML"
              srcDoc={html}
              className="block w-full border-0 min-h-[1000px]"
              sandbox=""
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </main>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirm}
        confirming={confirming}
      />
    </div>
  );
}
