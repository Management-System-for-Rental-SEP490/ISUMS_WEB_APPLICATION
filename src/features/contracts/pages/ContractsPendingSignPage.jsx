import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../../components/shared/Loading";
import { getAllContracts } from "../api/contracts.api";
import { formatDateVi } from "../utils/contract.format";
import { mapContractFromApi } from "../utils/mapContractFromApi";

const STATUS_CONFIG = {
  READY: {
    label: "Chờ xác nhận",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  CONFIRM_BY_LANDLORD: {
    label: "Chờ ký",
    cls: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function ContractsPendingSignPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getAllContracts();
        const all = (Array.isArray(raw) ? raw : (raw?.data ?? [])).map(mapContractFromApi);
        const pending = all.filter((c) =>
          c.status === "READY" || c.status === "CONFIRM_BY_LANDLORD"
        );
        if (mounted) setContracts(pending);
      } catch (err) {
        const msg = err?.message ?? "Không thể tải danh sách hợp đồng.";
        if (mounted) { setError(msg); toast.error(msg); }
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center text-violet-600 border border-violet-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hợp Đồng Chờ Xử Lý</h2>
            <p className="text-sm text-slate-500">Hợp đồng chờ chủ nhà xác nhận và ký</p>
          </div>
        </div>
        {!loading && contracts.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {contracts.length} hợp đồng cần xử lý
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-12 flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && contracts.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-700">Không có hợp đồng nào cần xử lý</p>
          <p className="text-sm text-slate-400">Tất cả hợp đồng đã được xử lý xong</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && contracts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã hợp đồng</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Khách thuê</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày bắt đầu</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contracts.map((contract) => {
                  const isReady = contract.status === "READY";
                  return (
                    <tr key={contract.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {contract.contractNumber ?? contract.name ?? contract.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{contract.tenant ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {formatDateVi(contract.startDate)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/contracts/${contract.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Xem
                          </button>

                          {/* READY → đến detail để xác nhận */}
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => navigate(`/contracts/${contract.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Xác nhận
                            </button>
                          )}

                          {/* CONFIRM_BY_LANDLORD → ký ngay */}
                          {!isReady && (
                            <button
                              type="button"
                              onClick={() => navigate(`/contracts/${contract.id}/sign`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition shadow-sm"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Ký ngay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
