import { Calendar, Clock, ChevronRight } from "lucide-react";

const TYPE_CONFIG = {
  ELECTRICAL: { i18nKey: "maintenance.typeElectrical", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  PLUMBING:   { i18nKey: "maintenance.typePlumbing",   bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200"  },
  HVAC:       { i18nKey: "maintenance.typeHvac",        bg: "bg-teal-50",  text: "text-teal-700",  border: "border-teal-200"  },
  GENERAL:    { i18nKey: "maintenance.typeGeneral",     bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

const STATUS_CONFIG = {
  ACTIVE:    { i18nKey: "maintenance.statusActive",    dot: "bg-green-400",  text: "text-green-700"  },
  INACTIVE:  { i18nKey: "maintenance.statusInactive",  dot: "bg-slate-300",  text: "text-slate-500"  },
  CREATED:   { i18nKey: "maintenance.statusCreated",   dot: "bg-yellow-400", text: "text-yellow-700" },
  SCHEDULED: { i18nKey: "maintenance.statusScheduled", dot: "bg-blue-400",   text: "text-blue-700"   },
  COMPLETED: { i18nKey: "maintenance.statusCompleted", dot: "bg-teal-400",   text: "text-teal-700"   },
};

const CYCLE_I18N = {
  WEEKLY:    "maintenance.cycleWeekly",
  MONTHLY:   "maintenance.cycleMonthly",
  QUARTERLY: "maintenance.cycleQuarterly",
  YEARLY:    "maintenance.cycleYearly",
};

export default function MaintenancePlanCard({ plan, onEdit, t }) {
  const type   = TYPE_CONFIG[plan.type]     ?? TYPE_CONFIG.GENERAL;
  const status = STATUS_CONFIG[plan.status] ?? { i18nKey: plan.status ?? "—", dot: "bg-slate-300", text: "text-slate-500" };
  const cycle  = CYCLE_I18N[plan.cycle] ? t(CYCLE_I18N[plan.cycle]) : plan.cycle;

  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border mb-1.5 ${type.bg} ${type.text} ${type.border}`}>
            {t(type.i18nKey)}
          </span>
          <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{plan.name}</h4>
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
          <p className="text-[10px] text-slate-400 mb-0.5">{t("maintenance.cardCycleLabel")}</p>
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {cycle}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-0.5">{t("maintenance.cardNextRunLabel")}</p>
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
          {t(status.i18nKey, { defaultValue: status.i18nKey })}
        </span>
      </div>
    </button>
  );
}
