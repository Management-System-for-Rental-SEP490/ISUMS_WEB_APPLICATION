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
