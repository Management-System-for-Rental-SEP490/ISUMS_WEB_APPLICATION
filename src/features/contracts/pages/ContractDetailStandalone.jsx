import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmContract, getContractById } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  FileText: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  X: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Send: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22,2 15,22 11,13 2,9 22,2" />
    </svg>
  ),
  Loader: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
  Hash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
};

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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
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
  style = {},
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
    border: "none",
    outline: "none",
    opacity: disabled ? 0.55 : 1,
    ...style,
  };

  const variants = {
    outline: {
      background: "transparent",
      border: "1.5px solid #d1d5db",
      color: "#374151",
    },
    teal: {
      background: "transparent",
      border: "1.5px solid #0d9488",
      color: "#0f766e",
    },
    primary: {
      background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
    },
    danger: {
      background: "transparent",
      border: "1.5px solid #d1d5db",
      color: "#6b7280",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          maxWidth: 420,
          width: "calc(100% - 32px)",
          padding: "28px 28px 24px",
          animation: "slideUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(251,191,36,0.12)",
              border: "1.5px solid rgba(251,191,36,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
              flexShrink: 0,
            }}
          >
            <Icons.AlertTriangle />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Xác nhận hợp đồng
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13.5,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Hành động này sẽ gửi hợp đồng cho khách thuê để ký.
              <strong style={{ color: "#374151" }}>
                {" "}
                Bạn không thể hủy sau khi xác nhận.
              </strong>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
  const isAlreadyConfirmed = status === "confirmed";

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

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .action-btn-teal:hover:not(:disabled) {
          background: rgba(13,148,136,0.06) !important;
        }
        .action-btn-outline:hover:not(:disabled) {
          background: #f9fafb !important;
        }
        .action-btn-primary:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(13,148,136,0.4) !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            width: "100%",
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 24px",
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* Left: icon + title + meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0d9488",
                  flexShrink: 0,
                  border: "1px solid rgba(13,148,136,0.15)",
                }}
              >
                <Icons.FileText />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111827",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Hợp đồng
                  </h1>
                  {status && status !== "null" && (
                    <StatusBadge status={status} />
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 2,
                  }}
                >
                  <Icons.Hash />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#9ca3af",
                      fontFamily: "monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {contract?.contractNumber ?? contract?.name ?? id}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => navigate(`/contracts/${id}/edit`)}
                  className="action-btn-teal"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "transparent",
                    border: "1.5px solid #0d9488",
                    color: "#0f766e",
                    transition: "all 0.15s",
                  }}
                >
                  <Icons.Edit />
                  Chỉnh sửa
                </button>
              )}

              {!isAlreadyConfirmed && status === "DRAFT" && (
                <button
                  type="button"
                  onClick={openConfirmDialog}
                  disabled={confirming || loading || !!error}
                  className="action-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor:
                      confirming || loading || !!error
                        ? "not-allowed"
                        : "pointer",
                    background:
                      "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(13,148,136,0.28)",
                    transition: "all 0.15s",
                    opacity: confirming || loading || !!error ? 0.6 : 1,
                  }}
                >
                  {confirming ? <Icons.Loader /> : <Icons.CheckCircle />}
                  {confirming ? "Đang xác nhận..." : "Xác nhận hợp đồng"}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard", { state: { menu: "contracts" } })
                }
                className="action-btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  border: "1.5px solid #d1d5db",
                  color: "#6b7280",
                  transition: "all 0.15s",
                }}
              >
                <Icons.X />
                Đóng
              </button>
            </div>
          </div>
        </header>

        {/* ── Loading overlay ── */}
        <LoadingOverlay open={confirming} label="Đang xác nhận hợp đồng..." />

        {/* ── Main content ── */}
        <main style={{ padding: "24px 24px 40px" }}>
          {/* Loading skeleton */}
          {loading && (
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                padding: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background:
                    "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                  backgroundSize: "400px 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
              <LoadingSpinner
                size="lg"
                showLabel
                label="Đang tải hợp đồng..."
              />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #fecaca",
                boxShadow: "0 2px 12px rgba(239,68,68,0.06)",
                padding: 48,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(254,226,226,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                  margin: "0 auto 16px",
                }}
              >
                <Icons.AlertTriangle />
              </div>
              <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 6 }}>
                {error}
              </p>
              <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 24 }}>
                Không thể tải nội dung hợp đồng. Vui lòng thử lại.
              </p>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "#fff",
                  border: "1.5px solid #d1d5db",
                  color: "#374151",
                  transition: "all 0.15s",
                }}
              >
                <Icons.ArrowLeft />
                Quay lại
              </button>
            </div>
          )}

          {/* Contract iframe */}
          {!loading && !error && html && (
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Document toolbar */}
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  background: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 5 }}>
                  {["#f87171", "#fbbf24", "#34d399"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    height: 24,
                    borderRadius: 6,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    gap: 6,
                  }}
                >
                  <Icons.Shield style={{ color: "#9ca3af" }} />
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      fontFamily: "monospace",
                    }}
                  >
                    Hợp đồng thuê nhà
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#9ca3af",
                  }}
                >
                  <Icons.Clock />
                  <span style={{ fontSize: 11 }}>
                    {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <iframe
                title="Contract HTML"
                srcDoc={html}
                style={{
                  width: "100%",
                  minHeight: 1000,
                  border: "none",
                  display: "block",
                }}
                sandbox=""
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </main>

        {/* ── Confirm dialog ── */}
        <ConfirmDialog
          open={showConfirmDialog}
          onClose={closeConfirmDialog}
          onConfirm={handleConfirm}
          confirming={confirming}
        />
      </div>
    </>
  );
}
