import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ClipboardList, Eye, AlertCircle } from "lucide-react";
import { Pagination } from "antd";
import dayjs from "dayjs";
import { getMaintenanceJobs } from "../api/maintenance.api";
import JobDetailDrawer from "../components/JobDetailDrawer";

const STATUS_CONFIG = {
  CREATED:     { label: "Chờ xếp lịch",   bg: "rgba(90,122,110,0.08)",  color: "#5A7A6E", dot: "#5A7A6E"  },
  SCHEDULED:   { label: "Đã lên lịch",    bg: "rgba(32,150,216,0.10)",  color: "#2096d8", dot: "#2096d8"  },
  IN_PROGRESS: { label: "Đang tiến hành", bg: "rgba(59,181,130,0.10)",  color: "#3bb582", dot: "#3bb582"  },
  COMPLETED:   { label: "Hoàn thành",     bg: "rgba(59,181,130,0.12)",  color: "#3bb582", dot: "#3bb582"  },
  CANCELLED:   { label: "Đã hủy",         bg: "rgba(217,95,75,0.08)",   color: "#D95F4B", dot: "#D95F4B"  },
  OVERDUE:     { label: "Quá hạn",        bg: "rgba(245,158,11,0.12)",  color: "#b45309", dot: "#f59e0b"  },
};

const TABS = [
  { value: "CREATED",     label: "Chờ xếp lịch"   },
  { value: "SCHEDULED",   label: "Đã lên lịch"    },
  { value: "IN_PROGRESS", label: "Đang tiến hành" },
  { value: "COMPLETED",   label: "Hoàn thành"     },
  { value: "CANCELLED",   label: "Đã hủy"         },
  { value: "OVERDUE",     label: "Quá hạn"        },
];

const PAGE_SIZE = 20;

export default function MaintenanceJobsPage() {
  const [jobs, setJobs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [activeTab, setActiveTab] = useState("CREATED");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = useCallback(async (status, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceJobs({ page: pageNum, size: PAGE_SIZE, status });
      setJobs(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      setError(e.message);
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeTab, page);
  }, [fetchJobs, activeTab, page]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setPage(1);
  };

  const handlePageChange = (p) => setPage(p);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
<h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Công việc bảo trì</h2>
        </div>
        <button
          type="button"
          onClick={() => fetchJobs(activeTab, page)}
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

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Tab bar */}
        <div
          className="flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto"
          style={{ borderBottom: "1px solid #C4DED5" }}
        >
          {TABS.map(({ value, label }) => {
            const isActive = activeTab === value;
            const cfg = value ? STATUS_CONFIG[value] : null;
            return (
              <button
                key={String(value)}
                onClick={() => handleTabChange(value)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl whitespace-nowrap transition-all flex-shrink-0 relative"
                style={isActive
                  ? { background: "#ffffff", color: cfg?.color ?? "#1E2D28", borderBottom: "2px solid " + (cfg?.dot ?? "#3bb582"), marginBottom: "-1px", paddingBottom: "calc(0.5rem + 1px)" }
                  : { color: "#5A7A6E", borderBottom: "2px solid transparent", marginBottom: "-1px" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#EAF4F0"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {cfg && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                )}
                {label}
                {isActive && total > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{ background: cfg ? cfg.bg : "rgba(59,181,130,0.10)", color: cfg?.color ?? "#3bb582" }}
                  >
                    {total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-8 h-8" style={{ color: "#D95F4B", opacity: 0.5 }} />
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{error}</p>
            <button onClick={() => fetchJobs(activeTab, page)} className="text-xs underline" style={{ color: "#3bb582" }}>
              Thử lại
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}>
                <div className="w-8 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-40 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="flex-1 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-24 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-16 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <ClipboardList className="w-7 h-7" style={{ color: "#3bb582" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Không có công việc nào</p>
            <p className="text-xs" style={{ color: "#5A7A6E" }}>
              Không có công việc ở trạng thái "{STATUS_CONFIG[activeTab]?.label}"
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && jobs.length > 0 && (
          <>
            {/* Table head */}
            <div
              className="grid grid-cols-[40px_180px_160px_1fr_140px_100px] gap-4 px-5 py-3"
              style={{ background: "#EAF4F0", borderBottom: "1px solid #C4DED5" }}
            >
              {["STT", "Mã công việc", "Ngày bắt đầu kỳ", "Nhân viên phụ trách", "Trạng thái", "Thao tác"].map((h) => (
                <p key={h} className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{h}</p>
              ))}
            </div>

            {/* Rows */}
            {jobs.map((job, idx) => {
              const st = STATUS_CONFIG[job.status] ?? { label: job.status, bg: "#EAF4F0", color: "#5A7A6E", dot: "#5A7A6E" };
              const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
              return (
                <div
                  key={job.id}
                  className="grid grid-cols-[40px_180px_160px_1fr_140px_100px] gap-4 px-5 py-3.5 items-center transition"
                  style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <p className="text-xs font-semibold" style={{ color: "#5A7A6E" }}>{rowNum}</p>

                  <p className="text-xs font-mono font-semibold" style={{ color: "#1E2D28" }}>
                    #{String(job.id).slice(0, 8).toUpperCase()}
                  </p>

                  <p className="text-xs" style={{ color: "#5A7A6E" }}>
                    {job.periodStartDate ? dayjs(job.periodStartDate).format("DD/MM/YYYY") : "—"}
                  </p>

                  <p className="text-xs" style={{ color: job.staffName ? "#1E2D28" : "#C4DED5" }}>
                    {job.staffName ?? "Chưa phân công"}
                  </p>

                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit"
                    style={{ background: st.bg, color: st.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
                    {st.label}
                  </span>

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
                </div>
              );
            })}

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex justify-end px-5 py-3" style={{ borderTop: "1px solid #C4DED5" }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </>
        )}
      </div>

      <JobDetailDrawer open={!!selectedJob} job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
