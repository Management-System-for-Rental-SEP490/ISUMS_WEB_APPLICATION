import { useState, useEffect, useCallback } from "react";
// import { toast } from "react-toastify";
import { getWorkSlotsInRange, getWorkTemplate } from "../api/schedule.api";
import { buildWorkSlotGrid } from "../utils/mapScheduleFromApi";
import { buildTimeSlotsFromTemplate } from "../utils/dateHelpers";
import { buildMonthEvents } from "../data/mockData";

/**
 * Fallback template used only when the API call fails.
 * workDays: indices into weekDays array (0=Mon … 5=Sat, 6=Sun).
 */
export const DEFAULT_WORK_TEMPLATE = {
  workDays:             [0, 1, 2, 3, 4, 5], // Mon–Sat
  startTime:            "08:00",
  endTime:              "17:00",
  slotDurationMinutes:  60,
  breakDurationMinutes: 15,
};

/**
 * Map the raw template API response to the shape used by buildTimeSlotsFromTemplate.
 *
 * Expected raw shape (adjust field names once actual response is confirmed):
 * {
 *   workingDays: number[],       // e.g. [2,3,4,5,6,7]  — 1=Sun,2=Mon,...,7=Sat
 *   startTime: "HH:MM" | "HH:MM:SS",
 *   endTime:   "HH:MM" | "HH:MM:SS",
 *   slotDuration: number,        // minutes
 *   breakTime:    number,        // minutes
 * }
 *
 * Vietnamese day numbering: 1=CN(Sun), 2=T2(Mon),..., 7=T7(Sat)
 * weekDays array index:        0=Mon, 1=Tue, ..., 5=Sat, 6=Sun
 */
function mapTemplateFromApi(raw) {
  // Convert Vietnamese day numbers → weekDays array index (0=Mon)
  const VN_TO_IDX = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 1: 6 };
  const workDays = (raw.workingDays ?? raw.workDays ?? [2, 3, 4, 5, 6, 7])
    .map((d) => VN_TO_IDX[d])
    .filter((d) => d !== undefined)
    .sort((a, b) => a - b);

  // Strip seconds if present ("HH:MM:SS" → "HH:MM")
  const toHHMM = (t) => (t ? String(t).substring(0, 5) : null);

  return {
    workDays,
    startTime:            toHHMM(raw.startTime)     ?? "08:00",
    endTime:              toHHMM(raw.endTime)        ?? "17:00",
    slotDurationMinutes:  raw.slotDuration ?? raw.slotDurationMinutes  ?? 60,
    breakDurationMinutes: raw.breakTime    ?? raw.breakDurationMinutes ?? 15,
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

/** Month view still uses mock data until the month API is updated. */
export function useMonthSchedule(year, month) {
  const [monthEvMap, setMonthEvMap] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMonthEvMap(buildMonthEvents(year, month));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { monthEvMap, loading, error, refetch: fetch };
}
