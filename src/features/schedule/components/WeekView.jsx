import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, RefreshCw, Layers } from "lucide-react";
import { getWeekDays, isSameDay, localDateStr } from "../utils/dateHelpers";
import SlotModal from "./SlotModal";

// ── Constants ──────────────────────────────────────────────────────────────────

const PX_PER_HOUR = 80;

// Job type drives card color — so Bảo trì vs Sửa chữa are visually distinct
const JOB_TYPE_CFG = {
  MAINTENANCE: { bg: "bg-teal-50",   border: "border-l-teal-500",   badge: "bg-teal-100 text-teal-700",     labelKey: "schedule.jobMaintenance", dot: "bg-teal-500",   color: "#14b8a6" },
  ISSUE:       { bg: "bg-orange-50", border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700", labelKey: "schedule.jobIssue",        dot: "bg-orange-500", color: "#f97316" },
  INSPECTION:  { bg: "bg-blue-50",   border: "border-l-blue-500",   badge: "bg-blue-100 text-blue-700",     labelKey: "schedule.jobInspection",   dot: "bg-blue-500",   color: "#3b82f6" },
  CLEANING:    { bg: "bg-purple-50", border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700", labelKey: "schedule.jobCleaning",     dot: "bg-purple-500", color: "#a855f7" },
  SUPPORT:     { bg: "bg-slate-50",  border: "border-l-slate-400",  badge: "bg-slate-100 text-slate-600",   labelKey: "schedule.jobSupport",      dot: "bg-slate-400",  color: "#94a3b8" },
};

function jobTypeCfg(type) {
  return JOB_TYPE_CFG[type?.toUpperCase()] ?? JOB_TYPE_CFG.MAINTENANCE;
}

// Group slots by job type, returning ordered [{ key, cfg, count }] entries
function typeBreakdown(slots) {
  const counts = {};
  const order = [];
  for (const s of slots) {
    const key = s.jobType?.toUpperCase() ?? "MAINTENANCE";
    if (!(key in counts)) order.push(key);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return order.map((key) => ({ key, cfg: jobTypeCfg(key), count: counts[key] }));
}

const STATUS_CFG = {
  booked:     { Icon: Clock,        labelKey: "schedule.statusBooked" },
  cancelled:  { Icon: XCircle,      labelKey: "schedule.statusCancelled" },
  inprogress: { Icon: RefreshCw,    labelKey: "schedule.statusInProgress" },
  done:       { Icon: CheckCircle2, labelKey: "schedule.issueDone" },
};

function statusCfg(status) {
  return STATUS_CFG[status?.toLowerCase().replace(/_/g, "")] ?? STATUS_CFG.booked;
}

// ── Time helpers ───────────────────────────────────────────────────────────────

function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ── Layout — events overlap naturally (full width, stack on top of each other) ──

function layoutGroups(groups) {
  return groups.map((g) => ({ ...g, colIdx: 0, colCount: 1 }));
}

// ── EventBlock ─────────────────────────────────────────────────────────────────

function EventBlock({ group, dayStartMins, onClick, t }) {
  const top    = ((toMins(group.startTimeStr) - dayStartMins) / 60) * PX_PER_HOUR;
  const height = Math.max(48, ((toMins(group.endTimeStr) - toMins(group.startTimeStr)) / 60) * PX_PER_HOUR - 3);
  const pctW   = 100 / group.colCount;

  const breakdown = typeBreakdown(group.slots);
  const isMixed   = breakdown.length > 1;

  const positionStyle = {
    top:    `${top}px`,
    height: `${height}px`,
    left:   `calc(${group.colIdx * pctW}% + 3px)`,
    width:  `calc(${pctW}% - 7px)`,
  };

  // ── Mixed types: summary card — click to see breakdown ──
  if (isMixed) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute rounded-xl text-left overflow-hidden shadow-sm transition hover:shadow-md hover:brightness-[0.98] hover:z-20 bg-white border border-slate-200"
        style={positionStyle}
      >
        {/* Segmented left accent — one color per job type */}
        <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
          {breakdown.map(({ key, cfg }) => (
            <div key={key} className="flex-1" style={{ background: cfg.color }} />
          ))}
        </div>

        <div className="flex flex-col p-2 pl-2.5 h-full">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold w-fit bg-slate-800 text-white">
            <Layers className="w-3 h-3 flex-shrink-0" />
            {t("schedule.slotCount", { count: group.slots.length })}
          </div>

          {height > 52 && (
            <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
              {breakdown.length} {t("schedule.jobTypes")}
            </p>
          )}

          {/* Color dots only — compact type indicator */}
          <div className="flex items-center gap-1 mt-1">
            {breakdown.map(({ key, cfg }) => (
              <span key={key} className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
            ))}
          </div>

          <p className="text-[9px] text-slate-400 leading-none truncate mt-auto pt-1">
            {group.startTimeStr} – {group.endTimeStr}
          </p>
        </div>
      </button>
    );
  }

  // ── Single type: original colored card ──
  const slot     = group.slots[0];
  const typeCfg  = breakdown[0].cfg;
  const sCfg     = statusCfg(slot?.status);
  const { Icon } = sCfg;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute rounded-xl border-l-[3px] text-left overflow-hidden shadow-sm transition hover:shadow-md hover:brightness-[0.97] hover:z-20 ${typeCfg.border} ${typeCfg.bg}`}
      style={positionStyle}
    >
      <div className="flex flex-col p-2 h-full">
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold w-fit ${typeCfg.badge}`}>
          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
          {t(sCfg.labelKey, { defaultValue: "" })}
          {group.slots.length > 1 && (
            <span className="ml-0.5 bg-white/60 rounded-full px-1">
              {group.slots.length}
            </span>
          )}
        </div>

        {height > 52 && (
          <p className="text-[11px] font-bold text-slate-800 leading-tight truncate mt-1">
            {t(typeCfg.labelKey, { defaultValue: "" })}
          </p>
        )}

        <p className="text-[9px] text-slate-400 leading-none truncate mt-auto pt-1">
          {group.startTimeStr} – {group.endTimeStr}
        </p>
      </div>
    </button>
  );
}

// ── WeekView ───────────────────────────────────────────────────────────────────

export default function WeekView({
  weekBase,
  onPrev,
  onNext,
  slotGrid = {},
  template = { workDays: [0, 1, 2, 3, 4, 5], startTime: "08:00", endTime: "17:00" },
  loading = false,
}) {
  const { t } = useTranslation("common");
  const DAY_NAMES_LONG = [t("schedule.dayMon"), t("schedule.dayTue"), t("schedule.dayWed"), t("schedule.dayThu"), t("schedule.dayFri"), t("schedule.daySat"), t("schedule.daySun")];
  const today    = new Date();
  const weekDays = getWeekDays(weekBase);
  const [activeGroup, setActiveGroup] = useState(null);

  // Derive display range from template (+1h padding at end)
  const dayStartH    = Math.floor(toMins(template.startTime ?? "08:00") / 60);
  const dayEndH      = Math.ceil(toMins(template.endTime ?? "17:00") / 60) + 1;
  const hours        = Array.from({ length: dayEndH - dayStartH }, (_, i) => dayStartH + i);
  const totalH       = hours.length * PX_PER_HOUR;
  const dayStartMins = dayStartH * 60;

  // Current time indicator
  const nowMins = today.getHours() * 60 + today.getMinutes();
  const nowTop  = ((nowMins - dayStartMins) / 60) * PX_PER_HOUR;
  const showNow = nowMins >= dayStartMins && nowMins <= dayEndH * 60;

  const startFmt = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`;
  const endFmt   = `${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
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
          <div style={{ minWidth: "600px" }}>
            {/* Day headers */}
            <div
              className="grid border-b border-slate-200"
              style={{ gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))" }}
            >
              <div className="border-r border-slate-200" />
              {weekDays.map((day, idx) => {
                const isToday   = isSameDay(day, today);
                const isWorkDay = template.workDays.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`py-3 text-center border-r border-slate-200 last:border-r-0 ${
                      isToday ? "bg-teal-50/60" : !isWorkDay ? "bg-slate-50" : ""
                    }`}
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                      isToday ? "text-teal-500" : !isWorkDay ? "text-slate-300" : "text-slate-400"
                    }`}>
                      {DAY_NAMES_LONG[idx]}
                    </p>
                    <p className={`text-xl font-bold mt-0.5 ${
                      isToday ? "text-teal-600" : !isWorkDay ? "text-slate-300" : "text-slate-800"
                    }`}>
                      {day.getDate()}
                    </p>
                    {isToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time grid — no inner scroll, uses page scroll */}
            <div>
              {loading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div
                  className="relative grid"
                  style={{
                    gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))",
                    height: `${totalH}px`,
                  }}
                >
                  {/* Time label column */}
                  <div className="relative border-r border-slate-200">
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute right-0 left-0"
                        style={{ top: `${(h - dayStartH) * PX_PER_HOUR}px` }}
                      >
                        <span className="absolute -top-2.5 right-1.5 text-[10px] font-semibold text-slate-400 leading-none">
                          {String(h).padStart(2, "0")}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day, idx) => {
                    const isToday   = isSameDay(day, today);
                    const isWorkDay = template.workDays.includes(idx);
                    const dateKey   = localDateStr(day);

                    const groups = Object.values(slotGrid[dateKey] ?? {}).map((slots) => ({
                      startTimeStr: slots[0]?.startTimeStr ?? "08:00",
                      endTimeStr:   slots[0]?.endTimeStr   ?? "09:00",
                      slots,
                    }));
                    const laidOut = layoutGroups(groups);

                    return (
                      <div
                        key={idx}
                        className={`relative border-r border-slate-200 last:border-r-0 ${
                          isToday ? "bg-teal-50/20" : !isWorkDay ? "bg-slate-50/60" : ""
                        }`}
                        style={{ height: `${totalH}px` }}
                      >
                        {/* Horizontal hour lines */}
                        {hours.map((h) => (
                          <div
                            key={h}
                            className="absolute left-0 right-0 border-t border-slate-200"
                            style={{ top: `${(h - dayStartH) * PX_PER_HOUR}px` }}
                          />
                        ))}

                        {/* Current time indicator */}
                        {isToday && showNow && (
                          <div
                            className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                            style={{ top: `${nowTop}px` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-400 -ml-1 flex-shrink-0" />
                            <div className="flex-1 border-t border-red-400" />
                          </div>
                        )}

                        {/* Event blocks */}
                        {laidOut.map((group, gi) => (
                          <EventBlock
                            key={gi}
                            group={group}
                            dayStartMins={dayStartMins}
                            onClick={() => setActiveGroup({ group, dateKey })}
                            t={t}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeGroup && (
        <SlotModal
          dateStr={activeGroup.dateKey}
          timeSlot={{
            start: activeGroup.group.startTimeStr,
            end:   activeGroup.group.endTimeStr,
          }}
          slots={activeGroup.group.slots}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </div>
  );
}
