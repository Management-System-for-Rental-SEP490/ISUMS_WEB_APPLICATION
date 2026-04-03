import { Calendar, Clock, ChevronRight } from "lucide-react";

const CYCLE_LABELS = {
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY: "Hàng năm",
};

const TYPE_CONFIG = {
  ELECTRICAL: {
    label: "Điện",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PLUMBING: {
    label: "Nước",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  HVAC: {
    label: "Điều hòa/HVAC",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  GENERAL: {
    label: "Chung",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

const STATUS_CONFIG = {
  ACTIVE:    { label: "Đang hoạt động",      dot: "bg-green-400",  text: "text-green-700"  },
  INACTIVE:  { label: "Tạm dừng",            dot: "bg-slate-300",  text: "text-slate-500"  },
  CREATED:   { label: "Đang chờ xếp lịch",  dot: "bg-yellow-400", text: "text-yellow-700" },
  SCHEDULED: { label: "Đã lên lịch",         dot: "bg-blue-400",   text: "text-blue-700"   },
  COMPLETED: { label: "Hoàn thành",          dot: "bg-teal-400",   text: "text-teal-700"   },
};


export default function MaintenancePlanCard({ plan, onEdit }) {
  const type = TYPE_CONFIG[plan.type] ?? TYPE_CONFIG.GENERAL;
  const status = STATUS_CONFIG[plan.status] ?? { label: plan.status ?? "—", dot: "bg-slate-300", text: "text-slate-500" };
  const cycle = CYCLE_LABELS[plan.cycle] ?? plan.cycle;

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border mb-1.5 ${type.bg} ${type.text} ${type.border}`}
          >
            {type.label}
          </span>
          <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
            {plan.name}
          </h4>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
      </div>

      {/* Effective period */}
      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
        {plan.effectiveFrom} – {plan.effectiveTo}
      </p>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Chu kỳ</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {cycle}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Lần tiếp theo</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {plan.nextRunDate}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>
    </button>
  );
}
