import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import {
  X,
  Wrench,
  Settings,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  Bot,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { confirmStaffWorkSlot, getWorkTemplate } from "../api/schedule.api";
import { getStaffs } from "../../tenants/api/users.api";
import {
  getMaintenanceJobsByStatus,
  getMaintenancePlanById,
  getInspections,
} from "../../maintenance/api/maintenance.api";
import { getAllIssues } from "../../issues/api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { buildTimeSlotsFromTemplate, localDateStr } from "../utils/dateHelpers";
import { mapTemplateFromApi } from "../hooks/useSchedule";


const DEFAULT_TEMPLATE = {
  startTime: "08:00",
  endTime: "17:00",
  breakStart: "12:00",
  breakEnd: "13:00",
  slotDurationMinutes: 60,
  bufferMinutes: 15,
};

function formatDateVN(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysFromNow(iso) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  if (diff < 0) return "Đã quá hạn";
  if (diff === 0) return "Hôm nay";
  return `${diff} ngày tới`;
}

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sz = size === "sm" ? "w-9 h-9 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function CreateShiftModal({ open, onClose, onCreated }) {
  const today = new Date();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [jobType, setJobType] = useState("MAINTENANCE");
  const [jobs, setJobs] = useState([]);
  const [planNames, setPlanNames] = useState({});
  const [houseNames, setHouseNames] = useState({});
  const [jobsLoading, setJobsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(localDateStr(today));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [jobSearch, setJobSearch] = useState("");
  const [staffMode, setStaffMode] = useState("auto");
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelectedJobId(null);
    setError(null);
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
          const uniquePlanIds = [
            ...new Set(list.map((j) => j.planId).filter(Boolean)),
          ];
          const uniqueHouseIds = [
            ...new Set(list.map((j) => j.houseId).filter(Boolean)),
          ];
          const [planResults, houseResults] = await Promise.all([
            Promise.allSettled(
              uniquePlanIds.map((id) => getMaintenancePlanById(id)),
            ),
            Promise.allSettled(uniqueHouseIds.map((id) => getHouseById(id))),
          ]);
          const nameMap = {};
          planResults.forEach((r, i) => {
            if (r.status === "fulfilled")
              nameMap[uniquePlanIds[i]] = r.value?.name;
          });
          setPlanNames(nameMap);
          const houseMap = {};
          houseResults.forEach((r, i) => {
            if (r.status === "fulfilled")
              houseMap[uniqueHouseIds[i]] =
                r.value?.name ?? r.value?.houseName ?? "—";
          });
          setHouseNames(houseMap);
        }
        if (jobType === "INSPECTION") {
          const uniqueHouseIds = [
            ...new Set(list.map((j) => j.houseId).filter(Boolean)),
          ];
          const houseResults = await Promise.allSettled(
            uniqueHouseIds.map((id) => getHouseById(id)),
          );
          const houseMap = {};
          houseResults.forEach((r, i) => {
            if (r.status === "fulfilled")
              houseMap[uniqueHouseIds[i]] =
                r.value?.name ?? r.value?.houseName ?? "—";
          });
          setHouseNames(houseMap);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, [open, jobType]);

  useEffect(() => {
    if (!open) return;
    setStaffMode("auto");
    setSelectedStaffId(null);
    setStaffLoading(true);
    getStaffs()
      .then((data) => setStaffList(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setStaffList([]))
      .finally(() => setStaffLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelectedSlot(null);
    getWorkTemplate(localDateStr(today))
      .then((raw) =>
        setTimeSlots(
          buildTimeSlotsFromTemplate(
            raw ? mapTemplateFromApi(raw) : DEFAULT_TEMPLATE,
          ),
        ),
      )
      .catch(() => setTimeSlots(buildTimeSlotsFromTemplate(DEFAULT_TEMPLATE)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedSlot || !selectedDate) return;

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        jobId: selectedJobId,
        startTime: `${selectedDate}T${selectedSlot.start}:00`,
      };
      if (staffMode === "manual" && selectedStaffId) {
        payload.staffId = selectedStaffId;
      }
      await confirmStaffWorkSlot(payload);
      const jobLabel =
        jobType === "MAINTENANCE"
          ? (planNames[selectedJob?.planId] ??
            `Bảo trì kỳ ${formatDateVN(selectedJob?.periodStartDate)}`)
          : jobType === "INSPECTION"
            ? (selectedJob?.note ?? `Kiểm duyệt — ${houseNames[selectedJob?.houseId] ?? ""}`)
            : (selectedJob?.title ?? "Công việc");
      toast.success(
        `Đã tạo ca làm việc: ${jobLabel} — ${selectedDate} lúc ${selectedSlot.start}`,
      );
      onCreated?.();
      handleClose();
    } catch (e) {
      const errorMsg = e.message?.toLowerCase();

      if (errorMsg?.includes("staff already has job in this time")) {
        setError("Nhân viên đã có lịch trong khung giờ này.");
        toast.error("Trùng lịch: Nhân viên đã có việc lúc này.");
      } else {
        const finalMsg = e.message ?? "Đã xảy ra lỗi, vui lòng thử lại.";
        setError(finalMsg);
        toast.error(finalMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      !jobSearch ||
      (j.title ?? j.note ?? "").toLowerCase().includes(jobSearch.toLowerCase()),
  );
  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const canSubmit =
    !!selectedJobId &&
    !!selectedSlot &&
    !!selectedDate &&
    !submitting &&
    (staffMode === "auto" || !!selectedStaffId);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: 860,
          maxHeight: "92vh",
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 300ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-teal-700 leading-tight">
              Tạo ca làm việc mới
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Thiết lập chi tiết công việc và phân bổ nhân sự
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — 2 columns */}
        <div className="flex flex-1 overflow-hidden border-t border-slate-100">
          {/* ── LEFT PANEL ── */}
          <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col overflow-y-auto px-6 py-5 space-y-6">
            {/* Loại công việc */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Loại công việc
              </p>
              <div className="space-y-2">
                {[
                  { value: "MAINTENANCE", label: "Bảo trì", icon: Wrench },
                  { value: "ISSUE", label: "Sửa chữa", icon: Settings },
                  { value: "INSPECTION", label: "Kiểm duyệt", icon: ClipboardCheck },
                ].map(({ value, label, icon: Icon }) => {
                  const active = jobType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setJobType(value)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        active
                          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thời gian thực hiện */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Thời gian thực hiện
              </p>
              <DatePicker
                className="w-full mb-3"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                value={selectedDate ? dayjs(selectedDate) : null}
                disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
                onChange={(d) =>
                  setSelectedDate(d ? d.format("YYYY-MM-DD") : "")
                }
              />
              {timeSlots.length === 0 ? (
                <p className="text-xs text-slate-400">Đang tải khung giờ...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot) => {
                    const active = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          active
                            ? "bg-teal-600 text-white border-teal-600"
                            : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                        }`}
                      >
                        {slot.start} – {slot.end}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nhân viên */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Phân bổ nhân viên
              </p>
              {/* Mode toggle */}
              <div className="flex gap-2 mb-3">
                {[
                  { value: "auto", label: "Tự động", icon: Bot },
                  { value: "manual", label: "Chọn thủ công", icon: Users },
                ].map(({ value, label, icon: Icon }) => {
                  const active = staffMode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStaffMode(value);
                        setSelectedStaffId(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Auto mode */}
              {staffMode === "auto" && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-dashed border-teal-300 bg-teal-50">
                  <Bot className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-700 leading-relaxed">
                    Hệ thống sẽ tự động phân bổ nhân viên phù hợp dựa trên lịch làm việc và kỹ năng.
                  </p>
                </div>
              )}

              {/* Manual mode */}
              {staffMode === "manual" && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                  {staffLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : staffList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      Không có nhân viên nào
                    </p>
                  ) : (
                    staffList.map((staff) => {
                      const isSelected = selectedStaffId === staff.id;
                      return (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() =>
                            setSelectedStaffId(isSelected ? null : staff.id)
                          }
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-teal-400 bg-teal-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <Avatar name={staff.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {staff.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {staff.phoneNumber ?? staff.email}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 py-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Chọn công việc cần thực hiện
            </p>

            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-teal-400 transition">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên công việc..."
                className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Job list */}
            <div className="flex-1 overflow-y-auto">
              {jobsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 bg-slate-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-slate-400">
                    Không có công việc nào chờ xếp lịch
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredJobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    const isMaintenance = jobType === "MAINTENANCE";
                    const isInspection = jobType === "INSPECTION";
                    const deadline = isMaintenance
                      ? daysFromNow(job.dueDate)
                      : isInspection
                        ? daysFromNow(job.scheduledDate ?? job.createdAt)
                        : daysFromNow(job.scheduledDate);
                    const houseName = isMaintenance || isInspection
                      ? (houseNames[job.houseId] ?? "Đang tải...")
                      : (job.houseName ?? "—");
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() =>
                          setSelectedJobId(isSelected ? null : job.id)
                        }
                        className={`text-left rounded-xl border-2 p-4 transition-all relative ${
                          isSelected
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[60%]">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            {houseName}
                          </span>
                          {isMaintenance ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                              BẢO TRÌ
                            </span>
                          ) : isInspection ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                              KIỂM DUYỆT
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                              SỬA CHỮA
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-sm font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">
                          {isMaintenance
                            ? (planNames[job.planId] ??
                              `Bảo trì kỳ ${formatDateVN(job.periodStartDate)}`)
                            : isInspection
                              ? (job.note || `Kiểm duyệt — ${houseName}`)
                              : job.title}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <p className="text-[11px] text-slate-500 truncate">
                            {isMaintenance
                              ? `Ngày bắt đầu: ${formatDateVN(job.periodStartDate)}`
                              : isInspection
                                ? `Tòa nhà: ${houseName}`
                                : (job.houseName ?? job.tenantName ?? "—")}
                          </p>
                        </div>

                        {/* Deadline */}
                        {deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <p className="text-[11px] text-slate-400">
                              {deadline}
                            </p>
                          </div>
                        )}

                        {/* Radio */}
                        <div
                          className={`absolute bottom-3.5 right-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-teal-500 bg-teal-500"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 text-sm text-slate-500">
            {selectedJob && selectedSlot ? (
              <span>
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block mr-2 mb-0.5" />
                Đã chọn <strong className="text-slate-700">1 công việc</strong>{" "}
                —{" "}
                {staffMode === "auto" ? (
                  <span className="text-teal-600 font-semibold">Hệ thống tự xếp nhân viên</span>
                ) : selectedStaffId ? (
                  <strong className="text-slate-700">
                    {staffList.find((s) => s.id === selectedStaffId)?.name}
                  </strong>
                ) : (
                  <span className="text-amber-500">Chưa chọn nhân viên</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">
                Chọn công việc và khung giờ để tiếp tục
              </span>
            )}
          </div>
          {error && <p className="text-xs text-red-500 flex-1">{error}</p>}
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-7 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang tạo..." : "Tạo ca làm việc"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
