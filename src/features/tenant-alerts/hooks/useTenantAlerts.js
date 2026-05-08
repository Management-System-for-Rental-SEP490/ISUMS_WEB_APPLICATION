import { useCallback, useEffect, useState } from "react";
import { acknowledgeTenantAlert, getTenantAlertsFeed } from "../api/tenantAlerts.api";

const EMPTY_FEED = {
  items: [],
  totalCount: 0,
  criticalCount: 0,
  warningCount: 0,
  infoCount: 0,
  lifeSafetyCount: 0,
  acknowledgedCount: 0,
  pendingCount: 0,
};

export function useTenantAlerts({
  severity = "ALL",
  status = "ALL",
  lifeSafety = false,
  daysBack = 7,
  limit = 200,
} = {}) {
  const [data, setData] = useState(EMPTY_FEED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dto = await getTenantAlertsFeed({ severity, status, lifeSafety, daysBack, limit });
      setData(dto ?? EMPTY_FEED);
    } catch (err) {
      setError(err?.message ?? "Không thể tải cảnh báo");
    } finally {
      setLoading(false);
    }
  }, [severity, status, lifeSafety, daysBack, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const acknowledge = useCallback(
    async (houseId, alertId, note) => {
      if (!houseId || !alertId) return;
      setPendingId(alertId);
      try {
        await acknowledgeTenantAlert(houseId, alertId, note);
        await fetchData();
      } catch (err) {
        setError(err?.message ?? "Không xác nhận được cảnh báo");
      } finally {
        setPendingId(null);
      }
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    acknowledge,
    pendingId,
  };
}
