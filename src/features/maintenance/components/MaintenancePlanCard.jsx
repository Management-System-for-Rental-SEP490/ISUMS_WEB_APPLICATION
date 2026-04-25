import { useTranslation } from "react-i18next";
import { Calendar, Clock, ChevronRight } from "lucide-react";

const TYPE_CONFIG = {
  ELECTRICAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  PLUMBING:   { bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200"  },
  HVAC:       { bg: "bg-teal-50",  text: "text-teal-700",  border: "border-teal-200"  },
  GENERAL:    { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

const STATUS_CONFIG = {
  ACTIVE:    { dot: "bg-green-400",  text: "text-green-700"  },
  INACTIVE:  { dot: "bg-slate-300",  text: "text-slate-500"  },
  CREATED:   { dot: "bg-yellow-400", text: "text-yellow-700" },
  SCHEDULED: { dot: "bg-blue-400",   text: "text-blue-700"   },
  COMPLETED: { dot: "bg-teal-400",   text: "text-teal-700"   },
};

export default function MaintenancePlanCard({ plan, onEdit }) {
  const { t } = useTranslation("common");

  const typeCfg = TYPE_CONFIG[plan.type] ?? TYPE_CONFIG.GENERAL;
  const typeLabel = t(`maintenance.type.${plan.type}`, { defaultValue: t("maintenance.type.GENERAL") });

  const statusCfg = STATUS_CONFIG[plan.status] ?? { dot: "bg-slate-300", text: "text-slate-500" };
  const statusLabel = t(`maintenance.planStatus.${plan.status}`, { defaultValue: plan.status ?? "—" });

  const cycleLabel = t(`maintenance.cycle.${plan.cycle}`, { defaultValue: plan.cycle });

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
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border mb-1.5 ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
          >
            {typeLabel}
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
          <p className="text-[10px] text-slate-400 mb-0.5">{t("maintenance.planCard.cycle")}</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {cycleLabel}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">{t("maintenance.planCard.nextRun")}</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {plan.nextRunDate}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${statusCfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusLabel}
        </span>
      </div>
    </button>
  );
}
