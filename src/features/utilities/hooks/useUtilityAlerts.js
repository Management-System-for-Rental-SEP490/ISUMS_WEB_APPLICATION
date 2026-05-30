import { useCallback, useEffect, useRef, useState } from "react";
import { getUtilityAlerts } from "../api/utilities.api";

/**
 * Fleet-wide utility alerts hook.
 *
 * <p>Tailored to the Utilities page lifecycle:
 * <ul>
 *   <li><b>Per-metric cache</b> — re-mounting the page or switching
 *       between Electricity/Water tabs shouldn't trigger a re-fetch
 *       within 60s. The BE in turn caches for 5 min, so the FE cache
 *       just suppresses duplicate network calls within a single
 *       landlord session.</li>
 *   <li><b>Manual refresh</b> — {@code refresh()} bypasses the cache
 *       and re-fetches. Wired to the "Refresh" button header.</li>
 *   <li><b>Unmount-safe</b> — an in-flight fetch after unmount is
 *       dropped via a cancelled-ref rather than state update.</li>
 *   <li><b>Stable error shape</b> — failures surface as a string,
 *       not an Error object, so the template can render directly.</li>
 * </ul>
 *
 * <p>No polling — alerts aren't changing second-by-second (EIF refreshes
 * forecast daily-ish). The landlord gets the current snapshot and can
 * manually refresh or navigate away.
 *
 * @param {"electricity"|"water"} metric
 */
const moduleCache = new Map(); // metric → { fetchedAt, data }
const CACHE_TTL_MS = 60_000;

export function useUtilityAlerts(metric) {
  const [data, setData]       = useState(() => moduleCache.get(metric)?.data ?? null);
  const [loading, setLoading] = useState(!moduleCache.get(metric));
  const [error, setError]     = useState(null);
  const cancelledRef = useRef(false);

  const fetchOnce = useCallback(async (force = false) => {
    const cached = moduleCache.get(metric);
    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getUtilityAlerts(metric);
      if (cancelledRef.current) return;
      moduleCache.set(metric, { fetchedAt: Date.now(), data: res });
      setData(res);
    } catch (e) {
      if (cancelledRef.current) return;
      // Keep the last-known data rather than flashing an empty state
      // on transient failure — landlord dashboards benefit from
      // "stale is better than nothing".
      setError(e.message || "Fetch failed");
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchOnce(false);
    return () => { cancelledRef.current = true; };
  }, [fetchOnce]);

  const refresh = useCallback(() => fetchOnce(true), [fetchOnce]);

  return { data, loading, error, refresh };
}
