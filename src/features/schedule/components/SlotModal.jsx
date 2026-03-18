import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  User,
  Plus,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  MapPin,
  CalendarDays,
  Hash,
  Phone,
  Mail,
} from "lucide-react";
import { getJobById } from "../api/schedule.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import { DAY_NAMES_LONG, MONTH_NAMES } from "../constants";

// ─── Config / helpers ─────────────────────────────────────────────────────────

const SLOT_STATUS_CFG = {
  booked: {
    dot: "bg-teal-500",
    text: "text-teal-700",
    badge: "bg-teal-50 text-teal-700 border border-teal-200",
    label: "Đã đặt",
  },
  cancelled: {
    dot: "bg-red-400",
    text: "text-red-500",
    badge: "bg-red-50 text-red-400 border border-red-200",
    label: "Đã hủy",
  },
  inprogress: {
    dot: "bg-blue-400",
    text: "text-blue-600",
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    label: "Đang thực hiện",
  },
};
function slotCfg(status) {
  return (
    SLOT_STATUS_CFG[status?.toLowerCase().replace(/_/g, "")] ??
    SLOT_STATUS_CFG.booked
  );
}

const JOB_STATUS_CFG = {
  SCHEDULED: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    label: "Đã lên lịch",
  },
  IN_PROGRESS: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    label: "Đang thực hiện",
  },
  DONE: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    label: "Hoàn thành",
  },
  CANCELLED: {
    badge: "bg-red-50 text-red-400 border border-red-200",
    label: "Đã hủy",
  },
};
function jobStatusCfg(status) {
  return (
    JOB_STATUS_CFG[status?.toUpperCase()] ?? {
      badge: "bg-slate-100 text-slate-500 border border-slate-200",
      label: status ?? "—",
    }
  );
}

const JOB_TYPE_LABELS = {
  MAINTENANCE: "Bảo trì",
  ISSUE: "Sửa chữa",
  INSPECTION: "Kiểm tra",
  CLEANING: "Vệ sinh",
  SUPPORT: "Hỗ trợ",
};
function jobTypeLabel(t) {
  return JOB_TYPE_LABELS[t?.toUpperCase()] ?? t ?? "—";
}

function formatDateVN(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayIdx = (d.getDay() + 6) % 7;
  const day = String(d.getDate()).padStart(2, "0");
  return `${DAY_NAMES_LONG[dayIdx]}, ${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatISODate(iso) {
  if (!iso) return "—";
  return iso.substring(0, 10); // "YYYY-MM-DD"
}

function initials(str) {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : str.slice(0, 2).toUpperCase();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />;
}

// ─── Detail section row ───────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, loading }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-3.5 w-32" />
        ) : (
          <p className="text-[13px] font-semibold text-slate-700 break-words">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, iconBg, children }) {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 ${iconBg ?? "bg-slate-50"} border-b border-slate-100`}
      >
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="px-4 divide-y divide-slate-100">{children}</div>
    </div>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({
  slots,
  jobDetails,
  houseDetails,
  staffDetails,
  onSelectSlot,
  onClose,
  dateFmt,
  timeSlot,
}) {
  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-[18px] h-[18px] text-teal-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
                Danh sách ca làm việc
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-bold text-teal-600">
                  {timeSlot.start} - {timeSlot.end}
                </span>
                <span className="text-slate-300 text-xs">·</span>
                <span className="text-xs text-slate-400">{dateFmt}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subheader */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {slots.length} nhân sự đang trực
        </span>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            Đã đặt
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Đang thực hiện
          </span>
        </div>
      </div>

      {/* Slot rows — each is clickable */}
      <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
        {slots.map((slot) => {
          const cfg = slotCfg(slot.status);
          const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
          const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
          const house = job?.houseId ? houseDetails[job.houseId] : undefined;
          const staffName = staff?.fullName ?? staff?.name ?? null;
          const displayName = staffName
            ? staffName
            : staff === null
              ? `ID: ${slot.staffId?.slice(-8) ?? "—"}`
              : staff === undefined && slot.staffId
                ? null
                : "Nhân viên";
          const avatarText = staffName ? initials(staffName) : null;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-teal-50/40 transition text-left group"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                  {avatarText ? (
                    <span className="text-sm font-bold text-teal-600">
                      {avatarText}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-teal-400" />
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {displayName === null ? (
                  <Skeleton className="h-3.5 w-28 mb-1" />
                ) : (
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700 transition">
                    {displayName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {slot.staffId ? slot.staffId.slice(-8) : "—"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                    {slot.jobType ?? "—"}
                  </span>
                  {house === undefined && job?.houseId ? (
                    <Skeleton className="h-3 w-20 inline-block" />
                  ) : house?.name ? (
                    <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {house.name}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Status + chevron */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {slot.status === "booked"
                      ? `Cập nhật lúc ${slot.startTimeStr}`
                      : `Bắt đầu lúc ${slot.startTimeStr}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            ISUMS System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo thêm ca mới
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DetailView ───────────────────────────────────────────────────────────────

function DetailView({
  slot,
  jobDetails,
  houseDetails,
  staffDetails,
  onBack,
  onClose,
}) {
  const cfg = slotCfg(slot.status);
  const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
  const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
  const house = job?.houseId ? houseDetails[job.houseId] : undefined;

  const staffLoading = slot.staffId && staff === undefined;
  const houseLoading = job?.houseId && house === undefined;

  const staffName = staff?.fullName ?? staff?.name ?? null;
  const avatarText = staffName ? initials(staffName) : null;
  const houseAddress = house
    ? [house.address, house.ward, house.commune, house.city]
        .filter(Boolean)
        .join(", ")
    : null;

  // Status label mapping
  const STATUS_LABELS = {
    booked: "ĐÃ ĐẶT",
    cancelled: "ĐÃ HỦY",
    inprogress: "ĐANG XỬ LÝ",
  };
  const statusKey = slot.status?.toLowerCase().replace(/_/g, "") ?? "booked";
  const statusLabel =
    STATUS_LABELS[statusKey] ?? slot.status?.toUpperCase() ?? "ĐÃ ĐẶT";

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* ── Teal header ── */}
      <div className="relative px-5 pt-5 pb-6 bg-gradient-to-br from-teal-500 to-teal-700">
        {/* Back + Close */}
        <div className="absolute top-3 left-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mt-3">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden">
              {avatarText ? (
                <span className="text-2xl font-bold text-white">
                  {avatarText}
                </span>
              ) : (
                <User className="w-8 h-8 text-white/70" />
              )}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-teal-600 ${cfg.dot}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            {staffLoading ? (
              <>
                <Skeleton className="h-5 w-36 mb-2 bg-white/20" />
                <Skeleton className="h-3.5 w-24 bg-white/20" />
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white leading-tight truncate">
                  {staffName ?? "Nhân viên"}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                    ID: {slot.staffId ? slot.staffId.slice(-8) : "—"}
                  </span>
                  <span className="text-[11px] font-bold text-teal-900 bg-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {slot.jobType ?? "—"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="overflow-y-auto flex-1 bg-slate-50">
        {/* Status banner */}
        <div className="mx-4 mt-4 mb-4 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`}
            />
            <span className={`text-sm font-bold tracking-wide ${cfg.text}`}>
              TRẠNG THÁI: {statusLabel}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {slot.startTimeStr}
          </span>
        </div>

        <div className="px-4 space-y-0 bg-white mx-4 mb-4 rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {/* Work schedule */}
          <div className="flex items-start gap-3 py-4">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Lịch làm việc
              </p>
              <p className="text-[17px] font-bold text-slate-800 leading-tight">
                {slot.startTimeStr} - {slot.endTimeStr}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {formatDateVN(slot.date ?? "")}
              </p>
            </div>
          </div>

          {/* Property location */}
          <div className="flex items-start gap-3 py-4">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Vị trí bất động sản
              </p>
              {houseLoading ? (
                <>
                  <Skeleton className="h-4 w-40 mb-1.5" />
                  <Skeleton className="h-3 w-52" />
                </>
              ) : house ? (
                <>
                  <p className="text-[14px] font-bold text-slate-800 leading-tight">
                    {house.name}
                  </p>
                  {houseAddress && (
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {houseAddress}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-slate-400">—</p>
              )}
            </div>
          </div>

          {/* Task description */}
          {(house?.description || job?.periodStartDate) && (
            <div className="flex items-start gap-3 py-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Mô tả công việc
                </p>
                {house?.description ? (
                  <div className="border-l-2 border-teal-400 pl-3">
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {house.description}
                    </p>
                  </div>
                ) : (
                  <div className="border-l-2 border-teal-400 pl-3">
                    <p className="text-[13px] text-slate-500">
                      {jobTypeLabel(slot.jobType)} · Chu kỳ:{" "}
                      {formatISODate(job?.periodStartDate)} →{" "}
                      {formatISODate(job?.dueDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-sm font-semibold transition"
            >
              <Phone className="w-4 h-4" />
              Liên hệ
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold transition"
            >
              <Clock className="w-4 h-4" />
              Lịch sử ca làm việc
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition shadow-sm"
          >
            <X className="w-4 h-4" />
            Đóng
          </button>
        </div>

        {/* Footer branding */}
        <div className="pb-4 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase ml-1">
            ISUMS · Powered by HCMC IOT
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SlotModal (root) ─────────────────────────────────────────────────────────

/**
 * Shared modal: list view → click row → detail view.
 *
 * Props:
 *   dateStr   "YYYY-MM-DD"
 *   timeSlot  { start, end }
 *   slots     work-slot[]
 *   onClose   () => void
 */
export default function SlotModal({ dateStr, timeSlot, slots, onClose }) {
  const [jobDetails, setJobDetails] = useState({});
  const [houseDetails, setHouseDetails] = useState({});
  const [staffDetails, setStaffDetails] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null); // null = list view

  // ── Animation state ──────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false); // drives enter animation

  // Trigger enter on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animated close: play exit, then unmount
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200); // matches transition duration
  };

  // Escape → if in detail go back, else animated close
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      if (selectedSlot) setSelectedSlot(null);
      else handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot]);

  // Fetch all staff + jobs + houses when modal opens
  useEffect(() => {
    setJobDetails({});
    setHouseDetails({});
    setStaffDetails({});
    setSelectedSlot(null);

    const uniqueStaffIds = [
      ...new Set(slots.map((s) => s.staffId).filter(Boolean)),
    ];
    const uniqueJobIds = [
      ...new Set(slots.map((s) => s.jobId).filter(Boolean)),
    ];

    const fetchStaff = uniqueStaffIds.length
      ? Promise.all(
          uniqueStaffIds.map((id) =>
            getUserById(id)
              .then((d) => ({ id, data: d }))
              .catch(() => ({ id, data: null })),
          ),
        ).then((r) =>
          setStaffDetails(
            Object.fromEntries(r.map(({ id, data }) => [id, data])),
          ),
        )
      : Promise.resolve();

    const fetchJobs = uniqueJobIds.length
      ? Promise.all(
          uniqueJobIds.map((id) =>
            getJobById(id)
              .then((d) => ({ id, data: d }))
              .catch(() => ({ id, data: null })),
          ),
        ).then((jobResults) => {
          setJobDetails(
            Object.fromEntries(jobResults.map(({ id, data }) => [id, data])),
          );
          const uniqueHouseIds = [
            ...new Set(
              jobResults.map(({ data }) => data?.houseId).filter(Boolean),
            ),
          ];
          if (!uniqueHouseIds.length) return;
          return Promise.all(
            uniqueHouseIds.map((houseId) =>
              getHouseById(houseId)
                .then((d) => ({ houseId, data: d }))
                .catch(() => ({ houseId, data: null })),
            ),
          ).then((r) =>
            setHouseDetails(
              Object.fromEntries(r.map(({ houseId, data }) => [houseId, data])),
            ),
          );
        })
      : Promise.resolve();

    Promise.all([fetchStaff, fetchJobs]).catch(() => {});
  }, [slots]);

  const dateFmt = formatDateVN(dateStr);

  return createPortal(
    /* Backdrop — fade in/out */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{
        backgroundColor: "rgba(30,41,59,0.45)",
        backdropFilter: "blur(2px)",
        opacity: visible ? 1 : 0,
      }}
      onClick={() => {
        if (selectedSlot) setSelectedSlot(null);
        else handleClose();
      }}
    >
      {/* Modal card — slide up + scale in/out */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden
                   transition-all duration-200 ease-out"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedSlot ? (
          <DetailView
            slot={selectedSlot}
            jobDetails={jobDetails}
            houseDetails={houseDetails}
            staffDetails={staffDetails}
            onBack={() => setSelectedSlot(null)}
            onClose={handleClose}
          />
        ) : (
          <ListView
            slots={slots}
            jobDetails={jobDetails}
            houseDetails={houseDetails}
            staffDetails={staffDetails}
            onSelectSlot={setSelectedSlot}
            onClose={handleClose}
            dateFmt={dateFmt}
            timeSlot={timeSlot}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
