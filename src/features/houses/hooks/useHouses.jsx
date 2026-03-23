import { useEffect, useState } from "react";
import { getAllHouses, getHouseImages } from "../api/houses.api";
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
      if (!Array.isArray(arr)) {
        setHouses([]);
        return;
      }

      // Fetch images for all houses in parallel
      const imageResults = await Promise.allSettled(
        arr.map((h) => getHouseImages(h.id))
      );

      const mapped = arr.map((h, i) => {
        const imagesRaw = imageResults[i].status === "fulfilled" ? imageResults[i].value : [];
        const images = Array.isArray(imagesRaw) ? imagesRaw : (imagesRaw?.data ?? []);
        const imageUrl = images[0]?.url ?? null;
        return mapHouseToHouseCard(h, imageUrl);
      });

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
