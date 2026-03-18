import { useState, useEffect, useCallback } from "react";
// import { toast } from "react-toastify";
import { getWorkSlotsInRange, getWorkTemplate } from "../api/schedule.api";
import { buildWorkSlotGrid } from "../utils/mapScheduleFromApi";
import { buildTimeSlotsFromTemplate } from "../utils/dateHelpers";

/**
 * Fallback template used only when the API call fails.
 * workDays: indices into weekDays array (0=Mon … 5=Sat, 6=Sun).
 */
export const DEFAULT_WORK_TEMPLATE = {
  workDays:             [0, 1, 2, 3, 4, 5], // Mon–Sat
  startTime:            "08:00",
  endTime:              "17:00",
  breakStart:           "12:00",
  breakEnd:             "13:00",
  slotDurationMinutes:  60,
  bufferMinutes:        15,
};

/**
 * Map the raw template API response to the shape used by buildTimeSlotsFromTemplate.
 *
 * Actual API shape (from /schedules/templates/current/{date}):
 * {
 *   id: string,
 *   workingDays: "MON,TUE,WED,THU,FRI,SAT",   // comma-separated English day names
 *   openTime:    "08:00:00",
 *   breakStart:  "12:00:00",
 *   breakEnd:    "13:00:00",
 *   closeTime:   "17:00:00",
 *   slotMinutes:   60,
 *   bufferMinutes: 15,
 *   effectiveFrom: "YYYY-MM-DD",
 *   updatedAt: "...",
 * }
 *
 * weekDays array index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
 */
const DAY_NAME_TO_IDX = {
  MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6,
};

function mapTemplateFromApi(raw) {
  // workingDays can be a comma-separated string "MON,TUE,..." or an array
  const daySource = raw.workingDays ?? raw.workDays;
  let workDays;
  if (typeof daySource === "string") {
    workDays = daySource
      .split(",")
      .map((d) => DAY_NAME_TO_IDX[d.trim().toUpperCase()])
      .filter((d) => d !== undefined)
      .sort((a, b) => a - b);
  } else if (Array.isArray(daySource)) {
    // Fallback: old Vietnamese numbering (1=Sun,2=Mon,...,7=Sat)
    const VN_TO_IDX = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 1: 6 };
    workDays = daySource
      .map((d) => (typeof d === "number" ? VN_TO_IDX[d] : DAY_NAME_TO_IDX[String(d).toUpperCase()]))
      .filter((d) => d !== undefined)
      .sort((a, b) => a - b);
  } else {
    workDays = [0, 1, 2, 3, 4, 5]; // Mon–Sat default
  }

  // Strip seconds if present ("HH:MM:SS" → "HH:MM")
  const toHHMM = (t) => (t ? String(t).substring(0, 5) : null);

  return {
    workDays,
    startTime:           toHHMM(raw.openTime   ?? raw.startTime) ?? "08:00",
    endTime:             toHHMM(raw.closeTime  ?? raw.endTime)   ?? "17:00",
    breakStart:          toHHMM(raw.breakStart) ?? null,
    breakEnd:            toHHMM(raw.breakEnd)   ?? null,
    slotDurationMinutes: raw.slotMinutes ?? raw.slotDuration ?? raw.slotDurationMinutes ?? 60,
    bufferMinutes:       raw.bufferMinutes ?? raw.breakTime ?? 15,
  };
}

/**
 * Fetch work slots for a date range and the template for the start date,
 * then build a time-grid and time-slot axis for WeekView.
 *
 * @param {string} startDateStr "YYYY-MM-DD"
 * @param {string} endDateStr   "YYYY-MM-DD"
 * @returns {{ slotGrid, template, timeSlots, loading, error, refetch }}
 */
export function useWorkSchedule(startDateStr, endDateStr) {
  const [slotGrid,   setSlotGrid]   = useState({});
  const [template,   setTemplate]   = useState(DEFAULT_WORK_TEMPLATE);
  const [timeSlots,  setTimeSlots]  = useState(() => buildTimeSlotsFromTemplate(DEFAULT_WORK_TEMPLATE));
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawSlots, rawTemplate] = await Promise.all([
        getWorkSlotsInRange(startDateStr, endDateStr),
        getWorkTemplate(startDateStr),
      ]);

      setSlotGrid(buildWorkSlotGrid(Array.isArray(rawSlots) ? rawSlots : []));

      const tpl = rawTemplate ? mapTemplateFromApi(rawTemplate) : DEFAULT_WORK_TEMPLATE;
      setTemplate(tpl);
      setTimeSlots(buildTimeSlotsFromTemplate(tpl));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { slotGrid, template, timeSlots, loading, error, refetch: fetch };
}

/**
 * Fetch work slots for an entire month.
 * @returns {{ slotGrid, loading, error, refetch }}
 *   slotGrid: { "YYYY-MM-DD": { "HH:MM": [slot, ...] } }
 */
export function useMonthSchedule(year, month) {
  const [slotGrid, setSlotGrid] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Build ISO date strings for first and last day of month
  const startDateStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay      = new Date(year, month + 1, 0).getDate();
  const endDateStr   = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawSlots = await getWorkSlotsInRange(startDateStr, endDateStr);
      setSlotGrid(buildWorkSlotGrid(Array.isArray(rawSlots) ? rawSlots : []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { slotGrid, loading, error, refetch: fetch };
}
