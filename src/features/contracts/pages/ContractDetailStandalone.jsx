import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readyContract, confirmByAdmin, getContractById } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import Icons from "../components/standalone/ContractDetailIcons";
import { useAuthStore } from "../../../features/auth/store/auth.store";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT: {
    label: "Bản nháp",
    bg: "rgba(148,163,184,0.12)", color: "#475569",
    border: "rgba(148,163,184,0.4)", dot: "#94a3b8",
  },
  READY: {
    label: "Chờ chủ nhà xác nhận",
    bg: "rgba(59,130,246,0.1)", color: "#1e40af",
    border: "rgba(59,130,246,0.3)", dot: "#3b82f6",
  },
  CONFIRM_BY_LANDLORD: {
    label: "Chủ nhà đã xác nhận, chờ ký",
    bg: "rgba(139,92,246,0.1)", color: "#5b21b6",
    border: "rgba(139,92,246,0.3)", dot: "#8b5cf6",
  },
  IN_PROGRESS: {
    label: "Đang chờ khách hàng ký",
    bg: "rgba(245,158,11,0.1)", color: "#92400e",
    border: "rgba(245,158,11,0.3)", dot: "#f59e0b",
  },
  CONFIRM_BY_TENANT: {
    label: "Khách hàng đã đồng ý ký",
    bg: "rgba(6,182,212,0.1)", color: "#0e7490",
    border: "rgba(6,182,212,0.3)", dot: "#06b6d4",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    bg: "rgba(16,185,129,0.1)", color: "#065f46",
    border: "rgba(16,185,129,0.3)", dot: "#10b981",
  },
  CORRECTING: {
    label: "Đang sửa",
    bg: "rgba(249,115,22,0.1)", color: "#9a3412",
    border: "rgba(249,115,22,0.3)", dot: "#f97316",
  },
  CANCELLED: {
    label: "Đã huỷ",
    bg: "rgba(113,113,122,0.1)", color: "#3f3f46",
    border: "rgba(113,113,122,0.3)", dot: "#71717a",
  },
  REJECTED_BY_TENANT: {
    label: "Khách hàng từ chối ký",
    bg: "rgba(239,68,68,0.1)", color: "#991b1b",
    border: "rgba(239,68,68,0.3)", dot: "#ef4444",
  },
  REJECTED_BY_LANDLORD: {
    label: "Chủ nhà từ chối ký",
    bg: "rgba(244,63,94,0.1)", color: "#9f1239",
    border: "rgba(244,63,94,0.3)", dot: "#f43f5e",
  },
  default: {
    label: "Không rõ",
    bg: "rgba(107,114,128,0.1)", color: "#374151",
    border: "rgba(107,114,128,0.2)", dot: "#9ca3af",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide"
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
        borderWidth: 1,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.bg}` }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, disabled, variant = "outline", icon, children, className = "" }) {
  const base = "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    teal:    "border border-teal-500 text-teal-700 bg-transparent hover:bg-teal-50",
    primary: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md hover:shadow-lg",
    violet:  "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:shadow-lg",
    danger:  "border border-red-300 text-red-600 bg-transparent hover:bg-red-50",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}>
      {icon}{children}
    </button>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, confirming, title, description, confirmLabel }) {
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
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
        <div className="mb-5 h-px bg-slate-100" />
        <div className="flex justify-end gap-2.5">
          <ActionButton onClick={onClose} disabled={confirming} variant="outline" icon={<Icons.X />}>
            Hủy bỏ
          </ActionButton>
          <ActionButton onClick={onConfirm} disabled={confirming} variant="primary"
            icon={confirming ? <Icons.Loader /> : <Icons.Send />}>
            {confirming ? "Đang xử lý..." : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContractDetailStandalone() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const roles     = useAuthStore((s) => s.roles ?? []);

  const isManager  = roles.includes("MANAGER") || roles.includes("ADMIN");
  const isLandlord = roles.includes("LANDLORD");

  const [contract, setContract]               = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [status, setStatus]                   = useState(null);

  // Manager confirm dialog (DRAFT → READY)
  const [showManagerConfirm, setShowManagerConfirm] = useState(false);
  const [confirming, setConfirming]                 = useState(false);

  // Landlord confirm dialog (READY → CONFIRM_BY_LANDLORD)
  const [showLandlordConfirm, setShowLandlordConfirm] = useState(false);
  const [landLordConfirming, setLandlordConfirming]   = useState(false);

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
    return () => { mounted = false; };
  }, [id]);

  const refetchContract = async () => {
    const raw = await getContractById(id);
    setStatus(raw.status);
    setContract(mapContractFromApi(raw));
  };

  // Manager xác nhận DRAFT → READY
  const handleManagerConfirm = async () => {
    if (!id || confirming) return;
    setShowManagerConfirm(false);
    setConfirming(true);
    try {
      await readyContract(id);
      toast.success("Hợp đồng đã được gửi cho chủ nhà xem và xác nhận.");
      await refetchContract();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Xác nhận thất bại.");
    } finally {
      setConfirming(false);
    }
  };

  // Landlord xác nhận READY → CONFIRM_BY_LANDLORD
  const handleLandlordConfirm = async () => {
    if (!id || landLordConfirming) return;
    setShowLandlordConfirm(false);
    setLandlordConfirming(true);
    try {
      await confirmByAdmin(id);
      toast.success("Xác nhận thành công! Bạn có thể tiến hành ký hợp đồng.");
      await refetchContract();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Xác nhận thất bại.");
    } finally {
      setLandlordConfirming(false);
    }
  };

  const normalizedStatus = (status ?? "").toUpperCase();
  const html = contract?.html ?? "";

  // Điều kiện hiển thị buttons
  const canManagerConfirm = isManager && normalizedStatus === "DRAFT";
  const canManagerEdit    = isManager && normalizedStatus === "DRAFT";
  const canLandlordConfirm = isLandlord && normalizedStatus === "READY";
  const canLandlordSign    = isLandlord && normalizedStatus === "CONFIRM_BY_LANDLORD";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 border border-teal-300/60 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Icons.FileText />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Hợp đồng</h1>
                {status && <StatusBadge status={normalizedStatus} />}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                <Icons.Hash />
                <span className="truncate">{contract?.contractNumber ?? contract?.name ?? id}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {/* DRAFT: Manager chỉnh sửa + xác nhận */}
            {canManagerEdit && (
              <ActionButton onClick={() => navigate(`/contracts/${id}/edit`)} icon={<Icons.Edit />} variant="teal">
                Chỉnh sửa
              </ActionButton>
            )}
            {canManagerConfirm && (
              <ActionButton
                onClick={() => setShowManagerConfirm(true)}
                disabled={confirming || loading || !!error}
                variant="primary"
                icon={confirming ? <Icons.Loader /> : <Icons.CheckCircle />}
              >
                {confirming ? "Đang xử lý..." : "Xác nhận hợp đồng"}
              </ActionButton>
            )}

            {/* READY: Landlord xác nhận */}
            {canLandlordConfirm && (
              <ActionButton
                onClick={() => setShowLandlordConfirm(true)}
                disabled={landLordConfirming || loading || !!error}
                variant="primary"
                icon={landLordConfirming ? <Icons.Loader /> : <Icons.CheckCircle />}
              >
                {landLordConfirming ? "Đang xử lý..." : "Xác nhận & Tiến hành ký"}
              </ActionButton>
            )}

            {/* CONFIRM_BY_LANDLORD: Landlord ký */}
            {canLandlordSign && (
              <ActionButton
                onClick={() => navigate(`/contracts/${id}/sign`)}
                disabled={loading || !!error}
                variant="violet"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
              >
                Ký hợp đồng
              </ActionButton>
            )}

            <ActionButton
              onClick={() => navigate("/dashboard", { state: { menu: "contracts" } })}
              variant="outline" icon={<Icons.X />}
            >
              Đóng
            </ActionButton>
          </div>
        </div>
      </header>

      <LoadingOverlay
        open={confirming || landLordConfirming}
        label={confirming ? "Đang gửi hợp đồng cho chủ nhà..." : "Đang xác nhận..."}
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
            <p className="mb-6 text-[13px] text-slate-400">Không thể tải nội dung hợp đồng. Vui lòng thử lại.</p>
            <button type="button" onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition">
              <Icons.ArrowLeft /> Quay lại
            </button>
          </div>
        )}

        {!loading && !error && html && (
          <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex gap-1.5">
                {["bg-red-400", "bg-amber-300", "bg-emerald-400"].map((c, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="ml-2 flex h-6 flex-1 items-center gap-1.5 rounded-md bg-slate-100 px-2.5 text-[11px] text-slate-400 font-mono">
                <Icons.Shield /><span>Hợp đồng thuê nhà</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Icons.Clock /><span>{new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
            <iframe
              title="Contract HTML" srcDoc={html}
              className="block w-full pt-12 px-10 border-0 min-h-[1000px]"
              sandbox="" referrerPolicy="no-referrer"
            />
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
        description="Hợp đồng sẽ được gửi cho chủ nhà xem xét và xác nhận. Bạn vẫn có thể chỉnh sửa nếu chủ nhà yêu cầu."
        confirmLabel="Xác nhận & Gửi"
      />

      {/* Dialog: Landlord xác nhận READY → CONFIRM_BY_LANDLORD */}
      <ConfirmDialog
        open={showLandlordConfirm}
        onClose={() => !landLordConfirming && setShowLandlordConfirm(false)}
        onConfirm={handleLandlordConfirm}
        confirming={landLordConfirming}
        title="Xác nhận & Tiến hành ký"
        description="Bạn đã đọc và đồng ý với nội dung hợp đồng. Sau khi xác nhận, bạn sẽ tiến hành ký hợp đồng điện tử."
        confirmLabel="Đồng ý & Xác nhận"
      />
    </div>
  );
}
