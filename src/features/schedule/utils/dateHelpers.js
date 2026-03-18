import { STATUS_CONFIG } from "../constants";

/**
 * Format a Date to "YYYY-MM-DD" using LOCAL time (not UTC).
 * Avoids timezone shift from toISOString() which converts to UTC.
 */
export function localDateStr(d) {
  return (
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}

export function getWeekDays(baseDate) {
  const day  = baseDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(baseDate);
  mon.setDate(baseDate.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

export function dominantStatus(jobs) {
  const pri = { inProgress: 0, pending: 1, upcoming: 2, done: 3 };
  return jobs.reduce(
    (acc, j) => (pri[j.status] < pri[acc] ? j.status : acc),
    jobs[0]?.status ?? "upcoming",
  );
}

export function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Returns cells for a 6-row month grid (Mon-start). */
export function getMonthGrid(year, month) {
  const first    = new Date(year, month, 1);
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInM  = new Date(year, month + 1, 0).getDate();
  const cells    = [];

  for (let i = startDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month, -i), currentMonth: false });
  for (let d = 1; d <= daysInM; d++)
    cells.push({ date: new Date(year, month, d), currentMonth: true });
  let extra = 1;
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(year, month + 1, extra++), currentMonth: false });

  return cells;
}

/** Derive dominant status config for a slot (used in calendar pills). */
export function slotStatusConfig(slot) {
  return STATUS_CONFIG[dominantStatus(slot.jobs)];
}

/** Convert "HH:MM" string to total minutes. */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes to "HH:MM" string. */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Generate an ordered array of time slot rows from a work template config.
 * Skips the lunch break period (breakStart–breakEnd) if provided.
 *
 * @param {{
 *   startTime: string,
 *   endTime: string,
 *   breakStart?: string | null,
 *   breakEnd?: string | null,
 *   slotDurationMinutes: number,
 *   bufferMinutes: number,
 * }} template
 * @returns {{ start: string, end: string, label: string }[]}
 *   e.g. [{ start: "08:00", end: "09:00", label: "08:00 – 09:00" }, ...]
 */
export function buildTimeSlotsFromTemplate({
  startTime,
  endTime,
  breakStart = null,
  breakEnd   = null,
  slotDurationMinutes,
  bufferMinutes,
  // legacy fallback
  breakDurationMinutes,
}) {
  const buffer     = bufferMinutes ?? breakDurationMinutes ?? 15;
  const slots      = [];
  let   current    = timeToMinutes(startTime);
  const closeMin   = timeToMinutes(endTime);
  const breakSt    = breakStart ? timeToMinutes(breakStart) : null;
  const breakEn    = breakEnd   ? timeToMinutes(breakEnd)   : null;

  while (current + slotDurationMinutes <= closeMin) {
    // If this slot would overlap with the break period, jump to breakEnd
    if (breakSt !== null && breakEn !== null) {
      const slotWouldEnd = current + slotDurationMinutes;
      if (current < breakEn && slotWouldEnd > breakSt) {
        current = breakEn;
        continue;
      }
    }

    const slotEnd = current + slotDurationMinutes;
    slots.push({
      start: minutesToTime(current),
      end:   minutesToTime(slotEnd),
      label: `${minutesToTime(current)} – ${minutesToTime(slotEnd)}`,
    });
    current = slotEnd + buffer;
  }

  return slots;
}
