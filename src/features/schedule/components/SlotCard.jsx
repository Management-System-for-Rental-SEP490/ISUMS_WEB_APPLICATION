import { slotStatusConfig } from "../utils/dateHelpers";

export default function SlotCard({ slot, isActive, onClick }) {
  const cfg = slotStatusConfig(slot);
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-lg px-2 py-1.5 mb-1.5 cursor-pointer border transition",
        isActive
          ? `${cfg.pill} border-current shadow-sm`
          : "bg-slate-50 border-slate-200 hover:bg-teal-50/60 hover:border-teal-200",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="text-[10px] font-bold text-slate-700">{slot.time}</span>
        <span className="ml-auto text-[10px] font-semibold text-slate-400 flex-shrink-0">
          {slot.jobs.length} việc
        </span>
      </div>
    </div>
  );
}
