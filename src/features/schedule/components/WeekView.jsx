import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DAY_NAMES_LONG } from "../constants";
import { getWeekDays, isSameDay } from "../utils/dateHelpers";

/**
 * Status config for work slot chips inside time-grid cells.
 */
const SLOT_STATUS_CFG = {
  booked:    { pill: "bg-teal-100 text-teal-700 border border-teal-200",   dot: "bg-teal-500",  label: "Đã đặt"  },
  cancelled: { pill: "bg-red-50  text-red-400  border border-red-200",    dot: "bg-red-400",   label: "Đã hủy"  },
};

function statusCfg(status) {
  return SLOT_STATUS_CFG[status] ?? SLOT_STATUS_CFG.booked;
}

/** Single chip shown inside a time-grid cell. */
function SlotChip({ slot, onClick }) {
  const cfg = statusCfg(slot.status);
  return (
    <button
      type="button"
      onClick={() => onClick(slot)}
      className={`w-full text-left rounded-md px-1.5 py-1 mb-1 text-[10px] font-semibold leading-tight transition hover:opacity-80 ${cfg.pill}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${cfg.dot}`} />
      {slot.jobType}
    </button>
  );
}

/** Detail panel shown below the grid when a slot chip is clicked. */
function SlotDetailPanel({ slot, onClose }) {
  const cfg = statusCfg(slot.status);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.pill}`}>
            {cfg.label}
          </span>
          <span className="text-sm font-bold text-slate-800">{slot.jobType}</span>
          <span className="text-xs text-slate-400">{slot.startTimeStr} – {slot.endTimeStr}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1.5">
          <Row label="Loại công việc" value={slot.jobType} />
          <Row label="Trạng thái"     value={cfg.label} />
          <Row label="Thời gian"      value={`${slot.startTimeStr} – ${slot.endTimeStr}`} />
          <Row label="Ngày"           value={slot.date} />
        </div>
        <div className="space-y-1.5">
          <Row label="ID Nhân viên" value={slot.staffId} mono />
          <Row label="ID Công việc" value={slot.jobId}   mono />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-slate-400 w-28 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-slate-700 break-all ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

/**
 * WeekView – time-grid calendar layout.
 *
 * Props:
 *   weekBase   {Date}     – any date in the target week
 *   onPrev     {Function}
 *   onNext     {Function}
 *   slotGrid   {Object}   – { "YYYY-MM-DD": { "HH:MM": [slot, ...] } }
 *   template   {Object}   – { workDays: number[], ... }  workDays = indices into weekDays (0=Mon)
 *   timeSlots  {Array}    – [{ start, end, label }, ...]  generated from template
 *   loading    {boolean}
 */
export default function WeekView({
  weekBase,
  onPrev,
  onNext,
  slotGrid  = {},
  template  = { workDays: [0, 1, 2, 3, 4, 5] },
  timeSlots = [],
  loading   = false,
}) {
  const today    = new Date();
  const weekDays = getWeekDays(weekBase);

  // Only show days that belong to the working-day set defined in template
  const workingDays = weekDays
    .map((day, idx) => ({ day, idx }))
    .filter(({ idx }) => template.workDays.includes(idx));

  const colCount  = workingDays.length;
  const gridCols  = `72px repeat(${colCount}, minmax(0, 1fr))`;

  const [activeSlot, setActiveSlot] = useState(null);

  const startFmt = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`;
  const endFmt   = `${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

  const handleChipClick = (slot) => {
    setActiveSlot((prev) => (prev?.id === slot.id ? null : slot));
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Week navigation ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button type="button" onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">{startFmt} – {endFmt}</span>
          <button type="button" onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: `${72 + colCount * 110}px` }}>

            {/* ── Day header row ── */}
            <div
              className="grid border-b border-slate-100"
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* Empty corner above time labels */}
              <div className="border-r border-slate-100" />

              {workingDays.map(({ day, idx }) => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={idx}
                    className={`py-3.5 text-center border-r border-slate-100 last:border-r-0 ${isToday ? "bg-teal-50/60" : ""}`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${isToday ? "text-teal-500" : "text-slate-400"}`}>
                      {DAY_NAMES_LONG[idx]}
                    </p>
                    <p className={`text-xl font-bold mt-0.5 ${isToday ? "text-teal-600" : "text-slate-800"}`}>
                      {day.getDate()}
                    </p>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>

            {/* ── Time-slot rows ── */}
            {loading ? (
              <div className="p-4 space-y-2 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Không có dữ liệu template</p>
            ) : (
              timeSlots.map((ts) => (
                <div
                  key={ts.start}
                  className="grid border-b border-slate-50 last:border-b-0"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* Time label */}
                  <div className="border-r border-slate-100 px-2 py-2 flex flex-col items-end justify-start">
                    <span className="text-[10px] font-bold text-slate-500 leading-tight">{ts.start}</span>
                    <span className="text-[9px] text-slate-300 leading-tight">{ts.end}</span>
                  </div>

                  {/* Day cells */}
                  {workingDays.map(({ day, idx }) => {
                    const isToday  = isSameDay(day, today);
                    const dateKey  = day.toISOString().substring(0, 10);
                    const cellSlots = slotGrid[dateKey]?.[ts.start] ?? [];

                    return (
                      <div key={idx}
                        className={`border-r border-slate-100 last:border-r-0 px-1.5 py-1.5 min-h-[52px] ${
                          isToday ? "bg-teal-50/20" : ""
                        }`}
                      >
                        {cellSlots.map((slot) => (
                          <SlotChip
                            key={slot.id}
                            slot={slot}
                            onClick={handleChipClick}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Slot detail panel ── */}
      {activeSlot && (
        <SlotDetailPanel
          slot={activeSlot}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </div>
  );
}
