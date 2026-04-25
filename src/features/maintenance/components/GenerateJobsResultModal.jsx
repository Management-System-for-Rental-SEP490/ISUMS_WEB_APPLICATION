import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Wrench,
  CalendarClock,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { getHouseById } from "../../houses/api/houses.api";

const STATUS_CLS = {
  CREATED:     "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  DONE:        "bg-green-50 text-green-600",
};

const STATUS_KEY = {
  CREATED:     "maintenance.generateJobs.statusCreated",
  IN_PROGRESS: "maintenance.generateJobs.statusInProgress",
  DONE:        "maintenance.generateJobs.statusDone",
};

const DATE_LOCALE = { vi: "vi-VN", en: "en-GB", ja: "ja-JP" };

function formatDate(iso, locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function EmptyNotice({ onClose }) {
  const { t } = useTranslation("common");
  useEffect(() => {
    const tm = setTimeout(onClose, 2000);
    return () => clearTimeout(tm);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-7 flex flex-col items-center gap-3 max-w-xs w-full">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <CalendarClock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-700 font-semibold text-center">
          {t("maintenance.generateJobs.emptyTitle")}
        </p>
        <p className="text-xs text-slate-400">{t("maintenance.generateJobs.autoClosing")}</p>
      </div>
    </div>
  );
}

export default function GenerateJobsResultModal({ jobs, onClose }) {
  const { t, i18n } = useTranslation("common");
  const dateLocale = DATE_LOCALE[i18n.language] ?? "vi-VN";
  const [houseNames, setHouseNames] = useState({});

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    const uniqueIds = [...new Set(jobs.map((j) => j.houseId).filter(Boolean))];
    uniqueIds.forEach((id) => {
      getHouseById(id)
        .then((h) =>
          setHouseNames((prev) => ({
            ...prev,
            [id]: h?.name ?? h?.houseName ?? "—",
          })),
        )
        .catch(() => setHouseNames((prev) => ({ ...prev, [id]: "—" })));
    });
  }, [jobs]);

  if (!jobs) return null;

  if (jobs.length === 0) return <EmptyNotice onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[15px]">
                {t("maintenance.generateJobs.resultTitle")}
              </h3>
              <p className="text-xs text-slate-400">
                {t("maintenance.generateJobs.resultSubtitle", { count: jobs.length })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {jobs.map((job, idx) => {
            const cls = STATUS_CLS[job.status] ?? "bg-slate-100 text-slate-500";
            const statusText = STATUS_KEY[job.status]
              ? t(STATUS_KEY[job.status])
              : job.status;
            return (
              <div
                key={job.id}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-teal-700">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-slate-700 truncate">
                      {t("maintenance.generateJobs.periodStart", { date: formatDate(job.periodStartDate, dateLocale) })}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("maintenance.generateJobs.dueDate")}{" "}
                    <span className="text-slate-600 font-medium">
                      {formatDate(job.dueDate, dateLocale)}
                    </span>
                  </p>
                  {job.houseId && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      {houseNames[job.houseId] ?? t("maintenance.generateJobs.houseLoading")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {t("maintenance.generateJobs.successCount", { count: jobs.length })}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition"
          >
            {t("maintenance.generateJobs.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
