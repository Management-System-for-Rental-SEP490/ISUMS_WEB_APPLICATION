import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_NAMES_LONG } from "../constants";
import { getWeekDays, isSameDay } from "../utils/dateHelpers";
import SlotCard from "./SlotCard";
import SlotDetailPanel from "./SlotDetailPanel";
import JobDetailModal from "./JobDetailModal";
import AddSlotButton from "./AddSlotButton";

/**
 * @param {{ weekBase, onPrev, onNext, events, loading }}
 *   events  — { 0:[slot],…6:[slot] } provided by useWeekSchedule hook
 *   loading — boolean, shows skeleton when true
 */
export default function WeekView({ weekBase, onPrev, onNext, events = {}, loading = false }) {
  const today    = new Date();
  const weekDays = getWeekDays(weekBase);

  const [activeSlot,  setActiveSlot]  = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const startFmt = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`;
  const endFmt   = `${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

  const handleSlotClick = (slot) => {
    setActiveSlot((prev) => (prev?.slot.id === slot.id ? null : { slot }));
    setSelectedJob(null);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Week nav */}
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
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {weekDays.map((day, idx) => {
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

            {/* Slot cards */}
            <div className="grid grid-cols-7">
              {weekDays.map((day, idx) => {
                const isToday  = isSameDay(day, today);
                const daySlots = loading ? [] : (events[idx] ?? []);
                return (
                  <div key={idx}
                    className={`p-2 border-r border-slate-100 last:border-r-0 min-h-[160px] ${isToday ? "bg-teal-50/20" : ""}`}>
                    {loading && (
                      <div className="space-y-1.5 animate-pulse">
                        <div className="h-7 rounded-lg bg-slate-100" />
                        <div className="h-7 rounded-lg bg-slate-100 w-3/4" />
                      </div>
                    )}
                    {!loading && daySlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        isActive={activeSlot?.slot.id === slot.id}
                        onClick={() => handleSlotClick(slot)}
                      />
                    ))}
                    {!loading && <AddSlotButton />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Slot detail panel */}
      {activeSlot && (
        <SlotDetailPanel
          slot={activeSlot.slot}
          onClose={() => { setActiveSlot(null); setSelectedJob(null); }}
          onSelectJob={setSelectedJob}
        />
      )}

      {/* Job detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          slotTime={activeSlot?.slot.time}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
