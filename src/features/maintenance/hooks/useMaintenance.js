import { useState, useEffect, useCallback } from "react";
// import { toast } from "react-toastify";
// import { getSlotsByWeek, getSlotsByMonth } from "../api/maintenance.api";
// import { mapWeekSlotsToEvents, mapMonthSlotsToEvMap } from "../utils/mapMaintenanceFromApi";
import { buildWeekEvents, buildMonthEvents } from "../data/mockData";

export function useWeekSchedule(startDateStr, endDateStr, weekDays) {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(buildWeekEvents(weekDays));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, loading, error, refetch: fetch };
}

export function useMonthSchedule(year, month) {
  const [monthEvMap, setMonthEvMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
