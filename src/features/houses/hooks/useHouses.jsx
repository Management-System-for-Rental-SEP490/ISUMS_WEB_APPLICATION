import { useEffect, useState } from "react";
import { getAllHouses } from "../api/houses.api";
import { mapHouseToHouseCard } from "../utils/mapHouseToHouseCard";

export function useHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllHouses();
      const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
      console.log("Fetched houses:", raw);
      if (raw && typeof raw.success === "boolean" && !raw.success) {
        throw new Error("Không thể tải danh sách nhà. Vui lòng thử lại sau.");
      }
      const mapped = Array.isArray(arr) ? arr.map(mapHouseToHouseCard) : [];
      setHouses(mapped);
    } catch (err) {
      setError(err?.message ?? String(err));
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    houses,
    loading,
    error,
    refetch,
    isEmpty: houses.length === 0,
  };
}
