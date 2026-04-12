import { useEffect, useState } from "react";
import { getInspectionById, getAssetEventsByJob } from "../api/inspections.api";

/**
 * Fetch inspection detail + asset events in sequence.
 * @param {string|null} inspectionId
 */
export function useInspectionResult(inspectionId) {
  const [inspection, setInspection] = useState(null);
  const [assetEvents, setAssetEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inspectionId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setInspection(null);
    setAssetEvents([]);

    (async () => {
      try {
        const detail = await getInspectionById(inspectionId);
        if (cancelled) return;
        setInspection(detail);

        if (detail?.jobId) {
          const events = await getAssetEventsByJob(detail.jobId);
          if (!cancelled) setAssetEvents(events);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [inspectionId]);

  return { inspection, assetEvents, loading, error };
}
