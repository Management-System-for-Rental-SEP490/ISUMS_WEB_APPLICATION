import { useEffect, useState } from "react";
import { Drawer } from "antd";
import { Calendar, Clock, Building2, MapPin, ClipboardList } from "lucide-react";
import { getMaintenancePlanById } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";

const STATUS_CONFIG = {
  SCHEDULED:       { i18nKey: "maintenance.jobDetailStatusScheduled",      bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  CREATED:         { i18nKey: "maintenance.jobDetailStatusCreated",         bg: "bg-slate-50",  text: "text-slate-600",  dot: "bg-slate-400"  },
  NEED_RESCHEDULE: { i18nKey: "maintenance.jobDetailStatusNeedReschedule",  bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  CANCELLED:       { i18nKey: "maintenance.jobDetailStatusCancelled",       bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400"    },
  COMPLETED:       { i18nKey: "maintenance.jobDetailStatusCompleted",       bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-400"  },
  IN_PROGRESS:     { i18nKey: "maintenance.jobDetailStatusInProgress",      bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  OVERDUE:         { i18nKey: "maintenance.jobDetailStatusOverdue",         bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

const FREQ_I18N = {
  WEEKLY:    "maintenance.jobDetailFreqWeekly",
  MONTHLY:   "maintenance.jobDetailFreqMonthly",
  QUARTERLY: "maintenance.jobDetailFreqQuarterly",
  YEARLY:    "maintenance.jobDetailFreqYearly",
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

export default function JobDetailDrawer({ open, job, onClose, t }) {
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

  const stCfg = STATUS_CONFIG[job?.status];
  const st = stCfg
    ? { ...stCfg, label: t(stCfg.i18nKey) }
    : { label: job?.status, bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-300" };

  return (
    <Drawer
      open={open && !!job}
      onClose={onClose}
      width={420}
      destroyOnClose
      title={
        <div>
          <p className="text-xs text-teal-600 font-semibold mb-0.5">{t("maintenance.jobDetailTitle")}</p>
          <h3 className="text-base font-bold text-slate-900">
            {planLoading ? t("maintenance.jobDetailLoading") : (plan?.name ?? t("maintenance.jobDetailDefaultName"))}
          </h3>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Trạng thái */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${st.bg} ${st.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>

        {/* Thông tin công việc */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> {t("maintenance.jobDetailSectionInfo")}
          </p>
          <Row icon={Calendar} label={t("maintenance.jobDetailLabelPeriodStart")} value={formatDate(job?.periodStartDate)} />
          <Row icon={Clock}    label={t("maintenance.jobDetailLabelDueDate")}     value={formatDate(job?.dueDate)} />
        </div>

        {/* Kế hoạch */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> {t("maintenance.jobDetailSectionPlan")}
          </p>
          {planLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />)}</div>
          ) : planError ? (
            <p className="text-xs text-red-500">{planError}</p>
          ) : plan ? (
            <>
              <Row icon={ClipboardList} label={t("maintenance.jobDetailPlanLabelName")}     value={plan.name} />
              <Row icon={Clock}         label={t("maintenance.jobDetailPlanLabelCycle")}     value={`${t(FREQ_I18N[plan.frequencyType] ?? plan.frequencyType, { defaultValue: plan.frequencyType })}${plan.frequencyValue > 1 ? t("maintenance.jobDetailFreqExtra", { value: plan.frequencyValue }) : ""}`} />
              <Row icon={Calendar}      label={t("maintenance.jobDetailPlanLabelEffective")} value={`${formatDate(plan.effectiveFrom)} – ${formatDate(plan.effectiveTo)}`} />
              <Row icon={Calendar}      label={t("maintenance.jobDetailPlanLabelNextRun")}   value={formatDate(plan.nextRunAt)} />
            </>
          ) : (
            <p className="text-xs text-slate-400">{t("maintenance.jobDetailPlanEmpty")}</p>
          )}
        </div>

        {/* Bất động sản */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> {t("maintenance.jobDetailSectionProperty")}
          </p>
          {houseLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
            </div>
          ) : house ? (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">{house.name ?? house.title ?? "—"}</p>
              {(house.address || house.city) && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {[house.address, house.ward, house.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{t("maintenance.jobDetailPropertyEmpty")}</p>
          )}
        </div>
      </div>
    </Drawer>
  );
}
