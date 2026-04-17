import { useCallback, useEffect, useState } from "react";
import { getAllHouses } from "../api/houses.api";
import { mapHouseToHouseCard } from "../utils/mapHouseToHouseCard";

/**
 * @param {{ page?: number, size?: number, keyword?: string, sortBy?: string, sortDir?: string, status?: string }} params
 */
export function useHouses({ page = 1, size = 9, keyword = "", sortBy = "", sortDir = "", status = "" } = {}) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1, pageSize: size });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const params = {};
    if (page)    params.page    = page;
    if (size)    params.size    = size;
    if (keyword) params.keyword = keyword;
    if (sortBy)  params.sortBy  = sortBy;
    if (sortDir) params.sortDir = sortDir;
    if (status)  params.status  = status;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const raw = await getAllHouses(params);
        if (cancelled) return;

        const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);

        if (!Array.isArray(raw) && raw) {
          setPagination({
            total:       raw.total       ?? arr.length,
            totalPages:  raw.totalPages  ?? 1,
            currentPage: raw.currentPage ?? page,
            pageSize:    raw.pageSize    ?? size,
          });
        }

        const mapped = arr.map((h) => mapHouseToHouseCard(h));
        setHouses(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? String(err));
          setHouses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [page, size, keyword, sortBy, sortDir, status, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { houses, loading, error, refetch, isEmpty: houses.length === 0, pagination };
}
