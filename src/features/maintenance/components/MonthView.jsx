import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, MapPin, User, X } from "lucide-react";
import { DAY_NAMES_SHORT, MONTH_NAMES, STATUS_CONFIG } from "../constants";
import { dateKey, getMonthGrid, isSameDay, slotStatusConfig } from "../utils/dateHelpers";
import JobDetailModal from "./JobDetailModal";
import AddSlotButton from "./AddSlotButton";

/**
 * @param {{ year, month, onPrev, onNext, monthEvMap, loading }}
 *   monthEvMap — { "year-month-day": [slot] } provided by useMonthSchedule hook
 *   loading    — boolean
 */
export default function MonthView({ year, month, onPrev, onNext, monthEvMap = {}, loading = false }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeSlot,  setActiveSlot]  = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const today = new Date();
  const cells = getMonthGrid(year, month);

  const selectedKey   = selectedDay ? dateKey(selectedDay) : null;
  const selectedSlots = selectedKey ? (monthEvMap[selectedKey] ?? []) : [];

  const handleDayClick = (date) => {
    const same = selectedDay && isSameDay(date, selectedDay);
    setSelectedDay(same ? null : date);
    setActiveSlot(null);
    setSelectedJob(null);
  };

  const handleSlotToggle = (slot) => {
    setActiveSlot((prev) => (prev?.id === slot.id ? null : slot));
    setSelectedJob(null);
  };

  return (
    <div className="space-y-3">
      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Month nav */}
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

        {/* DOW headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {DAY_NAMES_SHORT.map((n) => (
            <div key={n} className="py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-100 last:border-r-0">
              {n}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const isToday    = isSameDay(cell.date, today);
            const isSelected = selectedDay && isSameDay(cell.date, selectedDay);
            const key        = dateKey(cell.date);
            const slots      = monthEvMap[key] ?? [];
            const maxShow    = 2;
            const more       = slots.length - maxShow;

            return (
              <div
                key={idx}
                onClick={() => cell.currentMonth && handleDayClick(cell.date)}
                className={[
                  "min-h-[90px] p-1.5 border-r border-b border-slate-100 last:border-r-0 transition",
                  cell.currentMonth ? "cursor-pointer hover:bg-teal-50/30" : "bg-slate-50/60",
                  isSelected ? "bg-teal-50 ring-1 ring-inset ring-teal-300" : "",
                ].join(" ")}
              >
                <div className="flex justify-end mb-1">
                  <span className={[
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-teal-600 text-white" : cell.currentMonth ? "text-slate-700" : "text-slate-300",
                  ].join(" ")}>
                    {cell.date.getDate()}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {slots.slice(0, maxShow).map((slot) => {
                    const cfg = slotStatusConfig(slot);
                    return (
                      <div key={slot.id}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight ${cfg.pill}`}>
                        {slot.time} · {slot.jobs.length} việc
                      </div>
                    );
                  })}
                  {more > 0 && (
                    <div className="text-[10px] font-semibold text-slate-400 px-1">+{more} slot</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {DAY_NAMES_SHORT[selectedDay.getDay() === 0 ? 6 : selectedDay.getDay() - 1]},{" "}
                {selectedDay.getDate()} tháng {selectedDay.getMonth() + 1},{" "}
                {selectedDay.getFullYear()}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedSlots.length} khung giờ · {selectedSlots.reduce((s, sl) => s + sl.jobs.length, 0)} công việc
              </p>
            </div>
            <button
              onClick={() => { setSelectedDay(null); setActiveSlot(null); setSelectedJob(null); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Đóng <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedSlots.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
              <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Không có công việc nào</p>
              <AddSlotButton />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedSlots.map((slot) => {
                const isSlotActive = activeSlot?.id === slot.id;
                return (
                  <div key={slot.id}>
                    {/* Slot row */}
                    <div
                      onClick={() => handleSlotToggle(slot)}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-800">{slot.time}</span>
                        <span className="ml-2 text-xs text-slate-400">{slot.jobs.length} công việc</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSlotActive ? "rotate-90" : ""}`} />
                    </div>

                    {/* Expanded jobs */}
                    {isSlotActive && (
                      <div className="px-5 pb-4 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slot.jobs.map((job) => {
                          const cfg = STATUS_CONFIG[job.status];
                          return (
                            <div
                              key={job.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setActiveSlot(slot); }}
                              className={`bg-white rounded-xl border border-l-4 ${cfg.border} border-slate-100 shadow-sm p-3 cursor-pointer hover:shadow-md transition group`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                                {job.priority === "high" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                              </div>
                              <p className="text-xs font-bold text-slate-800 leading-snug mb-2 group-hover:text-teal-700 transition">
                                {job.title}
                              </p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="text-[10px] truncate">{job.property} – {job.room}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="text-[10px] truncate">{job.assignee ?? "Chưa phân công"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Job detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          slotTime={activeSlot?.time}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
