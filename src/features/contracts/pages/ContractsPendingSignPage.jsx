import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../../components/shared/Loading";
import { getAllContracts } from "../api/contracts.api";
import { formatDateVi } from "../utils/contract.format";
import { mapContractFromApi } from "../utils/mapContractFromApi";

function EmptyState() {
  return (
    <div
      className="rounded-2xl px-8 py-16 flex flex-col items-center gap-3 text-center"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}>
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#3bb582" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-semibold" style={{ color: "#1E2D28" }}>Không có hợp đồng nào chờ ký</p>
      <p className="text-sm" style={{ color: "#5A7A6E" }}>Tất cả hợp đồng đã được xử lý</p>
    </div>
  );
}

function ContractTable({ contracts, onNavigate }) {
  if (contracts.length === 0) return <EmptyState />;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
              <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wide w-12" style={{ color: "#5A7A6E" }}>STT</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Mã hợp đồng</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Khách thuê</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Ngày bắt đầu</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, idx) => (
              <tr
                key={contract.id}
                className="transition"
                style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F0FAF6"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <td className="px-4 py-4 text-center text-xs font-medium" style={{ color: "#5A7A6E" }}>{idx + 1}</td>
                <td className="px-5 py-4">
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#EAF4F0", color: "#1E2D28" }}
                  >
                    {contract.contractNumber ?? contract.name ?? contract.id?.slice(0, 8)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-medium" style={{ color: "#1E2D28" }}>{contract.tenant ?? "—"}</span>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: "#5A7A6E" }}>
                  {formatDateVi(contract.startDate)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/contracts/${contract.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                      style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "transparent" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Xem
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/contracts/${contract.id}/sign`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition shadow-sm"
                      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Ký ngay
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ContractsPendingSignPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getAllContracts({ status: "READY", sorts: "createdAt:DESC", size: 100 });
        const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
        if (mounted) setContracts(arr.map(mapContractFromApi).filter(Boolean));
      } catch (err) {
        const msg = err?.message ?? "Không thể tải danh sách hợp đồng.";
        if (mounted) {
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
<h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Hợp Đồng Chờ Ký</h2>
        </div>
        {!loading && contracts.length > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(245,158,11,0.12)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
            {contracts.length} hợp đồng chờ ký
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="rounded-2xl px-8 py-12 flex flex-col items-center gap-4"
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}
        >
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(217,95,75,0.10)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#D95F4B" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <ContractTable contracts={contracts} onNavigate={navigate} />
      )}
    </div>
  );
}
