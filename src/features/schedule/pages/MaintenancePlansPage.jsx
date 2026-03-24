import { useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import MaintenancePlanList from "../components/maintenance/MaintenancePlanList";
import CreatePlanDrawer from "../components/maintenance/CreatePlanDrawer";
import PlanJobsDrawer from "../components/maintenance/PlanJobsDrawer";
import PlanDetailDrawer from "../components/maintenance/PlanDetailDrawer";
import AssignStaffModal from "../components/maintenance/AssignStaffModal";
import { getMaintenancePlans } from "../api/schedule.api";

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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedJob,  setSelectedJob]  = useState(null);
  const [detailPlan,   setDetailPlan]   = useState(null);

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
    { label: "Tổng kế hoạch",       value: loading ? "—" : plans.length, color: "text-slate-700" },
    { label: "Đang hoạt động",       value: loading ? "—" : activeCount,  color: "text-green-600" },
    { label: "Thực hiện tháng này",  value: loading ? "—" : 0,            color: "text-teal-600"  },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kế hoạch bảo trì</h2>
          <p className="text-sm text-slate-400 mt-0.5">Quản lý lịch bảo trì định kỳ cho các bất động sản</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPlans}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
            <Plus className="w-4 h-4" />
            Tạo kế hoạch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>
              {typeof s.value === "number" ? String(s.value).padStart(2, "0") : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button type="button" onClick={fetchPlans}
            className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600 transition underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && plans.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">Chưa có kế hoạch bảo trì nào</p>
          <p className="text-xs text-slate-400 mt-1 mb-5">Tạo kế hoạch đầu tiên để bắt đầu</p>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition">
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
      <CreatePlanDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          fetchPlans();
        }}
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
        onAssigned={() => {
          setSelectedJob(null);
          fetchPlans();
        }}
      />
    </div>
  );
}
