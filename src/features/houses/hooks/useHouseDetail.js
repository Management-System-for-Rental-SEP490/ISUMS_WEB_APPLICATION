import { useEffect, useState, useCallback } from "react";
import { getHouseById, getAssetsByHouse } from "../api/houses.api";

/**
 * Fetch house detail + assets in parallel.
 * @param {string} houseId
 */
export function useHouseDetail(houseId) {
  const [house, setHouse]     = useState(null);
  const [assets, setAssets]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!houseId) return;
    setLoading(true);
    setError(null);
    try {
      const houseRes = await getHouseById(houseId);
      setHouse(houseRes);
      // Assets fetch is non-blocking — page still loads if this fails
      getAssetsByHouse(houseId)
        .then((res) => setAssets(Array.isArray(res) ? res : []))
        .catch(() => setAssets([]));
    } catch (e) {
      setError(e.message ?? "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { house, assets, loading, error, refetch: fetch };
}
