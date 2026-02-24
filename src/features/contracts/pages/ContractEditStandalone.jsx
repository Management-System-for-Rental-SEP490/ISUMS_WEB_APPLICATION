import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContractById, updateContractHtml } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import {
  extractBodyFromHtml,
  wrapBodyWithFullDocument,
} from "../utils/contractHtml.utils";
import ContractHtmlEditor from "../components/ContractHtmlEditor";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  FileEdit: () => (
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  LayoutDashboard: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Save: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  X: () => (
    <svg
      width="15"
      height="15"
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
  Loader: () => (
    <svg
      width="15"
      height="15"
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
      width="13"
      height="13"
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
  Info: () => (
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
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export default function ContractEditStandalone() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [bodyHtml, setBodyHtml] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        const mapped = mapContractFromApi(raw);
        if (mounted) {
          setContract(mapped);
          setBodyHtml(extractBodyFromHtml(mapped.html ?? ""));
        }
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

  const handleSave = async () => {
    if (!contract?.id) {
      setError("Thiếu ID hợp đồng.");
      toast.error("Thiếu ID hợp đồng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content = editorRef.current?.getContent?.() ?? bodyHtml;
      const fullHtml = wrapBodyWithFullDocument(content);
      await updateContractHtml(contract.id, fullHtml);
      toast.success("Chỉnh sửa hợp đồng thành công!");
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      const msg = err?.message ?? "Không thể lưu hợp đồng.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .edit-btn:hover:not(:disabled) { background: #f9fafb !important; }
        .edit-btn-teal:hover:not(:disabled) { background: rgba(13,148,136,0.06) !important; }
        .edit-btn-primary:hover:not(:disabled) {
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
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d97706",
                  flexShrink: 0,
                  border: "1px solid rgba(217,119,6,0.2)",
                }}
              >
                <Icons.FileEdit />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111827",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Chỉnh sửa hợp đồng
                  </h1>
                  {/* Edit mode pill */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(217,119,6,0.1)",
                      color: "#b45309",
                      border: "1px solid rgba(217,119,6,0.25)",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#f59e0b",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    Đang chỉnh sửa
                  </span>
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
              <button
                type="button"
                onClick={() => navigate(`/contracts/${id}`)}
                disabled={saving}
                className="edit-btn-teal"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  background: "transparent",
                  border: "1.5px solid #0d9488",
                  color: "#0f766e",
                  transition: "all 0.15s",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Icons.Eye />
                Xem hợp đồng
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard", { state: { menu: "contracts" } })
                }
                disabled={saving}
                className="edit-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  background: "transparent",
                  border: "1.5px solid #d1d5db",
                  color: "#6b7280",
                  transition: "all 0.15s",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Icons.LayoutDashboard />
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* ── Loading overlay ── */}
        <LoadingOverlay open={saving} label="Đang lưu hợp đồng..." />

        {/* ── Main content ── */}
        <main style={{ padding: "24px 24px 40px" }}>
          {/* Loading skeleton */}
          {loading && (
            <div
              style={{
                maxWidth: 980,
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
                maxWidth: 980,
                margin: "0 auto 16px",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #fecaca",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 2px 8px rgba(239,68,68,0.07)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "rgba(254,226,226,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                }}
              >
                <Icons.AlertTriangle />
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Editor area */}
          {!loading && contract && (
            <div style={{ maxWidth: 980, margin: "0 auto" }}>
              {/* Info banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  marginBottom: 16,
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.05)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  color: "#1d4ed8",
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                <Icons.Info />
                Chỉnh sửa nội dung hợp đồng bên dưới. Nhấn{" "}
                <strong style={{ margin: "0 4px" }}>Lưu thay đổi</strong> để cập
                nhật.
              </div>

              {/* Editor card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #f3f4f6",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#d97706",
                      }}
                    >
                      <Icons.FileEdit />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Nội dung hợp đồng
                    </span>
                  </div>
                  {/* Decorative dots */}
                  <div style={{ display: "flex", gap: 5 }}>
                    {["#f87171", "#fbbf24", "#34d399"].map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: c,
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* TinyMCE editor */}
                <div style={{ padding: "0" }}>
                  <ContractHtmlEditor
                    initialHtml={bodyHtml}
                    onChange={setBodyHtml}
                    onEditorReady={(editor) => {
                      editorRef.current = editor;
                    }}
                  />
                </div>

                {/* Footer actions */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #f3f4f6",
                    background: "#fafafa",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/contracts/${id}`)}
                    disabled={saving}
                    className="edit-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                      background: "#fff",
                      border: "1.5px solid #d1d5db",
                      color: "#6b7280",
                      transition: "all 0.15s",
                      opacity: saving ? 0.55 : 1,
                    }}
                  >
                    <Icons.X />
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="edit-btn-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 20px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                      background:
                        "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(13,148,136,0.28)",
                      transition: "all 0.15s",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? <Icons.Loader /> : <Icons.Save />}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
