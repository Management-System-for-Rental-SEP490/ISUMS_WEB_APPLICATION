import { useEffect, useState } from "react";
import { RefreshCw, ClipboardList, Eye, Pencil } from "lucide-react";
import { getMaintenanceJobs } from "../api/schedule.api";
import JobDetailDrawer from "../components/maintenance/JobDetailDrawer";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Đã lên lịch",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  CREATED: {
    label: "Chờ xếp lịch làm việc",
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  NEED_RESCHEDULE: {
    label: "Cần lên lịch lại",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MaintenanceJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = () => {
    setLoading(true);
    setError(null);
    getMaintenanceJobs()
      .then((data) => setJobs(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getMaintenanceJobs()
      .then((data) => setJobs(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Công việc bảo trì
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Danh sách toàn bộ công việc bảo trì trong hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng", value: jobs.length, color: "text-slate-700" },
          {
            label: "Chờ xếp lịch làm việc",
            value: statusCounts.CREATED ?? 0,
            color: "text-slate-500",
          },
          {
            label: "Đã lên lịch",
            value: statusCounts.SCHEDULED ?? 0,
            color: "text-blue-600",
          },
          {
            label: "Hoàn thành",
            value: statusCounts.DONE ?? 0,
            color: "text-green-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>
              {loading ? "—" : String(s.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="px-5 py-4 border-b border-slate-100 last:border-0 flex items-center gap-4"
            >
              <div className="w-24 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="w-32 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="flex-1 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={fetchJobs}
            className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600 transition underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">
            Chưa có công việc nào
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1.5fr_1.5fr_2fr_120px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {[
              "STT",
              "Bắt đầu kỳ",
              "Hạn hoàn thành",
              "Trạng thái",
              "Thao tác",
            ].map((h) => (
              <p
                key={h}
                className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {jobs.map((job, index) => {
            const st = STATUS_CONFIG[job.status] ?? {
              label: job.status,
              bg: "bg-slate-50",
              text: "text-slate-600",
              dot: "bg-slate-300",
            };
            return (
              <div
                key={job.id}
                className="grid grid-cols-[48px_1.5fr_1.5fr_2fr_120px] gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition items-center"
              >
                {/* STT */}
                <p className="text-xs font-semibold text-slate-400">
                  {index + 1}
                </p>

                {/* Period start */}
                <p className="text-xs text-slate-600">
                  {formatDate(job.periodStartDate)}
                </p>

                {/* Due date */}
                <p className="text-xs text-slate-600">
                  {formatDate(job.dueDate)}
                </p>

                {/* Status */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${st.bg} ${st.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Sửa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <JobDetailDrawer
        open={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
