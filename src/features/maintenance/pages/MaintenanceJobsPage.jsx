import { useEffect, useState } from "react";
import { RefreshCw, ClipboardList, Eye, Pencil, Sparkles } from "lucide-react";
import { getMaintenanceJobs } from "../api/maintenance.api";
import JobDetailDrawer from "../components/JobDetailDrawer";

const STATUS_CONFIG = {
  SCHEDULED:       { label: "Đã lên lịch",            bg: "rgba(32,150,216,0.10)",  color: "#2096d8",  dot: "#2096d8"  },
  CREATED:         { label: "Chờ xếp lịch làm việc",  bg: "rgba(90,122,110,0.08)", color: "#5A7A6E",  dot: "#5A7A6E"  },
  NEED_RESCHEDULE: { label: "Cần lên lịch lại",        bg: "rgba(217,95,75,0.08)",  color: "#D95F4B",  dot: "#D95F4B"  },
  CANCELLED:       { label: "Đã hủy",                  bg: "rgba(217,95,75,0.10)",  color: "#D95F4B",  dot: "#D95F4B"  },
  COMPLETED:       { label: "Hoàn thành",              bg: "rgba(59,181,130,0.10)", color: "#3bb582",  dot: "#3bb582"  },
  IN_PROGRESS:     { label: "Đang tiến hành",          bg: "rgba(59,181,130,0.10)", color: "#3bb582",  dot: "#3bb582"  },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
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

  const statCards = [
    { label: "Tổng",                  value: jobs.length,               iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582" },
    { label: "Chờ xếp lịch",          value: statusCounts.CREATED ?? 0, iconBg: "rgba(90,122,110,0.08)", iconColor: "#5A7A6E" },
    { label: "Đã lên lịch",           value: statusCounts.SCHEDULED ?? 0, iconBg: "rgba(32,150,216,0.12)", iconColor: "#2096d8" },
    { label: "Hoàn thành",            value: statusCounts.DONE ?? 0,    iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Bảo trì</span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Công việc bảo trì</h2>
        </div>
        <button
          type="button"
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition disabled:opacity-50 mt-1"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
          onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
          onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
              <ClipboardList className="w-4 h-4" style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{s.label}</p>
              <p className="text-xl font-heading font-bold" style={{ color: "#1E2D28" }}>
                {loading ? "—" : String(s.value).padStart(2, "0")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}>
              <div className="w-24 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="w-32 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="flex-1 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="w-20 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
          <button type="button" onClick={fetchJobs} className="mt-3 text-xs font-semibold underline" style={{ color: "#D95F4B" }}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4F0" }}>
            <ClipboardList className="w-7 h-7" style={{ color: "#3bb582" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Chưa có công việc nào</p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          {/* Table header */}
          <div
            className="grid grid-cols-[48px_1.5fr_1.5fr_2fr_120px] gap-4 px-5 py-3"
            style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}
          >
            {["STT", "Bắt đầu kỳ", "Hạn hoàn thành", "Trạng thái", "Thao tác"].map((h) => (
              <p key={h} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {jobs.map((job, index) => {
            const st = STATUS_CONFIG[job.status] ?? { label: job.status, bg: "#EAF4F0", color: "#5A7A6E", dot: "#5A7A6E" };
            return (
              <div
                key={job.id}
                className="grid grid-cols-[48px_1.5fr_1.5fr_2fr_120px] gap-4 px-5 py-3.5 transition items-center"
                style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <p className="text-xs font-semibold" style={{ color: "#5A7A6E" }}>{index + 1}</p>
                <p className="text-xs" style={{ color: "#5A7A6E" }}>{formatDate(job.periodStartDate)}</p>
                <p className="text-xs" style={{ color: "#5A7A6E" }}>{formatDate(job.dueDate)}</p>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                  style={{ background: st.bg, color: st.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                  {st.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition"
                    style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,181,130,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(59,181,130,0.10)"}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition"
                    style={{ background: "#EAF4F0", color: "#5A7A6E" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#C4DED5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#EAF4F0"}
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

      <JobDetailDrawer open={!!selectedJob} job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
