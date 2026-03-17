import { STATUS_CONFIG } from "../constants";

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
 * @param {{ startTime: string, endTime: string, slotDurationMinutes: number, breakDurationMinutes: number }} template
 * @returns {{ start: string, end: string, label: string }[]}
 *   e.g. [{ start: "08:00", end: "09:00", label: "08:00 – 09:00" }, ...]
 */
export function buildTimeSlotsFromTemplate({ startTime, endTime, slotDurationMinutes, breakDurationMinutes }) {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end   = timeToMinutes(endTime);

  while (current + slotDurationMinutes <= end) {
    const slotEnd = current + slotDurationMinutes;
    slots.push({
      start: minutesToTime(current),
      end:   minutesToTime(slotEnd),
      label: `${minutesToTime(current)} – ${minutesToTime(slotEnd)}`,
    });
    current = slotEnd + breakDurationMinutes;
  }

  return slots;
}
