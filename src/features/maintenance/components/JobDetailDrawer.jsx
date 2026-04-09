import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Building2,
  MapPin,
  Hash,
  ClipboardList,
} from "lucide-react";
import { getMaintenancePlanById } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Đã lên lịch",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  CREATED: {
    label: "Mới tạo",
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  NEED_RESCHEDULE: {
    label: "Cần lên lịch lại",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
};

const FREQ_LABELS = {
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY: "Hàng năm",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function JobDetailDrawer({ open, job, onClose }) {
  const [plan, setPlan] = useState(null);
  const [house, setHouse] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [houseLoading, setHouseLoading] = useState(false);
  const [planError, setPlanError] = useState(null);

  useEffect(() => {
    if (!open || !job) return;
    setPlan(null);
    setHouse(null);
    setPlanError(null);

    if (job.planId) {
      setPlanLoading(true);
      getMaintenancePlanById(job.planId)
        .then(setPlan)
        .catch((e) => setPlanError(e.message))
        .finally(() => setPlanLoading(false));
    }

    if (job.houseId) {
      setHouseLoading(true);
      getHouseById(job.houseId)
        .then(setHouse)
        .catch(() => {})
        .finally(() => setHouseLoading(false));
    }
  }, [open, job]);

  if (!open || !job) return null;

  const st = STATUS_CONFIG[job.status] ?? {
    label: job.status,
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-300",
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-teal-600 font-semibold mb-1">
              Chi tiết công việc bảo trì
            </p>
            <h3 className="text-base font-bold text-slate-900">
              {planLoading
                ? "Đang tải..."
                : (plan?.name ?? "Công việc bảo trì")}
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Trạng thái công việc */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${st.bg} ${st.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          {/* Thông tin công việc */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Thông tin công việc
            </p>
            <Row
              icon={Calendar}
              label="Bắt đầu kỳ"
              value={formatDate(job.periodStartDate)}
            />
            <Row
              icon={Clock}
              label="Hạn hoàn thành"
              value={formatDate(job.dueDate)}
            />
          </div>

          {/* Thông tin kế hoạch */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Kế hoạch bảo trì
            </p>
            {planLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-slate-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : planError ? (
              <p className="text-xs text-red-500">{planError}</p>
            ) : plan ? (
              <>
                <Row
                  icon={ClipboardList}
                  label="Tên kế hoạch"
                  value={plan.name}
                />
                <Row
                  icon={Clock}
                  label="Chu kỳ"
                  value={`${FREQ_LABELS[plan.frequencyType] ?? plan.frequencyType}${plan.frequencyValue > 1 ? ` · mỗi ${plan.frequencyValue} kỳ` : ""}`}
                />
                <Row
                  icon={Calendar}
                  label="Thời gian hiệu lực"
                  value={`${formatDate(plan.effectiveFrom)} – ${formatDate(plan.effectiveTo)}`}
                />
                <Row
                  icon={Calendar}
                  label="Lần chạy tiếp theo"
                  value={formatDate(plan.nextRunAt)}
                />
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Không có thông tin kế hoạch
              </p>
            )}
          </div>

          {/* Bất động sản */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Bất động sản
            </p>
            {houseLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
              </div>
            ) : house ? (
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {house.name ?? house.title ?? "—"}
                </p>
                {(house.address || house.city) && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {[house.address, house.ward, house.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Không có thông tin bất động sản
              </p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
