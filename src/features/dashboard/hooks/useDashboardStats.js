import { useEffect, useState, useCallback } from "react";
import { getDashboardStats } from "../api/dashboard.api";
import { getAllHouses } from "../../houses/api/houses.api";
import { getAllContracts } from "../../contracts/api/contracts.api";
import { mapContractFromApi } from "../../contracts/utils/mapContractFromApi";

const DEFAULT_PROPERTY_STATS = { total: 0, rented: 0, available: 0, expiringSoon: 0 };

function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
}

/**
 * Hook thống kê dashboard.
 * - Gọi API dashboard mới (propertyStats, contractTimeSeries, contractStatusBreakdown)
 * - Đồng thời lấy houses (cho map) và recentContracts (danh sách gần nhất)
 * @param {"3M"|"6M"|"12M"} period
 */
export function useDashboardStats(period = "6M") {
  const [propertyStats, setPropertyStats]               = useState(DEFAULT_PROPERTY_STATS);
  const [contractTimeSeries, setContractTimeSeries]     = useState([]);
  const [contractStatusBreakdown, setContractStatusBreakdown] = useState([]);
  const [houses, setHouses]                             = useState([]);
  const [recentContracts, setRecentContracts]           = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashResult, housesResult, contractsResult] = await Promise.allSettled([
        getDashboardStats(period),
        getAllHouses(),
        getAllContracts({ page: 1, size: 5, sorts: "createdAt:DESC" }),
      ]);

      if (dashResult.status === "fulfilled") {
        const data = dashResult.value;
        setPropertyStats(data?.propertyStats ?? DEFAULT_PROPERTY_STATS);
        setContractTimeSeries(Array.isArray(data?.contractTimeSeries) ? data.contractTimeSeries : []);
        setContractStatusBreakdown(Array.isArray(data?.contractStatusBreakdown) ? data.contractStatusBreakdown : []);
      } else {
        setError(dashResult.reason?.message ?? "Không thể tải dữ liệu dashboard");
      }

      if (housesResult.status === "fulfilled") {
        setHouses(toArray(housesResult.value));
      }

      if (contractsResult.status === "fulfilled") {
        const raw = contractsResult.value;
        setRecentContracts(toArray(raw).map(mapContractFromApi).filter(Boolean));
      }
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { propertyStats, contractTimeSeries, contractStatusBreakdown, houses, recentContracts, loading, error, refetch: fetchAll };
}
