import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCw, Sparkles, Wrench } from "lucide-react";
import MaintenancePlanList from "../components/MaintenancePlanList";
import CreatePlanDrawer from "../components/CreatePlanDrawer";
import PlanJobsDrawer from "../components/PlanJobsDrawer";
import PlanDetailDrawer from "../components/PlanDetailDrawer";
import AssignStaffModal from "../components/AssignStaffModal";
import GenerateJobsResultModal from "../components/GenerateJobsResultModal";
import { getMaintenancePlans, generateMaintenanceJobs } from "../api/maintenance.api";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function normalizePlan(raw) {
  return {
    id:            raw.id,
    name:          raw.name ?? raw.planName ?? "—",
    houseName:     raw.houseName ?? raw.house?.name ?? raw.houseId ?? "—",
    type:          raw.type ?? raw.maintenanceType ?? "GENERAL",
    cycle:         raw.frequencyType ?? raw.cycle ?? raw.cycleType ?? raw.frequency ?? "MONTHLY",
    status:        raw.isActive !== undefined
                     ? (raw.isActive ? "ACTIVE" : "INACTIVE")
                     : (raw.status ?? "INACTIVE"),
    nextRunDate:   formatDate(raw.nextRunAt ?? raw.nextRunDate ?? raw.nextScheduleDate),
    effectiveFrom: formatDate(raw.effectiveFrom),
    effectiveTo:   formatDate(raw.effectiveTo),
    jobCount:      raw.jobCount ?? raw.totalJobs ?? 0,
  };
}

export default function MaintenancePlansPage() {
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [generatingJobs, setGeneratingJobs] = useState(false);
  const [generatedJobs, setGeneratedJobs] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedJob,  setSelectedJob]  = useState(null);
  const [detailPlan,   setDetailPlan]   = useState(null);

  const handleGenerateJobs = async () => {
    setGeneratingJobs(true);
    try {
      const jobs = await generateMaintenanceJobs();
      setGeneratedJobs(Array.isArray(jobs) ? jobs : []);
    } catch {
      setGeneratedJobs([]);
    } finally {
      setGeneratingJobs(false);
    }
  };

  const fetchPlans = () => {
    setLoading(true);
    setError(null);
    getMaintenancePlans()
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
        setPlans(raw.map(normalizePlan));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getMaintenancePlans()
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
        setPlans(raw.map(normalizePlan));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = plans.filter((p) => p.status === "ACTIVE").length;

  const stats = [
    { label: "Tổng kế hoạch",      value: loading ? "—" : plans.length, iconBg: "rgba(59,181,130,0.12)",  iconColor: "#3bb582" },
    { label: "Đang hoạt động",     value: loading ? "—" : activeCount,  iconBg: "rgba(59,181,130,0.12)",  iconColor: "#3bb582" },
    { label: "Thực hiện tháng này", value: loading ? "—" : 0,           iconBg: "rgba(32,150,216,0.12)",  iconColor: "#2096d8" },
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
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Kế hoạch bảo trì</h2>
          <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>Quản lý lịch bảo trì định kỳ cho các bất động sản</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={fetchPlans}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={handleGenerateJobs}
            disabled={generatingJobs}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-sm transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, rgba(217,95,75,0.9) 0%, #D95F4B 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Wrench className={`w-4 h-4 ${generatingJobs ? "animate-spin" : ""}`} />
            Tạo công việc bảo trì
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Plus className="w-4 h-4" />
            Tạo kế hoạch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
              <ClipboardList className="w-4 h-4" style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{s.label}</p>
              <p className="text-2xl font-heading font-bold" style={{ color: "#1E2D28" }}>
                {typeof s.value === "number" ? String(s.value).padStart(2, "0") : s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
              <div className="h-3 w-20 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 rounded-xl animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="h-12 rounded-xl animate-pulse" style={{ background: "#EAF4F0" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
          <button
            type="button"
            onClick={fetchPlans}
            className="mt-3 text-xs font-semibold underline transition"
            style={{ color: "#D95F4B" }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && plans.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4F0" }}>
            <ClipboardList className="w-7 h-7" style={{ color: "#3bb582" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Chưa có kế hoạch bảo trì nào</p>
          <p className="text-xs mt-1 mb-5" style={{ color: "#5A7A6E" }}>Tạo kế hoạch đầu tiên để bắt đầu</p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            <Plus className="w-4 h-4" />
            Tạo kế hoạch
          </button>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <MaintenancePlanList
          plans={plans}
          onViewJobs={(plan) => setSelectedPlan(plan)}
          onEdit={(plan) => setDetailPlan(plan)}
        />
      )}

      {/* Drawers & Modals */}
      <GenerateJobsResultModal jobs={generatedJobs} onClose={() => setGeneratedJobs(null)} />
      <CreatePlanDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchPlans(); }}
      />
      <PlanJobsDrawer
        open={!!selectedPlan}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onAssignStaff={(job) => setSelectedJob(job)}
      />
      <PlanDetailDrawer
        key={detailPlan?.id ?? "none"}
        open={!!detailPlan}
        planId={detailPlan?.id}
        onClose={() => setDetailPlan(null)}
      />
      <AssignStaffModal
        open={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onAssigned={() => { setSelectedJob(null); fetchPlans(); }}
      />
    </div>
  );
}
