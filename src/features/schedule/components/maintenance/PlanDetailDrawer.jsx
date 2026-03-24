import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Calendar, Clock, Building2, MapPin } from "lucide-react";
import { getMaintenancePlanById } from "../../api/schedule.api";
import { getHouseById } from "../../../houses/api/houses.api";

const FREQ_LABELS = {
  WEEKLY:    "Hàng tuần",
  MONTHLY:   "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY:    "Hàng năm",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PlanDetailDrawer({ open, planId, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [houses, setHouses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!open || !planId) return;

    getMaintenancePlanById(planId)
      .then(async (data) => {
        setDetail(data);
        if (Array.isArray(data.houseIds) && data.houseIds.length > 0) {
          const results = await Promise.allSettled(
            data.houseIds.map((id) => getHouseById(id))
          );
          setHouses(
            results
              .filter((r) => r.status === "fulfilled")
              .map((r) => r.value)
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, planId]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-teal-600 font-semibold mb-1">Chi tiết kế hoạch bảo trì</p>
            <h3 className="text-base font-bold text-slate-900 truncate">
              {loading ? "Đang tải..." : (detail?.name ?? "—")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-3 w-full px-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center px-6">
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          </div>
        )}

        {!loading && !error && detail && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Thông tin chu kỳ */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Chu kỳ</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {FREQ_LABELS[detail.frequencyType] ?? detail.frequencyType}
                    {detail.frequencyValue > 1 && ` · mỗi ${detail.frequencyValue} kỳ`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Thời gian hiệu lực</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(detail.effectiveFrom)} – {formatDate(detail.effectiveTo)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Lần chạy tiếp theo</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(detail.nextRunAt)}</p>
                </div>
              </div>
            </div>

            {/* Danh sách bất động sản */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Bất động sản áp dụng
                <span className="ml-auto text-xs font-normal text-slate-400">
                  {(detail.houseIds ?? []).length} nhà
                </span>
              </p>

              {houses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Không có bất động sản nào</p>
              ) : (
                <div className="space-y-2">
                  {houses.map((house) => (
                    <div
                      key={house.id}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {house.name ?? house.title ?? "—"}
                      </p>
                      {(house.address || house.city) && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {[house.address, house.ward, house.city].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
