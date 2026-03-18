import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_NAMES_SHORT, MONTH_NAMES } from "../constants";
import { getMonthGrid, isSameDay, localDateStr } from "../utils/dateHelpers";
import SlotModal from "./SlotModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHIP_STATUS_CFG = {
  booked:    { pill: "bg-teal-100 text-teal-700 border border-teal-200", dot: "bg-teal-500" },
  cancelled: { pill: "bg-red-50  text-red-400  border border-red-200",  dot: "bg-red-400"  },
};

function statusCfg(status) {
  return CHIP_STATUS_CFG[status] ?? CHIP_STATUS_CFG.booked;
}

function dominantStatus(slots) {
  return slots.some((s) => s.status === "booked") ? "booked" : "cancelled";
}

const isoDate = localDateStr;

/** All time-groups for a day: [{ timeKey, slots }] sorted by time */
function timeGroupsForDay(slotGrid, date) {
  const dayGrid = slotGrid[isoDate(date)] ?? {};
  return Object.entries(dayGrid)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timeKey, slots]) => ({ timeKey, slots }));
}

/** Total slot count for a day */
function slotCountForDay(slotGrid, date) {
  const dayGrid = slotGrid[isoDate(date)] ?? {};
  return Object.values(dayGrid).reduce((sum, arr) => sum + arr.length, 0);
}

// ─── MonthView ────────────────────────────────────────────────────────────────

/**
 * MonthView – calendar grid. Clicking a time-group chip opens SlotModal.
 *
 * Props:
 *   year, month   numbers
 *   onPrev, onNext functions
 *   slotGrid      { "YYYY-MM-DD": { "HH:MM": [slot, ...] } }
 *   loading       boolean
 */
export default function MonthView({ year, month, onPrev, onNext, slotGrid = {}, loading = false }) {
  const today = new Date();
  const cells = getMonthGrid(year, month);

  // activeModal: { dateStr, timeSlot: { start, end }, slots }
  const [activeModal, setActiveModal] = useState(null);

  const openModal = useCallback((dateStr, timeKey, slots) => {
    // Derive end time: next slot start or +1 hour
    setActiveModal({
      dateStr,
      timeSlot: { start: timeKey, end: addHour(timeKey) },
      slots,
    });
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Month navigation ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button type="button" onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
          <button type="button" onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Day-of-week headers ── */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {DAY_NAMES_SHORT.map((n) => (
            <div key={n}
              className="py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100 last:border-r-0">
              {n}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        {loading ? (
          <div className="p-6 grid grid-cols-7 gap-1 animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const isToday    = isSameDay(cell.date, today);
              const count      = cell.currentMonth ? slotCountForDay(slotGrid, cell.date) : 0;
              const dayGrid    = cell.currentMonth ? (slotGrid[isoDate(cell.date)] ?? {}) : {};
              const timeKeys   = Object.keys(dayGrid).sort();
              const allSlots   = Object.values(dayGrid).flat();
              const dom        = allSlots.length > 0 ? dominantStatus(allSlots) : null;
              const cfg        = dom ? statusCfg(dom) : null;
              const dateStr    = isoDate(cell.date);

              return (
                <div
                  key={idx}
                  className={[
                    "min-h-[80px] p-1.5 border-r border-b border-slate-100 last:border-r-0 transition",
                    cell.currentMonth ? "" : "bg-slate-50/60",
                  ].join(" ")}
                >
                  {/* Date number */}
                  <div className="flex justify-end mb-1">
                    <span className={[
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday          ? "bg-teal-600 text-white"
                      : cell.currentMonth ? "text-slate-700"
                      : "text-slate-300",
                    ].join(" ")}>
                      {cell.date.getDate()}
                    </span>
                  </div>

                  {/* Time-group chips — each opens its own modal */}
                  {count > 0 && (
                    <div className="space-y-0.5">
                      {timeKeys.slice(0, 2).map((tk) => {
                        const grpSlots = dayGrid[tk];
                        const grpDom   = dominantStatus(grpSlots);
                        const grpCfg   = statusCfg(grpDom);
                        return (
                          <button
                            key={tk}
                            type="button"
                            onClick={() => openModal(dateStr, tk, grpSlots)}
                            className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight transition hover:opacity-80 ${grpCfg.pill}`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${grpCfg.dot}`} />
                            {tk} · {grpSlots.length} ca
                          </button>
                        );
                      })}
                      {timeKeys.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            // Open first overflowed time group
                            const tk = timeKeys[2];
                            openModal(dateStr, tk, dayGrid[tk]);
                          }}
                          className="w-full text-left text-[10px] font-semibold text-slate-400 px-1 hover:text-teal-600 transition"
                        >
                          +{timeKeys.length - 2} khung giờ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Slot modal portal ── */}
      {activeModal && (
        <SlotModal
          dateStr={activeModal.dateStr}
          timeSlot={activeModal.timeSlot}
          slots={activeModal.slots}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/** "HH:MM" → "HH:MM" + 1 hour */
function addHour(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
