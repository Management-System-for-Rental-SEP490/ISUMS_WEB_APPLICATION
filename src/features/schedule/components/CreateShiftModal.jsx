import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import {
  X,
  Wrench,
  Settings,
  Search,
  Building2,
  Clock,
  Users,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Check,
  Bot,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  confirmStaffWorkSlot,
  confirmIssueWorkSlot,
  createManualWorkSlot,
  getAvailableSlotsByJob,
  getAvailableStaffForSlot,
} from "../api/schedule.api";
import { getUserById } from "../../tenants/api/users.api";
import {
  getMaintenanceJobsByStatus,
  getMaintenancePlanById,
  getInspections,
} from "../../maintenance/api/maintenance.api";
import { getAllIssues } from "../../issues/api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { localDateStr } from "../utils/dateHelpers";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDateVN(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysFromNow(iso) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (diff < 0) return "Đã quá hạn";
  if (diff === 0) return "Hôm nay";
  return `${diff} ngày tới`;
}

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  const sz = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${sz} rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Thời gian" },
  { id: 3, label: "Xác nhận" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, idx) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={[
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0",
                done ? "bg-teal-500 text-white" : active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-400",
              ].join(" ")}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${active ? "text-teal-700" : done ? "text-teal-500" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${done ? "bg-teal-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Job type config ───────────────────────────────────────────────────────

const JOB_TYPES = [
  { value: "ISSUE",       label: "Sửa chữa",    desc: "Xử lý sự cố và hư hỏng thiết bị", icon: Settings,     color: "orange" },
  { value: "MAINTENANCE", label: "Bảo trì",      desc: "Kiểm tra định kỳ và nâng cấp",     icon: Wrench,       color: "teal"   },
  { value: "INSPECTION",  label: "Kiểm tra nhà", desc: "Đánh giá hệ thống hạ tầng",        icon: ClipboardCheck, color: "purple" },
];

const TYPE_COLORS = {
  orange: { bar: "bg-orange-400", active: "text-orange-600 font-semibold", badge: "bg-orange-100 text-orange-600" },
  teal:   { bar: "bg-teal-500",   active: "text-teal-700 font-semibold",   badge: "bg-teal-100 text-teal-700"   },
  purple: { bar: "bg-purple-400", active: "text-purple-600 font-semibold", badge: "bg-purple-100 text-purple-600" },
};

// ─── Main Component ────────────────────────────────────────────────────────

export default function CreateShiftModal({ open, onClose, onCreated }) {
  const today = new Date();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1
  const [jobType, setJobType] = useState("MAINTENANCE");
  const [jobs, setJobs] = useState([]);
  const [planNames, setPlanNames] = useState({});
  const [houseNames, setHouseNames] = useState({});
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobSearch, setJobSearch] = useState("");

  // Step 2
  const [selectedDate, setSelectedDate] = useState(localDateStr(today));
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Step 3
  const [staffMode, setStaffMode] = useState("auto");
  const [availableStaff, setAvailableStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ── Animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset khi mở
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setJobType("MAINTENANCE");
    setSelectedJobId(null);
    setSelectedDate(localDateStr(today));
    setTimeSlots([]);
    setSelectedSlot(null);
    setStaffMode("auto");
    setAvailableStaff([]);
    setSelectedStaffId(null);
    setError(null);
    setJobSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Fetch jobs ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSelectedJobId(null);
    setJobSearch("");
    setJobsLoading(true);
    const fetcher =
      jobType === "ISSUE"
        ? getAllIssues({ status: "WAITING_MANAGER_CONFIRM", type: "REPAIR" })
        : jobType === "INSPECTION"
          ? getInspections("CREATED")
          : getMaintenanceJobsByStatus("CREATED");
    fetcher
      .then(async (data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setJobs(list);
        if (jobType === "MAINTENANCE") {
          const planIds = [...new Set(list.map((j) => j.planId).filter(Boolean))];
          const houseIds = [...new Set(list.map((j) => j.houseId).filter(Boolean))];
          const [planRes, houseRes] = await Promise.all([
            Promise.allSettled(planIds.map((id) => getMaintenancePlanById(id))),
            Promise.allSettled(houseIds.map((id) => getHouseById(id))),
          ]);
          const pm = {};
          planRes.forEach((r, i) => { if (r.status === "fulfilled") pm[planIds[i]] = r.value?.name; });
          setPlanNames(pm);
          const hm = {};
          houseRes.forEach((r, i) => { if (r.status === "fulfilled") hm[houseIds[i]] = r.value?.name ?? r.value?.houseName ?? "—"; });
          setHouseNames(hm);
        }
        if (jobType === "INSPECTION") {
          const houseIds = [...new Set(list.map((j) => j.houseId).filter(Boolean))];
          const houseRes = await Promise.allSettled(houseIds.map((id) => getHouseById(id)));
          const hm = {};
          houseRes.forEach((r, i) => { if (r.status === "fulfilled") hm[houseIds[i]] = r.value?.name ?? r.value?.houseName ?? "—"; });
          setHouseNames(hm);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, [open, jobType]);

  // ── Fetch slots khi job + date thay đổi ───────────────────────────────
  useEffect(() => {
    setSelectedSlot(null);
    setTimeSlots([]);
    if (!selectedJobId || !selectedDate) return;
    setSlotsLoading(true);
    getAvailableSlotsByJob(selectedJobId, selectedDate)
      .then((slots) => setTimeSlots(slots.map((s) => ({
        start: s.startTime.substring(0, 5),
        end: s.endTime.substring(0, 5),
        startRaw: s.startTime,
        status: s.status,
        availableStaffCount: s.availableStaffCount ?? 0,
      }))))
      .catch(() => setTimeSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedJobId, selectedDate]);

  // ── Fetch staff khi vào step 3 ─────────────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !selectedJobId || !selectedDate || !selectedSlot) return;
    setAvailableStaff([]);
    setSelectedStaffId(null);
    setStaffLoading(true);
    getAvailableStaffForSlot(selectedJobId, selectedDate, selectedSlot.startRaw)
      .then(async (ids) => {
        const results = await Promise.allSettled(ids.map((id) => getUserById(id)));
        setAvailableStaff(results.filter((r) => r.status === "fulfilled").map((r) => r.value));
      })
      .catch(() => setAvailableStaff([]))
      .finally(() => setStaffLoading(false));
  }, [step, selectedJobId, selectedDate, selectedSlot]);

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedSlot || !selectedDate) return;
    setError(null);
    setSubmitting(true);
    try {
      const startTime = `${selectedDate}T${selectedSlot.start}:00`;

      if (staffMode === "manual") {
        // Tất cả loại công việc — chọn thủ công
        await createManualWorkSlot({
          jobId: selectedJobId,
          staffId: selectedStaffId,
          startTime,
          jobType,
        });
      } else if (jobType === "MAINTENANCE" || jobType === "INSPECTION") {
        // Tự động — bảo trì & kiểm tra
        await confirmStaffWorkSlot({ jobId: selectedJobId, startTime });
      } else {
        // Tự động — sửa chữa (ISSUE)
        await confirmIssueWorkSlot(selectedJobId);
      }

      toast.success(`Đã tạo ca làm việc — ${selectedDate} lúc ${selectedSlot.start}`);
      onCreated?.();
      handleClose();
    } catch (e) {
      const msg = e.message?.toLowerCase();
      const finalMsg = msg?.includes("staff already has job in this time")
        ? "Nhân viên đã có lịch trong khung giờ này."
        : (e.message ?? "Đã xảy ra lỗi, vui lòng thử lại.");
      setError(finalMsg);
      toast.error(finalMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const currentTypeConfig = JOB_TYPES.find((t) => t.value === jobType);
  const currentTypeColors = TYPE_COLORS[currentTypeConfig?.color ?? "teal"];

  const filteredJobs = jobs.filter(
    (j) => !jobSearch || (j.title ?? j.note ?? "").toLowerCase().includes(jobSearch.toLowerCase()),
  );

  const getJobTitle = (job) => {
    if (jobType === "MAINTENANCE") return planNames[job.planId] ?? `Bảo trì kỳ ${formatDateVN(job.periodStartDate)}`;
    if (jobType === "INSPECTION") return job.note ?? `Kiểm tra — ${houseNames[job.houseId] ?? ""}`;
    return job.title ?? "—";
  };

  const getJobDesc = (job) => {
    const house = houseNames[job.houseId] ?? job.houseName ?? "";
    if (jobType === "MAINTENANCE") return house ? `Tòa nhà: ${house}` : `Bắt đầu: ${formatDateVN(job.periodStartDate)}`;
    if (jobType === "INSPECTION") return house ? `Tòa nhà: ${house}` : "";
    return house || job.tenantName || "";
  };

  const getJobDeadline = (job) => {
    if (jobType === "MAINTENANCE") return daysFromNow(job.dueDate);
    if (jobType === "INSPECTION") return daysFromNow(job.scheduledDate ?? job.createdAt);
    return daysFromNow(job.scheduledDate);
  };

  const canGoStep2 = !!selectedJobId;
  const canGoStep3 = !!selectedSlot;
  const canSubmit = !submitting && (staffMode === "auto" || !!selectedStaffId);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{
          maxWidth: 700,
          maxHeight: "92vh",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Tạo Ca Làm Mới</h3>
              <p className="text-xs text-slate-400 mt-0.5">Vui lòng hoàn tất thông tin để điều phối nhân sự</p>
            </div>
            <button type="button" onClick={handleClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <StepIndicator current={step} />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5">

          {/* ══ STEP 1: Loại công việc + job list ══ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Job type selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">Loại dịch vụ</p>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-wider">BẮT BUỘC</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {JOB_TYPES.map((typeItem) => {
                    const { value, label, desc, icon: TypeIcon, color } = typeItem;
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
                        <p className={`text-sm font-bold mb-1 ${active ? "text-white" : "text-slate-700"}`}>{label}</p>
                        <p className={`text-[11px] leading-snug ${active ? "text-teal-200" : "text-slate-400"}`}>{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Job list */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Nhiệm vụ cụ thể</p>
                <p className="text-xs text-slate-400 mb-3">Chọn một nhiệm vụ cần thực hiện trong ca làm.</p>

                {/* Search */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-teal-400 transition">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder={`Tìm kiếm nhiệm vụ (vd: ${jobType === "MAINTENANCE" ? "Bảo trì tháng..." : jobType === "ISSUE" ? "Sửa chữa điện..." : "Kiểm tra tòa..."})`}
                    className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {jobsLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)
                  ) : filteredJobs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">Không có công việc nào chờ xếp lịch</p>
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
                            isSelected
                              ? "border-teal-400 bg-teal-50"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {/* Color bar */}
                          <div className={`w-1 self-stretch flex-shrink-0 ${currentTypeColors.bar}`} />

                          {/* Content */}
                          <div className="flex-1 min-w-0 px-4 py-3">
                            <p className={`text-sm truncate ${isSelected ? currentTypeColors.active : "text-slate-700 font-medium"}`}>
                              {title}
                            </p>
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

                          {/* Checkbox */}
                          <div className="px-4 flex-shrink-0">
                            <div className={[
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              isSelected ? "border-teal-500 bg-teal-500" : "border-slate-300",
                            ].join(" ")}>
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
          )}

          {/* ══ STEP 2: Thời gian ══ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Chọn ngày thực hiện</p>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  size="large"
                  value={selectedDate ? dayjs(selectedDate) : null}
                  disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
                  onChange={(d) => setSelectedDate(d ? d.format("YYYY-MM-DD") : "")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">Khung giờ làm việc</p>
                  {selectedSlot && (
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                      Đã chọn: {selectedSlot.start} – {selectedSlot.end}
                    </span>
                  )}
                </div>

                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Không có khung giờ khả dụng cho ngày này.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot, idx) => {
                      const active = selectedSlot?.start === slot.start;
                      const unavailable = slot.status !== "AVAILABLE";
                      const labels = ["Ca Sáng 1","Ca Sáng 2","Ca Sáng 3","Ca Chiều 1","Ca Chiều 2","Ca Chiều 3","Ca Tối 1","Ca Tối 2","Ca Tối 3"];
                      return (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={unavailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={[
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                            unavailable
                              ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                              : active
                                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                                : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50",
                          ].join(" ")}
                        >
                          <span className={`text-[10px] font-semibold mb-1 ${active ? "text-teal-100" : unavailable ? "text-slate-300" : "text-slate-400"}`}>
                            {labels[idx] ?? `Ca ${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold">{slot.start} – {slot.end}</span>
                          {!unavailable && (
                            <span className={`flex items-center gap-1 text-[10px] mt-1 ${active ? "text-teal-100" : "text-slate-400"}`}>
                              <Users className="w-3 h-3" />{slot.availableStaffCount} rảnh
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                  <p className="text-xs text-teal-700 leading-relaxed">
                    Đã chọn <strong>{selectedSlot.start} – {selectedSlot.end}</strong> ngày <strong>{formatDateVN(selectedDate)}</strong>.
                    Có <strong>{selectedSlot.availableStaffCount} nhân viên</strong> sẵn sàng trong khung giờ này.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 3: Nhân sự ══ */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Mode toggle */}
              <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 bg-white">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Chế độ phân công</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {staffMode === "auto" ? "Hệ thống sẽ tự động chọn nhân sự tối ưu nhất" : "Bạn tự chọn nhân viên thực hiện"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setStaffMode((m) => m === "auto" ? "manual" : "auto"); setSelectedStaffId(null); }}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${staffMode === "auto" ? "bg-teal-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${staffMode === "auto" ? "left-7" : "left-1"}`} />
                </button>
              </div>

              {/* Staff list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">Kỹ thuật viên khả dụng</p>
                  {!staffLoading && availableStaff.length > 0 && (
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                      {availableStaff.length} Đang rảnh
                    </span>
                  )}
                </div>

                {staffLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : availableStaff.length === 0 ? (
                  <div className="flex items-center gap-2.5 px-4 py-4 rounded-xl border border-slate-200 bg-slate-50">
                    <Bot className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-500">
                      {staffMode === "auto" ? "Hệ thống sẽ tự động phân công nhân viên phù hợp." : "Không có nhân viên nào rảnh trong khung giờ này."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                    {availableStaff.map((staff) => {
                      const isSelected = selectedStaffId === staff.id;
                      return (
                        <div
                          key={staff.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white"}`}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar name={staff.name} size="sm" />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{staff.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {staff.roles?.[0] && (
                                <span className="text-[11px] text-slate-500">{staff.roles[0].replace(/_/g, " ")}</span>
                              )}
                              {staff.phoneNumber && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                  <Phone className="w-3 h-3" />{staff.phoneNumber}
                                </span>
                              )}
                              <span className="text-[11px] text-green-600 font-medium">• Đang rảnh</span>
                            </div>
                          </div>
                          {staffMode === "manual" && (
                            <button
                              type="button"
                              onClick={() => setSelectedStaffId(isSelected ? null : staff.id)}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                isSelected ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-500"
                              }`}
                            >
                              {isSelected ? <Check className="w-4 h-4" /> : <span className="text-lg leading-none">+</span>}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info box */}
              {(staffMode === "auto" || selectedStaffId) && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">i</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {staffMode === "auto"
                      ? "Hệ thống sẽ tự động phân công nhân sự tối ưu. Thông báo sẽ được gửi ngay khi ca làm việc được khởi tạo thành công."
                      : "Bạn đã chọn 1 nhân sự. Hệ thống sẽ gửi thông báo ngay khi ca làm việc được khởi tạo thành công."}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            {step > 1 && <ChevronLeft className="w-4 h-4" />}
            {step === 1 ? "Hủy bỏ" : "Quay lại"}
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 ? !canGoStep2 : !canGoStep3}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang tạo..." : <><CheckCircle2 className="w-4 h-4" /> Hoàn tất tạo ca làm việc</>}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
