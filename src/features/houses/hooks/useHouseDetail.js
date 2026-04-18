import { useEffect, useState, useCallback } from "react";
import { getHouseById } from "../api/houses.api";

export function useHouseDetail(houseId) {
  const [house, setHouse]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!houseId) return;
    setLoading(true);
    setError(null);
    try {
      const houseRes = await getHouseById(houseId);
      setHouse(houseRes);
    } catch (e) {
      setError(e.message ?? "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { house, loading, error, refetch: fetch };
}
