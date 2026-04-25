import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, MapPin, User, X } from "lucide-react";
import { STATUS_CONFIG } from "../constants";
import AddSlotButton from "./AddSlotButton";

export default function SlotDetailPanel({ slot, onClose, onSelectJob }) {
  const { t } = useTranslation("common");
  if (!slot) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-800">{t("schedule.timeSlotLabel", { time: slot.time })}</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">
            {t("schedule.jobCount", { count: slot.jobs.length })}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Job cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slot.jobs.map((job) => {
          const cfg = STATUS_CONFIG[job.status];
          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className={`bg-white rounded-xl border border-l-4 ${cfg.border} border-slate-100 shadow-sm p-3 cursor-pointer hover:shadow-md hover:border-slate-200 transition group`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight ${cfg.badge}`}>
                  {t(`schedule.jobStatus.${job.status}`, { defaultValue: job.status })}
                </span>
                {job.priority === "high" && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug mb-2 group-hover:text-teal-700 transition">
                {job.title}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] truncate">{job.property} – {job.room}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] truncate">{job.assignee ?? t("schedule.unassigned")}</span>
                </div>
              </div>
            </div>
          );
        })}
        <AddSlotButton />
      </div>
    </div>
  );
}
