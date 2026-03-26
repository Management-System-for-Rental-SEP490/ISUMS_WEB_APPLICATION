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
    <div className="flex flex-col max-h-[90vh] overflow-y-auto bg-white">
      {/* ── Top bar: back + close ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* ── Avatar + name ── */}
      <div className="px-6 pt-2 pb-5 text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto overflow-hidden">
            {avatarText ? (
              <span className="text-2xl font-bold text-slate-600">{avatarText}</span>
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot}`} />
        </div>

        {staffLoading ? (
          <Skeleton className="h-5 w-36 mx-auto mt-3 mb-1" />
        ) : (
          <h3 className="text-lg font-bold text-slate-800 mt-3 leading-tight">
            {staffName ?? "Nhân viên"}
          </h3>
        )}
        <p className="text-sm text-slate-400 mt-0.5">
          ID: {slot.staffId ? slot.staffId.slice(-8).toUpperCase() : "—"}
        </p>

        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
            {jobTypeLabel(slot.jobType)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="px-5 space-y-3 pb-4">
        {/* Time */}
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Thời gian làm việc
            </p>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {slot.startTimeStr} - {slot.endTimeStr}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateVN(slot.date ?? "")}</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Cơ sở vận hành
              </p>
              {houseLoading ? (
                <Skeleton className="h-4 w-32 mt-1" />
              ) : (
                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {house?.name ?? "—"}
                </p>
              )}
            </div>
          </div>
          {(houseLoading || houseAddress) && (
            <div className="flex items-start gap-2 mt-3 pl-14">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              {houseLoading ? (
                <Skeleton className="h-3 w-48" />
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">{houseAddress}</p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400">Hoàn thành tháng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-sm font-semibold text-slate-400">ca</span></p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400">Đánh giá</p>
            <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-amber-400 text-base">★</span></p>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="px-5 pb-5 space-y-2.5">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition shadow-sm"
        >
          <Phone className="w-4 h-4" />
          Liên hệ
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
        >
          <Clock className="w-4 h-4" />
          Lịch sử ca làm việc
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="pb-5 text-center">
        <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
          Powered by <span className="text-slate-600">ISUMS Property Management</span>
        </p>
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
