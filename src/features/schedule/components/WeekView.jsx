import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_NAMES_LONG } from "../constants";
import { getWeekDays, isSameDay, localDateStr } from "../utils/dateHelpers";
import SlotModal from "./SlotModal";

// ─── Status configs (chip only) ───────────────────────────────────────────────

const CHIP_STATUS_CFG = {
  booked: {
    badge: "bg-teal-100 text-teal-700 border border-teal-200",
    dot: "bg-teal-500",
  },
  cancelled: {
    badge: "bg-red-50 text-red-400 border border-red-200",
    dot: "bg-red-400",
  },
};

function chipCfg(status) {
  return CHIP_STATUS_CFG[status?.toLowerCase()] ?? CHIP_STATUS_CFG.booked;
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

function dominantStatus(slots) {
  return slots.some((s) => s.status === "booked") ? "booked" : "cancelled";
}

// ─── GroupedSlotChip ──────────────────────────────────────────────────────────

function GroupedSlotChip({ slots, onClick }) {
  const dom = dominantStatus(slots);
  const cfg = chipCfg(dom);
  const bookedCount = slots.filter((s) => s.status === "booked").length;
  const cancelledCount = slots.filter((s) => s.status === "cancelled").length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-md px-2 py-1.5 text-[10px] font-semibold leading-tight transition hover:opacity-80 ${cfg.badge}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
          />
          <span className="truncate">{jobTypeLabel(slots[0]?.jobType)}</span>
        </div>
        <span className="flex-shrink-0 bg-white/60 rounded-full px-1.5 py-0.5 font-bold text-[9px] leading-none">
          {slots.length}
        </span>
      </div>
      {bookedCount > 0 && cancelledCount > 0 && (
        <div className="mt-0.5 text-[9px] opacity-70">
          {bookedCount} đặt · {cancelledCount} hủy
        </div>
      )}
    </button>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

/**
 * WeekView – time-grid calendar layout.
 *
 * Props:
 *   weekBase   {Date}
 *   onPrev     {Function}
 *   onNext     {Function}
 *   slotGrid   { "YYYY-MM-DD": { "HH:MM": [slot, ...] } }
 *   template   { workDays: number[], ... }
 *   timeSlots  [{ start, end, label }, ...]
 *   loading    boolean
 */
export default function WeekView({
  weekBase,
  onPrev,
  onNext,
  slotGrid = {},
  template = { workDays: [0, 1, 2, 3, 4, 5] },
  timeSlots = [],
  loading = false,
}) {
  const today = new Date();
  const weekDays = getWeekDays(weekBase);

  const workingDays = weekDays.map((day, idx) => ({
    day,
    idx,
    isWorkDay: template.workDays.includes(idx),
  }));

  const colCount = workingDays.length;
  const gridCols = `72px repeat(${colCount}, minmax(0, 1fr))`;

  // activeCell: { dateKey, timeSlot: { start, end }, slots }
  const [activeCell, setActiveCell] = useState(null);

  const handleCellClick = useCallback((dateKey, ts, slots) => {
    setActiveCell((prev) =>
      prev?.dateKey === dateKey && prev?.timeSlot.start === ts.start
        ? null
        : { dateKey, timeSlot: ts, slots },
    );
  }, []);

  const handleClose = useCallback(() => setActiveCell(null), []);

  const startFmt = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`;
  const endFmt = `${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ── Week navigation ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            {startFmt} – {endFmt}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
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
              <div className="border-r border-slate-100" />
              {workingDays.map(({ day, idx, isWorkDay }) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={idx}
                    className={`py-3.5 text-center border-r border-slate-100 last:border-r-0 ${
                      isToday ? "bg-teal-50/60" : !isWorkDay ? "bg-slate-50" : ""
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isToday ? "text-teal-500" : !isWorkDay ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {DAY_NAMES_LONG[idx]}
                    </p>
                    <p
                      className={`text-xl font-bold mt-0.5 ${
                        isToday ? "text-teal-600" : !isWorkDay ? "text-slate-300" : "text-slate-800"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    {isToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mx-auto mt-1" />
                    )}
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
              <p className="text-center text-slate-400 text-sm py-8">
                Không có dữ liệu template
              </p>
            ) : (
              timeSlots.map((ts) => (
                <div
                  key={ts.start}
                  className="grid border-b border-slate-50 last:border-b-0"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* Time label */}
                  <div className="border-r border-slate-100 px-2 py-2 flex flex-col items-end justify-start">
                    <span className="text-[10px] font-bold text-slate-500 leading-tight">
                      {ts.start}
                    </span>
                    <span className="text-[9px] text-slate-300 leading-tight">
                      {ts.end}
                    </span>
                  </div>

                  {/* Day cells */}
                  {workingDays.map(({ day, idx, isWorkDay }) => {
                    const isToday = isSameDay(day, today);
                    const dateKey = localDateStr(day);
                    const cellSlots = slotGrid[dateKey]?.[ts.start] ?? [];
                    const isActive =
                      activeCell?.dateKey === dateKey &&
                      activeCell?.timeSlot.start === ts.start;

                    return (
                      <div
                        key={idx}
                        className={`border-r border-slate-100 last:border-r-0 px-1.5 py-1.5 min-h-[52px] transition ${
                          isActive
                            ? "bg-teal-50/40 ring-1 ring-inset ring-teal-200"
                            : isToday
                              ? "bg-teal-50/20"
                              : !isWorkDay
                                ? "bg-slate-50/70"
                                : ""
                        }`}
                      >
                        {cellSlots.length > 0 && (
                          <GroupedSlotChip
                            slots={cellSlots}
                            onClick={() =>
                              handleCellClick(dateKey, ts, cellSlots)
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Slot modal portal ── */}
      {activeCell && (
        <SlotModal
          dateStr={activeCell.dateKey}
          timeSlot={activeCell.timeSlot}
          slots={activeCell.slots}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
