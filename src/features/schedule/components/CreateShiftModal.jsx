import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Wrench, AlertTriangle, ChevronDown, Clock } from "lucide-react";
import { DAY_NAMES_LONG, MONTH_NAMES } from "../constants";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STAFF = [
  {
    id: "1",
    name: "Anh Tuấn",
    status: "available",
    statusLabel: "SẴN SÀNG",
    avatar: "AT",
    avatarBg: "bg-slate-600",
  },
  {
    id: "2",
    name: "Minh Hạnh",
    status: "busy",
    statusLabel: "Bận (1h)",
    avatar: "MH",
    avatarBg: "bg-slate-400",
  },
  {
    id: "3",
    name: "Trọng Nghĩa",
    status: "available",
    statusLabel: "Sẵn sàng",
    avatar: "TN",
    avatarBg: "bg-slate-700",
  },
];

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Vinhomes Central Park",
    location: "Lô L4-2201 • Tầng 22",
  },
  { id: "2", name: "The Sun Avenue", location: "Block B • Tầng 10" },
  { id: "3", name: "Masteri Thảo Điền", location: "T1 • Tầng 15" },
];

const MOCK_TIME_SLOTS = [
  "08:00-09:00",
  "09:15-10:15",
  "10:30-11:30",
  "13:00-14:00",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateBadge(date) {
  const d = date instanceof Date ? date : new Date();
  const dayIdx = (d.getDay() + 6) % 7;
  const day = String(d.getDate()).padStart(2, "0");
  return `${DAY_NAMES_LONG[dayIdx]}, ${day} ${MONTH_NAMES[d.getMonth()]}`;
}

// ─── CreateShiftModal ─────────────────────────────────────────────────────────

/**
 * Props:
 *   open      boolean
 *   onClose   () => void
 *   onSubmit  (data) => void   (optional)
 */
export default function CreateShiftModal({ open, onClose, onSubmit }) {
  const [visible, setVisible] = useState(false);

  const [jobType, setJobType] = useState("maintenance"); // "maintenance" | "issue"
  const [selectedStaffId, setSelectedStaffId] = useState("1");
  const [selectedProjectId, setSelectedProjectId] = useState("1");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:15-10:15");
  const [projectOpen, setProjectOpen] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  // Close with animation
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

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

  const handleSubmit = () => {
    const project = MOCK_PROJECTS.find((p) => p.id === selectedProjectId);
    const staff = MOCK_STAFF.find((s) => s.id === selectedStaffId);
    const data = { jobType, staff, project, timeSlot: selectedTimeSlot };
    onSubmit?.(data);
    handleClose();
  };

  if (!open) return null;

  const today = new Date();
  const dateBadge = formatDateBadge(today);
  const selectedProject = MOCK_PROJECTS.find((p) => p.id === selectedProjectId);

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
      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-200 ease-out"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold text-slate-800 leading-tight">
                Tạo ca làm việc mới
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập thông tin điều phối công việc IoT
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">

          {/* Loại công việc */}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2.5">
              Loại công việc
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJobType("maintenance")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition
                  ${
                    jobType === "maintenance"
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Bảo trì
              </button>
              <button
                type="button"
                onClick={() => setJobType("issue")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition
                  ${
                    jobType === "issue"
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Xử lý vấn đề
              </button>
            </div>
          </div>

          {/* Nhân viên thực hiện */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-semibold text-slate-700">
                Nhân viên thực hiện
              </p>
              <button
                type="button"
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide transition"
              >
                XEM TẤT CẢ
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOCK_STAFF.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                const isAvailable = staff.status === "available";
                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-center transition
                      ${
                        isSelected
                          ? "border-teal-400 bg-teal-50/50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${staff.avatarBg}`}
                      >
                        {staff.avatar}
                      </div>
                      {/* Status dot */}
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                          <svg
                            className="w-2 h-2 text-white"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <path
                              d="M1.5 4L3.2 5.7L6.5 2.5"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-700 leading-tight">
                        {staff.name}
                      </p>
                      <p
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isAvailable && isSelected
                            ? "text-teal-600"
                            : isAvailable
                              ? "text-slate-500"
                              : "text-amber-500"
                        }`}
                      >
                        {staff.statusLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dự án & Vị trí */}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2.5">
              Dự án &amp; Vị trí
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 border border-teal-400 bg-white hover:bg-slate-50 transition text-left shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">
                    {selectedProject?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {selectedProject?.location}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${projectOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {projectOpen && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {MOCK_PROJECTS.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setProjectOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50
                        ${project.id === selectedProjectId ? "bg-teal-50" : ""}`}
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {project.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Khung giờ làm việc */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-semibold text-slate-700">
                Khung giờ làm việc
              </p>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {dateBadge}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {MOCK_TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition
                      ${
                        isSelected
                          ? "border-teal-600 text-teal-700 bg-white shadow-sm"
                          : "border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <Clock className="w-3 h-3" />
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
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
            className="flex-[2] py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition shadow-sm"
          >
            Tạo ca làm việc
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
