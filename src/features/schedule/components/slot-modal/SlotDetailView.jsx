import { useTranslation } from "react-i18next";
import { ArrowLeft, X, Clock, Briefcase, MapPin, Phone, Hash, CalendarDays, User } from "lucide-react";

function formatISODate(iso) {
  if (!iso) return "—";
  return iso.substring(0, 10);
}

function initials(str) {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : str.slice(0, 2).toUpperCase();
}

function Skeleton({ className }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />;
}

function InfoRow({ icon: Icon, label, value, loading }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        {loading ? <Skeleton className="h-3.5 w-32" /> : <p className="text-[13px] font-semibold text-slate-700 break-words">{value || "—"}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconBg, children }) {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 ${iconBg ?? "bg-slate-50"} border-b border-slate-100`}>
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 divide-y divide-slate-100">{children}</div>
    </div>
  );
}

const SLOT_STATUS_KEY = {
  booked:     { dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border border-teal-200",  key: "schedule.statusBooked" },
  cancelled:  { dot: "bg-red-400",  badge: "bg-red-50 text-red-400 border border-red-200",      key: "schedule.statusCancelled" },
  inprogress: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border border-blue-200",   key: "schedule.statusInProgress" },
};
function slotCfg(status) { return SLOT_STATUS_KEY[status?.toLowerCase().replace(/_/g, "")] ?? SLOT_STATUS_KEY.booked; }

const ISSUE_STATUS_KEY = {
  WAITING_PAYMENT: { badge: "bg-amber-50 text-amber-700 border border-amber-200",  key: "schedule.issueWaitingPayment" },
  PAID:            { badge: "bg-green-50 text-green-700 border border-green-200",   key: "schedule.issuePaid" },
  PENDING:         { badge: "bg-slate-100 text-slate-600 border border-slate-200",  key: "schedule.issuePending" },
  IN_PROGRESS:     { badge: "bg-blue-50 text-blue-700 border border-blue-200",      key: "schedule.issueInProgress" },
  DONE:            { badge: "bg-green-50 text-green-700 border border-green-200",   key: "schedule.issueDone" },
  CANCELLED:       { badge: "bg-red-50 text-red-400 border border-red-200",         key: "schedule.issueCancelled" },
};
function issueStatusCfg(status) { return ISSUE_STATUS_KEY[status?.toUpperCase()] ?? { badge: "bg-slate-100 text-slate-500 border border-slate-200", key: null }; }

const JOB_TYPE_KEY = { MAINTENANCE: "schedule.jobMaintenance", ISSUE: "schedule.jobIssue", INSPECTION: "schedule.jobInspection" };

const JOB_TYPE_THEME = {
  MAINTENANCE: { heroBg: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)", avatarBg: "bg-teal-50", avatarRing: "ring-teal-100", avatarText: "text-teal-600", chip: "bg-teal-50 text-teal-700 border-teal-200", accent: "text-teal-600" },
  ISSUE:       { heroBg: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)", avatarBg: "bg-orange-50", avatarRing: "ring-orange-100", avatarText: "text-orange-600", chip: "bg-orange-50 text-orange-700 border-orange-200", accent: "text-orange-600" },
  INSPECTION:  { heroBg: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)", avatarBg: "bg-blue-50", avatarRing: "ring-blue-100", avatarText: "text-blue-600", chip: "bg-blue-50 text-blue-700 border-blue-200", accent: "text-blue-600" },
};
function jobTypeTheme(type) {
  return JOB_TYPE_THEME[type?.toUpperCase()] ?? { heroBg: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)", avatarBg: "bg-slate-100", avatarRing: "ring-slate-200", avatarText: "text-slate-600", chip: "bg-slate-100 text-slate-600 border-slate-200", accent: "text-slate-600" };
}

export default function SlotDetailView({ slot, jobDetails, houseDetails, staffDetails, onBack, onClose }) {
  const { t } = useTranslation("common");
  const DAY_NAMES_LONG = [t("schedule.dayMon"), t("schedule.dayTue"), t("schedule.dayWed"), t("schedule.dayThu"), t("schedule.dayFri"), t("schedule.daySat"), t("schedule.daySun")];
  const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => t(`schedule.month${i + 1}`));
  function formatDateVN(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const dayIdx = (d.getDay() + 6) % 7;
    const day = String(d.getDate()).padStart(2, "0");
    return `${DAY_NAMES_LONG[dayIdx]}, ${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }
  const cfg = slotCfg(slot.status);
  const theme = jobTypeTheme(slot.jobType);
  const isIssue = slot.jobType?.toUpperCase() === "ISSUE";
  const isInspection = slot.jobType?.toUpperCase() === "INSPECTION";
  const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
  const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
  const house = job?.houseId ? houseDetails[job.houseId] : undefined;

  const staffLoading = slot.staffId && staff === undefined;
  const houseLoading = job?.houseId && house === undefined;

  const staffName = isIssue ? (job?.staffName ?? null) : (staff?.fullName ?? staff?.name ?? null);
  const avatarText = staffName ? initials(staffName) : null;
  const houseAddress = house ? [house.address, house.ward, house.commune, house.city].filter(Boolean).join(", ") : null;
  const issueStatusBadge = isIssue ? issueStatusCfg(job?.status) : null;
  const jobTypeKey = JOB_TYPE_KEY[slot.jobType?.toUpperCase()];

  return (
    <div className="flex flex-col max-h-[90vh] overflow-y-auto bg-white">
      <div className="relative" style={{ background: theme.heroBg }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <button type="button" onClick={onBack} className="w-8 h-8 rounded-full bg-white/70 hover:bg-white shadow-sm flex items-center justify-center transition">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 hover:bg-white shadow-sm flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-6 pt-2 pb-5 text-center">
          <div className="relative inline-block">
            <div className={`w-20 h-20 rounded-full ${theme.avatarBg} ring-4 ${theme.avatarRing} flex items-center justify-center mx-auto overflow-hidden`}>
              {avatarText ? <span className={`text-2xl font-bold ${theme.avatarText}`}>{avatarText}</span> : <User className={`w-10 h-10 ${theme.avatarText}`} />}
            </div>
            <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot}`} />
          </div>
          {staffLoading ? <Skeleton className="h-5 w-36 mx-auto mt-3 mb-1" /> : (
            <h3 className="text-lg font-bold text-slate-800 mt-3 leading-tight">{staffName ?? t("schedule.defaultStaff")}</h3>
          )}
          <p className="text-xs text-slate-400 mt-0.5">ID: {slot.staffId ? slot.staffId.slice(-8).toUpperCase() : "—"}</p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${theme.chip}`}>
              {jobTypeKey ? t(jobTypeKey, { defaultValue: slot.jobType }) : (slot.jobType ?? "—")}
            </span>
            {isIssue && issueStatusBadge ? (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${issueStatusBadge.badge}`}>
                {issueStatusBadge.key ? t(issueStatusBadge.key) : (job?.status ?? "—")}
              </span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                {t(cfg.key, { defaultValue: slot.status })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3 pb-4">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("schedule.workTime")}</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{slot.startTimeStr} - {slot.endTimeStr}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateVN(slot.date ?? "")}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("schedule.property")}</p>
              {houseLoading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{house?.name ?? "—"}</p>}
            </div>
          </div>
          {(houseLoading || houseAddress) && (
            <div className="flex items-start gap-2 mt-3 pl-14">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              {houseLoading ? <Skeleton className="h-3 w-48" /> : <p className="text-xs text-slate-400 leading-relaxed">{houseAddress}</p>}
            </div>
          )}
        </div>

        {isIssue && (
          <SectionCard title={t("schedule.issueInfo")} icon={Hash} iconBg="bg-orange-50">
            <InfoRow icon={Hash} label={t("schedule.issueTitle")} value={job?.title} loading={!job} />
            <InfoRow icon={Briefcase} label={t("schedule.issueDesc")} value={job?.description} loading={!job} />
            <InfoRow icon={Phone} label={t("schedule.tenantPhone")} value={job?.tenantPhone} loading={!job} />
            <InfoRow icon={User} label={t("schedule.assignedStaff")} value={job?.staffName} loading={!job} />
            <InfoRow icon={Phone} label={t("schedule.staffPhone")} value={job?.staffPhone} loading={!job} />
          </SectionCard>
        )}

        {isInspection && (
          <SectionCard title={t("schedule.inspectionInfo")} icon={Hash} iconBg="bg-purple-50">
            <InfoRow icon={Hash} label={t("schedule.inspectionNote")} value={job?.note} loading={!job} />
            <InfoRow icon={CalendarDays} label={t("schedule.createdAt")} value={job?.createdAt ? formatISODate(job.createdAt) : undefined} loading={!job} />
          </SectionCard>
        )}

        {!isIssue && !isInspection && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400">{t("schedule.monthlyDone")}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-sm font-semibold text-slate-400">{t("schedule.shiftUnit")}</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400">{t("schedule.rating")}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-amber-400 text-base">★</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 space-y-2.5">
        <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition shadow-sm">
          <Phone className="w-4 h-4" />{t("schedule.contact")}
        </button>
        <button type="button" onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition">
          <Clock className="w-4 h-4" />{t("schedule.shiftHistory")}
        </button>
      </div>

      <div className="pb-5 text-center">
        <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
          Powered by <span className="text-slate-600">ISUMS Property Management</span>
        </p>
      </div>
    </div>
  );
}
