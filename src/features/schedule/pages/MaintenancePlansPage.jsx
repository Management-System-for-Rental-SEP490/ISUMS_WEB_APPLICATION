import { useState } from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import MaintenancePlanList from "../components/maintenance/MaintenancePlanList";
import CreatePlanDrawer from "../components/maintenance/CreatePlanDrawer";
import PlanJobsDrawer from "../components/maintenance/PlanJobsDrawer";
import AssignStaffModal from "../components/maintenance/AssignStaffModal";

// Mock data — swap với API sau
const MOCK_PLANS = [
  { id: "p1", name: "Kiểm tra hệ thống điện định kỳ", houseName: "Vinhomes Central Park - Tòa B", type: "ELECTRICAL", cycle: "MONTHLY",   status: "ACTIVE",    nextRunDate: "01/04/2026", jobCount: 3  },
  { id: "p2", name: "Bảo dưỡng đường ống nước",        houseName: "Masteri Thảo Điền",            type: "PLUMBING",   cycle: "QUARTERLY", status: "ACTIVE",    nextRunDate: "15/06/2026", jobCount: 1  },
  { id: "p3", name: "Vệ sinh điều hòa toàn tòa",       houseName: "Saigon Pearl",                 type: "HVAC",       cycle: "YEARLY",    status: "INACTIVE",  nextRunDate: "01/01/2027", jobCount: 2  },
  { id: "p4", name: "Bảo dưỡng chung hàng tuần",       houseName: "The Sun Avenue",               type: "GENERAL",    cycle: "WEEKLY",    status: "ACTIVE",    nextRunDate: "28/03/2026", jobCount: 12 },
  { id: "p5", name: "Kiểm tra PCCC hàng quý",          houseName: "Vinhomes Central Park - Tòa B", type: "GENERAL",   cycle: "QUARTERLY", status: "COMPLETED", nextRunDate: "—",          jobCount: 4  },
];

export default function MaintenancePlansPage() {
  const [plans, setPlans]           = useState(MOCK_PLANS);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedJob,  setSelectedJob]  = useState(null);

  const activeCount = plans.filter((p) => p.status === "ACTIVE").length;

  const stats = [
    { label: "Tổng kế hoạch",  value: plans.length,  color: "text-slate-700" },
    { label: "Đang hoạt động", value: activeCount,    color: "text-green-600" },
    { label: "Thực hiện tháng này", value: 3,         color: "text-teal-600"  },
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
          <button type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition">
            <RefreshCw className="w-4 h-4" />
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
            <p className={`text-2xl font-bold ${s.color}`}>{String(s.value).padStart(2, "0")}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {plans.length === 0 ? (
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
      ) : (
        <MaintenancePlanList
          plans={plans}
          onViewJobs={(plan) => setSelectedPlan(plan)}
          onEdit={(plan) => {
            // TODO: mở drawer chỉnh sửa khi có API
          }}
        />
      )}

      {/* Drawers & Modals */}
      <CreatePlanDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          // TODO: refetch plans khi có API
          setShowCreate(false);
        }}
      />

      <PlanJobsDrawer
        open={!!selectedPlan}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onAssignStaff={(job) => setSelectedJob(job)}
      />

      <AssignStaffModal
        open={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onAssigned={() => {
          setSelectedJob(null);
          // TODO: refetch jobs khi có API
        }}
      />
    </div>
  );
}
