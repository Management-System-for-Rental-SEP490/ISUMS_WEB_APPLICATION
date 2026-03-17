/**
 * Maps API response shape → UI shape used by WeekView / MonthView.
 *
 * Expected API slot shape:
 * {
 *   id: string,
 *   scheduledDate: "YYYY-MM-DD",
 *   scheduledTime: "HH:mm",
 *   jobs: [{
 *     id, title,
 *     property: { id, name },
 *     room: string,
 *     assignee: { id, name } | null,
 *     status: "IN_PROGRESS" | "PENDING" | "DONE" | "UPCOMING",
 *     priority: "HIGH" | "NORMAL" | null,
 *     note: string | null
 *   }]
 * }
 *
 * UI slot shape:
 * { id, time: "HH:mm", jobs: [{ id, title, property, room, assignee, status, priority?, note? }] }
 */

const STATUS_MAP = {
  IN_PROGRESS: "inProgress",
  PENDING:     "pending",
  DONE:        "done",
  UPCOMING:    "upcoming",
};

function mapJob(raw) {
  return {
    id:       raw.id,
    title:    raw.title,
    property: raw.property?.name ?? raw.property ?? "—",
    room:     raw.room ?? "—",
    assignee: raw.assignee?.name ?? raw.assignee ?? null,
    status:   STATUS_MAP[raw.status] ?? raw.status ?? "upcoming",
    ...(raw.priority?.toUpperCase() === "HIGH" && { priority: "high" }),
    ...(raw.note && { note: raw.note }),
  };
}

export function mapSlotFromApi(raw) {
  return {
    id:   raw.id,
    time: raw.scheduledTime ?? raw.time ?? "00:00",
    jobs: (raw.jobs ?? []).map(mapJob),
  };
}

/**
 * Maps a list of API slots to the week events map { dayIndex: [slot] }.
 * @param {Array}  rawSlots  - API response array
 * @param {Date[]} weekDays  - 7 Date objects Mon→Sun
 */
export function mapWeekSlotsToEvents(rawSlots, weekDays) {
  const events = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, []]));

  rawSlots.forEach((raw) => {
    const slotDate  = new Date(raw.scheduledDate);
    const dayIndex  = weekDays.findIndex(
      (d) =>
        d.getFullYear() === slotDate.getFullYear() &&
        d.getMonth()    === slotDate.getMonth()    &&
        d.getDate()     === slotDate.getDate()
    );
    if (dayIndex !== -1) {
      events[dayIndex].push(mapSlotFromApi(raw));
    }
  });

  return events;
}

/**
 * Maps a list of API slots to the month events map { "year-month-day": [slot] }.
 * @param {Array} rawSlots - API response array
 */
export function mapMonthSlotsToEvMap(rawSlots) {
  const map = {};

  rawSlots.forEach((raw) => {
    const d    = new Date(raw.scheduledDate);
    const key  = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = [];
    map[key].push(mapSlotFromApi(raw));
  });

  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// New schedule API mappers
// Raw shape: { id, staffId, jobId, jobType, startTime: "2026-03-13T13:00:00",
//              endTime: "2026-03-13T14:00:00", status: "BOOKED" | "CANCELLED" }
// ─────────────────────────────────────────────────────────────────────────────

const WORK_SLOT_STATUS_MAP = {
  BOOKED:    "booked",
  CANCELLED: "cancelled",
};

/**
 * Map a raw work slot from the schedule API to the UI shape.
 * @param {Object} raw
 * @returns {{ id, staffId, jobId, jobType, date, startTimeStr, endTimeStr, status }}
 */
export function mapWorkSlotFromApi(raw) {
  return {
    id:           raw.id,
    staffId:      raw.staffId,
    jobId:        raw.jobId,
    jobType:      raw.jobType ?? "MAINTENANCE",
    date:         raw.startTime.substring(0, 10),   // "YYYY-MM-DD"
    startTimeStr: raw.startTime.substring(11, 16),  // "HH:MM"
    endTimeStr:   raw.endTime.substring(11, 16),    // "HH:MM"
    status:       WORK_SLOT_STATUS_MAP[raw.status] ?? "booked",
  };
}

/**
 * Build a 2-level grid from raw work slots: { "YYYY-MM-DD": { "HH:MM": [slot, ...] } }
 * The outer key is the date, the inner key is the slot startTime string.
 * @param {Array} rawSlots
 * @returns {Object}
 */
export function buildWorkSlotGrid(rawSlots) {
  const grid = {};
  rawSlots.forEach((raw) => {
    const slot = mapWorkSlotFromApi(raw);
    if (!grid[slot.date]) grid[slot.date] = {};
    if (!grid[slot.date][slot.startTimeStr]) grid[slot.date][slot.startTimeStr] = [];
    grid[slot.date][slot.startTimeStr].push(slot);
  });
  return grid;
}
