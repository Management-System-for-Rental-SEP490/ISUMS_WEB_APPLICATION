import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { createPortal } from "react-dom";
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

// ─── DayGroupsModal ───────────────────────────────────────────────────────────

/** Lists all time-groups for a day; click one to drill into SlotModal */
function DayGroupsModal({ dateStr, timeGroups, onSelectGroup, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(r); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { setVisible(false); setTimeout(onClose, 180); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 180); };

  // Parse "YYYY-MM-DD" for display
  const [y, mo, d] = dateStr.split("-");
  const label = `${parseInt(d)}/${parseInt(mo)}/${y}`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ backgroundColor: "rgba(30,41,59,0.45)", backdropFilter: "blur(2px)", opacity: visible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-200 ease-out"
        style={{ transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)", opacity: visible ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800 leading-tight">Các khung giờ trong ngày</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Time group rows */}
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {timeGroups.map(({ timeKey, slots }) => {
            const dom = dominantStatus(slots);
            const cfg = statusCfg(dom);
            return (
              <button
                key={timeKey}
                type="button"
                onClick={() => onSelectGroup(timeKey, slots)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-teal-50/40 transition text-left group"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-700 group-hover:text-teal-700 transition">
                    {timeKey} – {addHour(timeKey)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{slots.length} ca làm việc</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
                  {dom === "booked" ? "Đã đặt" : "Đã hủy"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button type="button" onClick={handleClose}
            className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition">
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── MonthView ────────────────────────────────────────────────────────────────

export default function MonthView({ year, month, onPrev, onNext, slotGrid = {}, loading = false }) {
  const today = new Date();
  const cells = getMonthGrid(year, month);

  const [activeModal, setActiveModal] = useState(null);   // SlotModal
  const [dayModal, setDayModal] = useState(null);         // DayGroupsModal
  const [gridVisible, setGridVisible] = useState(true);   // fade transition

  // Fade grid out → call nav → fade back in once new data arrives
  const handlePrev = useCallback(() => { setGridVisible(false); setTimeout(onPrev, 150); }, [onPrev]);
  const handleNext = useCallback(() => { setGridVisible(false); setTimeout(onNext, 150); }, [onNext]);
  useEffect(() => { if (!loading) setGridVisible(true); }, [loading]);

  const openSlotModal = useCallback((dateStr, timeKey, slots) => {
    setDayModal(null);
    setActiveModal({ dateStr, timeSlot: { start: timeKey, end: addHour(timeKey) }, slots });
  }, []);

  const openDayModal = useCallback((dateStr, timeGroups) => {
    setDayModal({ dateStr, timeGroups });
  }, []);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Month navigation ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button type="button" onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
          <button type="button" onClick={handleNext}
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
          <div
            className="grid grid-cols-7 transition-opacity duration-200"
            style={{ opacity: gridVisible ? 1 : 0 }}
          >
            {cells.map((cell, idx) => {
              const isToday  = isSameDay(cell.date, today);
              const count    = cell.currentMonth ? slotCountForDay(slotGrid, cell.date) : 0;
              const dayGrid  = cell.currentMonth ? (slotGrid[isoDate(cell.date)] ?? {}) : {};
              const timeKeys = Object.keys(dayGrid).sort();
              const dateStr  = isoDate(cell.date);

              return (
                <div
                  key={idx}
                  className={[
                    "min-h-[80px] p-1.5 border-r border-b border-slate-100 last:border-r-0",
                    cell.currentMonth ? "" : "bg-slate-50/60",
                  ].join(" ")}
                >
                  {/* Date number */}
                  <div className="flex justify-end mb-1">
                    <span className={[
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday             ? "bg-teal-600 text-white"
                      : cell.currentMonth ? "text-slate-700"
                      : "text-slate-300",
                    ].join(" ")}>
                      {cell.date.getDate()}
                    </span>
                  </div>

                  {/* Time-group chips */}
                  {count > 0 && (
                    <div className="space-y-0.5">
                      {timeKeys.slice(0, 2).map((tk) => {
                        const grpSlots = dayGrid[tk];
                        const grpCfg   = statusCfg(dominantStatus(grpSlots));
                        return (
                          <button
                            key={tk}
                            type="button"
                            onClick={() => openSlotModal(dateStr, tk, grpSlots)}
                            className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight transition hover:opacity-80 ${grpCfg.pill}`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${grpCfg.dot}`} />
                            {tk} · {grpSlots.length} ca
                          </button>
                        );
                      })}

                      {/* "+N khung giờ" → opens DayGroupsModal with ALL time groups */}
                      {timeKeys.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            openDayModal(
                              dateStr,
                              timeKeys.map((tk) => ({ timeKey: tk, slots: dayGrid[tk] })),
                            )
                          }
                          className="w-full text-left text-[10px] font-semibold text-slate-400 px-1 hover:text-teal-600 transition"
                        >
                          +{timeKeys.length - 2} khung giờ khác
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

      {/* ── Day groups modal — lists all time-groups, then drill into SlotModal ── */}
      {dayModal && (
        <DayGroupsModal
          dateStr={dayModal.dateStr}
          timeGroups={dayModal.timeGroups}
          onSelectGroup={(timeKey, slots) => openSlotModal(dayModal.dateStr, timeKey, slots)}
          onClose={() => setDayModal(null)}
        />
      )}

      {/* ── Slot modal ── */}
      {activeModal && (
        <SlotModal
          dateStr={activeModal.dateStr}
          timeSlot={activeModal.timeSlot}
          slots={activeModal.slots}
          onClose={() => setActiveModal(null)}
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
