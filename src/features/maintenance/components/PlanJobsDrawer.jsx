import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "antd";
import { Calendar, CheckCircle2, Clock, Plus, User, XCircle } from "lucide-react";

const MOCK_JOBS = [
  { id: "j1", titleKey: "mockJob1", scheduledDate: "15/01/2026", status: "DONE",        assignedStaff: { name: "Nguyễn Văn A" } },
  { id: "j2", titleKey: "mockJob2", scheduledDate: "15/02/2026", status: "DONE",        assignedStaff: { name: "Trần Văn B"   } },
  { id: "j3", titleKey: "mockJob3", scheduledDate: "15/03/2026", status: "IN_PROGRESS", assignedStaff: { name: "Lê Thị C"     } },
  { id: "j4", titleKey: "mockJob4", scheduledDate: "15/04/2026", status: "SCHEDULED",  assignedStaff: null },
];

const JOB_STATUS_VISUAL = {
  SCHEDULED:   { Icon: Clock,        color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  IN_PROGRESS: { Icon: Clock,        color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  DONE:        { Icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  CANCELLED:   { Icon: XCircle,      color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200"   },
};

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";

export default function PlanJobsDrawer({ open, plan, onClose, onAssignStaff }) {
  const { t } = useTranslation("common");
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob]               = useState({ title: "", scheduledDate: "" });

  const handleCreateJob = () => {
    setShowCreateJob(false);
    setNewJob({ title: "", scheduledDate: "" });
  };

  const statusLabel = (status) =>
    t(`maintenance.jobStatus.${status}`, { defaultValue: status });

  return (
    <Drawer
      open={open && !!plan}
      onClose={onClose}
      width={480}
      destroyOnClose
      title={
        <div>
          <p className="text-xs text-teal-600 font-semibold mb-0.5">{t("maintenance.planJobs.kicker")}</p>
          <h3 className="text-base font-bold text-slate-900 truncate">{plan?.name}</h3>
          {plan?.houseName && <p className="text-xs text-slate-400 mt-0.5 truncate">{plan.houseName}</p>}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{t("maintenance.planJobs.listTitle")}</p>
          <button type="button" onClick={() => setShowCreateJob((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition">
            <Plus className="w-3.5 h-3.5" /> {t("maintenance.planJobs.newJob")}
          </button>
        </div>

        {showCreateJob && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-teal-700">{t("maintenance.planJobs.formTitle")}</p>
            <input value={newJob.title} onChange={(e) => setNewJob((p) => ({ ...p, title: e.target.value }))}
              placeholder={t("maintenance.planJobs.placeholderTitle")} className={inp} />
            <input type="date" value={newJob.scheduledDate} onChange={(e) => setNewJob((p) => ({ ...p, scheduledDate: e.target.value }))}
              className={inp} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreateJob(false)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-white transition">
                {t("maintenance.planJobs.cancel")}
              </button>
              <button type="button" onClick={handleCreateJob}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition">
                {t("maintenance.planJobs.create")}
              </button>
            </div>
          </div>
        )}

        {MOCK_JOBS.map((job) => {
          const st   = JOB_STATUS_VISUAL[job.status] ?? JOB_STATUS_VISUAL.SCHEDULED;
          const Icon = st.Icon;
          const title = t(`maintenance.planJobs.${job.titleKey}`, { defaultValue: "" });
          return (
            <div key={job.id} className={`border rounded-xl p-4 ${st.bg} ${st.border}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />{job.scheduledDate}
                    </span>
                    {job.assignedStaff ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3" />{job.assignedStaff.name}
                      </span>
                    ) : (
                      <button type="button" onClick={() => onAssignStaff(job)}
                        className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition">
                        <User className="w-3 h-3" /> {t("maintenance.planJobs.assignStaff")}
                      </button>
                    )}
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${st.color} flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />{statusLabel(job.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}
