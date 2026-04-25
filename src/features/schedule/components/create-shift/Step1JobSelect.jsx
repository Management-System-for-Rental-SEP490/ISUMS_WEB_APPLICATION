import { useTranslation } from "react-i18next";
import { Search, Building2, Clock, CheckCircle2, Check } from "lucide-react";
import { JOB_TYPES, TYPE_COLORS } from "../../constants/shift.constants";

function formatDateVN(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysFromNow(iso, t) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (diff < 0) return t("schedule.overdue");
  if (diff === 0) return t("schedule.today");
  return t("schedule.daysLeft", { count: diff });
}

export default function Step1JobSelect({
  jobType, setJobType,
  jobs, jobsLoading,
  selectedJobId, setSelectedJobId,
  jobSearch, setJobSearch,
  planNames, houseNames,
}) {
  const { t } = useTranslation("common");
  const currentTypeConfig = JOB_TYPES.find((jt) => jt.value === jobType);
  const currentTypeColors = TYPE_COLORS[currentTypeConfig?.color ?? "teal"];

  const filteredJobs = jobs.filter(
    (j) => !jobSearch || (j.title ?? j.note ?? "").toLowerCase().includes(jobSearch.toLowerCase()),
  );

  const getJobTitle = (job) => {
    if (jobType === "MAINTENANCE") return planNames[job.planId] ?? t("schedule.maintenancePeriod", { date: formatDateVN(job.periodStartDate) });
    if (jobType === "INSPECTION") return job.note ?? t("schedule.inspectionAt", { house: houseNames[job.houseId] ?? "" });
    return job.title ?? "—";
  };

  const getJobDesc = (job) => {
    const house = houseNames[job.houseId] ?? job.houseName ?? "";
    if (jobType === "MAINTENANCE") return house ? t("schedule.building", { name: house }) : t("schedule.startDate", { date: formatDateVN(job.periodStartDate) });
    if (jobType === "INSPECTION") return house ? t("schedule.building", { name: house }) : "";
    return house || job.tenantName || "";
  };

  const getJobDeadline = (job) => {
    if (jobType === "MAINTENANCE") return daysFromNow(job.dueDate, t);
    if (jobType === "INSPECTION") return daysFromNow(job.scheduledDate ?? job.createdAt, t);
    return daysFromNow(job.scheduledDate, t);
  };

  return (
    <div className="space-y-6">
      {/* Job type selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">{t("schedule.step1JobType")}</p>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-wider">{t("schedule.required")}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {JOB_TYPES.map((typeItem) => {
            const { value, icon: TypeIcon, color } = typeItem;
            const active = jobType === value;
            const colors = TYPE_COLORS[color];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setJobType(value)}
                className={[
                  "relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all",
                  active ? "border-teal-600 bg-teal-700 shadow-md" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                {active && <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-teal-300" />}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${active ? "bg-white/15" : `bg-${color === "orange" ? "orange" : color === "purple" ? "purple" : "teal"}-50`}`}>
                  <TypeIcon className={`w-5 h-5 ${active ? "text-white" : colors.active.split(" ")[0]}`} />
                </div>
                <p className={`text-sm font-bold mb-1 ${active ? "text-white" : "text-slate-700"}`}>
                  {t(`schedule.job${value.charAt(0) + value.slice(1).toLowerCase()}Label`)}
                </p>
                <p className={`text-[11px] leading-snug ${active ? "text-teal-200" : "text-slate-400"}`}>
                  {t(`schedule.job${value.charAt(0) + value.slice(1).toLowerCase()}Desc`)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Job list */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-1">{t("schedule.step1JobLabel")}</p>
        <p className="text-xs text-slate-400 mb-3">{t("schedule.step1JobDesc")}</p>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-teal-400 transition">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            placeholder={t("schedule.step1SearchPlaceholder")}
            className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
          {jobsLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)
          ) : filteredJobs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">{t("schedule.step1NoJobs")}</p>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const title = getJobTitle(job);
              const desc = getJobDesc(job);
              const deadline = getJobDeadline(job);
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJobId(isSelected ? null : job.id)}
                  className={[
                    "w-full text-left flex items-center gap-0 rounded-xl border transition-all overflow-hidden",
                    isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className={`w-1 self-stretch flex-shrink-0 ${currentTypeColors.bar}`} />
                  <div className="flex-1 min-w-0 px-4 py-3">
                    <p className={`text-sm truncate ${isSelected ? currentTypeColors.active : "text-slate-700 font-medium"}`}>{title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {desc && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{desc}
                        </span>
                      )}
                      {deadline && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 flex-shrink-0">
                    <div className={["w-5 h-5 rounded border-2 flex items-center justify-center transition-all", isSelected ? "border-teal-500 bg-teal-500" : "border-slate-300"].join(" ")}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
