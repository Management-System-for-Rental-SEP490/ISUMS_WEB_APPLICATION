import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Wrench, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import {
  getMaintenanceJobsByStatus,
  createWorkSlot,
  getWorkTemplate,
} from "../api/schedule.api";
import { buildTimeSlotsFromTemplate, localDateStr } from "../utils/dateHelpers";
import { mapTemplateFromApi } from "../hooks/useSchedule";

const HARDCODED_STAFF_ID = "11111111-1111-1111-1111-111111111111";

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

export default function CreateShiftModal({ open, onClose, onCreated }) {
  const today = new Date();
  const [visible, setVisible] = useState(false);
  const [jobType] = useState("MAINTENANCE"); // ISSUE chưa có API
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(localDateStr(today));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Animate in
  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
  }, [open]);

  // Fetch jobs + template khi mở
  useEffect(() => {
    if (!open) return;
    setSelectedJobId(null);
    setSelectedTimeSlot(null);
    setError(null);

    setJobsLoading(true);
    getMaintenanceJobsByStatus("CREATED")
      .then((data) => setJobs(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));

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

  // Escape key
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
    setTimeout(onClose, 200);
  };

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedTimeSlot || !selectedDate) return;
    setError(null);
    setSubmitting(true);
    try {
      await createWorkSlot({
        staffId: HARDCODED_STAFF_ID,
        jobId: selectedJobId,
        jobType: jobType,
        startTime: `${selectedDate}T${selectedTimeSlot.start}:00`,
      });
      onCreated?.();
      handleClose();
    } catch (e) {
      if (e.status === 500) {
        setError(e.message ?? "Lỗi máy chủ, vui lòng thử lại sau.");
      } else {
        setError(e.message ?? "Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!selectedJobId && !!selectedTimeSlot && !!selectedDate && !submitting;

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{
        backgroundColor: "rgba(30,41,59,0.45)",
        backdropFilter: "blur(3px)",
        opacity: visible ? 1 : 0,
      }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transition-all duration-200 ease-out"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-slate-800 leading-tight">
              Tạo ca làm việc mới
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân công công việc bảo trì cho nhân viên
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Loại công việc */}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2.5">
              Loại công việc
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border bg-slate-800 text-white border-slate-800 text-sm font-semibold">
                <Wrench className="w-3.5 h-3.5" /> Bảo trì
              </div>
              <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-300 text-sm font-semibold cursor-not-allowed select-none">
                <AlertTriangle className="w-3.5 h-3.5" /> Sửa chữa
                <span className="text-[9px] bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-full">
                  Sắp có
                </span>
              </div>
            </div>
          </div>

          {/* Chọn công việc */}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2.5">
              Công việc cần thực hiện
              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                (trạng thái: Chờ xếp lịch)
              </span>
            </p>
            {jobsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Không có công việc nào cần xếp lịch
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {jobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
                        ${isSelected ? "border-teal-400 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-700 truncate">
                          Kỳ: {formatDateVN(job.periodStartDate)} →{" "}
                          {formatDateVN(job.dueDate)}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ngày làm việc */}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2.5">
              Ngày làm việc
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
          </div>

          {/* Khung giờ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-semibold text-slate-700">
                Khung giờ làm việc
              </p>
              {timeSlots.length > 0 && (
                <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                  {timeSlots.length} khung giờ trống
                </span>
              )}
            </div>
            {timeSlots.length === 0 ? (
              <p className="text-xs text-slate-400">Đang tải khung giờ...</p>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Sáng",
                    slots: timeSlots.filter((s) => parseInt(s.start) < 12),
                  },
                  {
                    label: "Chiều",
                    slots: timeSlots.filter((s) => parseInt(s.start) >= 12),
                  },
                ]
                  .filter((g) => g.slots.length > 0)
                  .map(({ label, slots }) => (
                    <div key={label}>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                        {label}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => {
                          const isSelected =
                            selectedTimeSlot?.start === slot.start;
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`flex flex-col items-center py-2.5 rounded-xl border text-center transition
                              ${isSelected ? "border-teal-500 bg-teal-600 text-white shadow-sm" : "border-slate-200 text-slate-600 bg-white hover:border-teal-300 hover:bg-teal-50"}`}
                            >
                              <span
                                className={`text-[11px] font-bold ${isSelected ? "text-white" : "text-teal-600"}`}
                              >
                                {slot.start}
                              </span>
                              <span
                                className={`text-[10px] mt-0.5 ${isSelected ? "text-teal-100" : "text-slate-400"}`}
                              >
                                – {slot.end}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-[2] py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang tạo..." : "Tạo ca làm việc"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
