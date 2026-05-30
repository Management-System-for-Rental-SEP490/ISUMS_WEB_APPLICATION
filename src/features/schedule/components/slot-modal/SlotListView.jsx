import { useTranslation } from "react-i18next";
import { Clock, Briefcase, Plus, User, ChevronRight, X } from "lucide-react";

function initials(str) {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : str.slice(0, 2).toUpperCase();
}

function Skeleton({ className }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />;
}

const SLOT_STATUS_KEY = {
  booked:      { dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border border-teal-200",   key: "schedule.statusBooked" },
  cancelled:   { dot: "bg-red-400",  badge: "bg-red-50 text-red-400 border border-red-200",       key: "schedule.statusCancelled" },
  inprogress:  { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border border-blue-200",    key: "schedule.statusInProgress" },
};

function slotCfg(status) {
  return SLOT_STATUS_KEY[status?.toLowerCase().replace(/_/g, "")] ?? SLOT_STATUS_KEY.booked;
}

const JOB_TYPE_CFG = {
  MAINTENANCE: { key: "schedule.jobMaintenance",  color: "#14b8a6", bar: "bg-teal-500",   ring: "ring-teal-200",   avatarBg: "bg-teal-50",   avatarText: "text-teal-600",   badge: "bg-teal-50 text-teal-700 border-teal-200",     hoverBg: "hover:bg-teal-50/40"   },
  ISSUE:       { key: "schedule.jobIssue",         color: "#f97316", bar: "bg-orange-500", ring: "ring-orange-200", avatarBg: "bg-orange-50", avatarText: "text-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", hoverBg: "hover:bg-orange-50/40" },
  INSPECTION:  { key: "schedule.jobInspection",    color: "#3b82f6", bar: "bg-blue-500",   ring: "ring-blue-200",   avatarBg: "bg-blue-50",   avatarText: "text-blue-600",   badge: "bg-blue-50 text-blue-700 border-blue-200",     hoverBg: "hover:bg-blue-50/40"   },
};

function jobTypeCfg(type) {
  return JOB_TYPE_CFG[type?.toUpperCase()] ?? { key: null, color: "#94a3b8", bar: "bg-slate-400", ring: "ring-slate-200", avatarBg: "bg-slate-50", avatarText: "text-slate-600", badge: "bg-slate-50 text-slate-700 border-slate-200", hoverBg: "hover:bg-slate-50" };
}

export default function SlotListView({ slots, jobDetails, houseDetails, staffDetails, onSelectSlot, onClose, dateFmt, timeSlot }) {
  const { t } = useTranslation("common");
  return (
    <>
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-[18px] h-[18px] text-teal-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 leading-tight">{t("schedule.slotListTitle")}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-bold text-teal-600">{timeSlot.start} - {timeSlot.end}</span>
                <span className="text-slate-300 text-xs">·</span>
                <span className="text-xs text-slate-400">{dateFmt}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {t("schedule.slotCount", { count: slots.length })}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {Object.entries(JOB_TYPE_CFG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: cfg.color }} />
              {t(cfg.key, { defaultValue: key })}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        {slots.map((slot) => {
          const cfg = slotCfg(slot.status);
          const tCfg = jobTypeCfg(slot.jobType);
          const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
          const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
          const house = job?.houseId ? houseDetails[job.houseId] : undefined;
          const staffName = staff?.fullName ?? staff?.name ?? null;
          const displayName = staffName ? staffName : staff === undefined && slot.staffId ? null : t("schedule.defaultStaff");
          const avatarText = staffName ? initials(staffName) : null;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`relative w-full flex items-center gap-3 pl-5 pr-4 py-3.5 ${tCfg.hoverBg} transition text-left group`}
            >
              <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${tCfg.bar}`} />

              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${tCfg.avatarBg} ring-2 ${tCfg.ring} flex items-center justify-center`}>
                  {avatarText ? <span className={`text-sm font-bold ${tCfg.avatarText}`}>{avatarText}</span> : <User className={`w-5 h-5 ${tCfg.avatarText}`} />}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                {displayName === null ? <Skeleton className="h-3.5 w-28 mb-1" /> : (
                  <p className="text-sm font-semibold text-slate-800 truncate transition">{displayName}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${tCfg.badge}`}>
                    {tCfg.key ? t(tCfg.key, { defaultValue: slot.jobType }) : (slot.jobType ?? "—")}
                  </span>
                  {house === undefined && job?.houseId ? <Skeleton className="h-3 w-20 inline-block" /> : house?.name ? <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{house.name}</span> : null}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="text-right">
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {t(cfg.key, { defaultValue: slot.status })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {slot.status === "booked"
                      ? t("schedule.updatedAt", { time: slot.startTimeStr })
                      : t("schedule.startedAt", { time: slot.startTimeStr })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">ISUMS System</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition">
            {t("actions.close")}
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition shadow-sm">
            <Plus className="w-3.5 h-3.5" />{t("schedule.addSlot")}
          </button>
        </div>
      </div>
    </>
  );
}
