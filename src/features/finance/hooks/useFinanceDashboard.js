import { useCallback, useEffect, useMemo, useState } from "react";
import { getFinanceDashboard } from "../api/finance.api";
import { PERIOD_PRESETS, resolvePeriod, toIso } from "../utils/period";

const EMPTY_DTO = {
  periodFrom: null,
  periodTo: null,
  previousPeriodFrom: null,
  previousPeriodTo: null,
  summary: {
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    outstandingAmount: 0,
    outstandingCount: 0,
    revenueChangePercent: null,
    expenseChangePercent: null,
    netProfitChangePercent: null,
  },
  revenueBreakdown: [],
  expenseBreakdown: [],
  regionSummaries: [],
  monthlyTrend: [],
  topHouses: [],
  recentTransactions: [],
  outstandingInvoices: [],
  totalManagedHouses: 0,
};

export function useFinanceDashboard(initialPreset = PERIOD_PRESETS.LAST_6_MONTHS) {
  const [preset, setPreset] = useState(initialPreset);
  const [customRange, setCustomRange] = useState(null);
  const [compare, setCompare] = useState(false);
  const [regionId, setRegionId] = useState("");

  const period = useMemo(() => resolvePeriod(preset, customRange), [preset, customRange]);

  const [data, setData] = useState(EMPTY_DTO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dto = await getFinanceDashboard({
        from: toIso(period.from),
        to: toIso(period.to),
        compare,
        regionId: regionId || null,
      });
      setData(dto ?? EMPTY_DTO);
    } catch (err) {
      setError(err?.message ?? "Không thể tải dữ liệu tài chính");
    } finally {
      setLoading(false);
    }
  }, [period.from, period.to, compare, regionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setCustomPeriod = useCallback((from, to) => {
    setCustomRange({ from, to });
    setPreset(PERIOD_PRESETS.CUSTOM);
  }, []);

  return {
    data,
    loading,
    error,
    period,
    preset,
    setPreset,
    customRange,
    setCustomPeriod,
    compare,
    setCompare,
    regionId,
    setRegionId,
    refetch: fetchData,
  };
}
