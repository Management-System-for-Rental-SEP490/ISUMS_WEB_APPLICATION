import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeftRight,
  Coins,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import FinanceKpiCard from "../components/FinanceKpiCard";
import RevenueExpenseChart from "../components/RevenueExpenseChart";
import BreakdownDonut from "../components/BreakdownDonut";
import TopHousesTable from "../components/TopHousesTable";
import RecentTransactionsList from "../components/RecentTransactionsList";
import OutstandingAlert from "../components/OutstandingAlert";
import FinanceDateRangePicker from "../components/FinanceDateRangePicker";
import { useFinanceDashboard } from "../hooks/useFinanceDashboard";
import { formatVnd } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

export default function FinanceDashboardPage() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const {
    data,
    loading,
    error,
    period,
    preset,
    setPreset,
    setCustomPeriod,
    compare,
    setCompare,
    refetch,
  } = useFinanceDashboard();

  const summary = data.summary ?? {};
  const today = dayjs().format("dddd, D MMMM YYYY");

  const totalRevenue = Number(summary.totalRevenue) || 0;
  const totalExpense = Number(summary.totalExpense) || 0;
  const netProfit = Number(summary.netProfit) || 0;
  const outstandingAmount = Number(summary.outstandingAmount) || 0;
  const outstandingCount = Number(summary.outstandingCount) || 0;

  return (
    <div className="space-y-5 md:space-y-6">

      <div className="flex items-end justify-between flex-wrap gap-4" style={{ paddingTop: 4 }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND_GREEN }}>
            {t("finance.subtitle")}
          </p>
          <h2
            className="font-heading text-3xl font-bold"
            style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            {t("finance.title")}
          </h2>
          <p className="text-sm mt-0.5 capitalize" style={{ color: "#5A7A6E" }}>{today}</p>
        </div>

        <div className="flex items-center gap-2">
          <FinanceDateRangePicker
            preset={preset}
            period={period}
            onPresetChange={setPreset}
            onCustomRange={setCustomPeriod}
          />
          <button
            type="button"
            onClick={() => setCompare(!compare)}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
            style={{
              background: compare ? BRAND_GREEN : "#FFFFFF",
              border: `1px solid ${compare ? BRAND_GREEN : "#C4DED5"}`,
              color: compare ? "#FFFFFF" : "#1E2D28",
            }}
            title={t("finance.compare.toggle", { defaultValue: "So sánh kỳ trước" })}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {t("finance.compare.label", { defaultValue: "So sánh" })}
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-2" style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.25)" }}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D95F4B" }} />
            <p className="text-sm" style={{ color: "#D95F4B" }}>{error}</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="text-xs font-semibold rounded-lg px-3 py-1 transition"
            style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.40)", color: "#D95F4B" }}
          >
            {t("finance.retry", { defaultValue: "Thử lại" })}
          </button>
        </div>
      )}

      <OutstandingAlert
        amount={outstandingAmount}
        count={outstandingCount}
        rows={data.outstandingInvoices ?? []}
        loading={loading}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <FinanceKpiCard
          title={t("finance.kpi.revenue")}
          subtitle={t("finance.kpi.revenueHint", { defaultValue: "Tiền thuê + phạt trễ hạn" })}
          icon={TrendingUp}
          variant="revenue"
          loading={loading}
          rawValue={totalRevenue}
          deltaPercent={compare ? summary.revenueChangePercent : null}
        />
        <FinanceKpiCard
          title={t("finance.kpi.expense")}
          subtitle={t("finance.kpi.expenseHint", { defaultValue: "Bảo trì + sửa chữa + hoàn cọc" })}
          icon={TrendingDown}
          variant="expense"
          loading={loading}
          rawValue={totalExpense}
          deltaPercent={compare ? summary.expenseChangePercent : null}
          invertGoodOnDelta
        />
        <FinanceKpiCard
          title={t("finance.kpi.netProfit")}
          subtitle={netProfit >= 0
            ? t("finance.kpi.profitPositive", { defaultValue: "Đang có lãi" })
            : t("finance.kpi.profitNegative", { defaultValue: "Đang lỗ" })}
          icon={Wallet}
          variant="profit"
          loading={loading}
          rawValue={netProfit}
          deltaPercent={compare ? summary.netProfitChangePercent : null}
        />
        <FinanceKpiCard
          title={t("finance.kpi.outstanding")}
          subtitle={outstandingCount > 0
            ? t("finance.kpi.outstandingCount", { count: outstandingCount, defaultValue: `${outstandingCount} hóa đơn` })
            : t("finance.kpi.noOutstanding", { defaultValue: "Không có công nợ" })}
          icon={Coins}
          variant="outstanding"
          loading={loading}
          rawValue={outstandingAmount}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5" style={{ minHeight: 380 }}>
        <div className="lg:col-span-3 flex flex-col">
          <RevenueExpenseChart data={data.monthlyTrend ?? []} loading={loading} />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <BreakdownDonut
            variant="revenue"
            title={t("finance.charts.revenueBreakdown")}
            data={data.revenueBreakdown ?? []}
            total={totalRevenue}
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5" style={{ minHeight: 380 }}>
        <div className="lg:col-span-3 flex flex-col">
          <TopHousesTable rows={data.topHouses ?? []} loading={loading} />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <BreakdownDonut
            variant="expense"
            title={t("finance.charts.expenseBreakdown")}
            data={data.expenseBreakdown ?? []}
            total={totalExpense}
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5" style={{ minHeight: 360 }}>
        <RecentTransactionsList rows={data.recentTransactions ?? []} loading={loading} />
        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
        >
          <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
              {t("finance.summary.title", { defaultValue: "Tổng quan kỳ" })}
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <SummaryRow
              label={t("finance.summary.period")}
              value={`${period.from.format("DD/MM/YYYY")} → ${period.to.format("DD/MM/YYYY")}`}
            />
            <SummaryRow
              label={t("finance.summary.managedHouses")}
              value={String(data.totalManagedHouses ?? 0)}
            />
            <SummaryRow
              label={t("finance.summary.transactionsCount")}
              value={String((data.recentTransactions ?? []).length)}
              hint={t("finance.summary.recentOnly", { defaultValue: "(15 giao dịch gần nhất)" })}
            />
            <SummaryRow
              label={t("finance.summary.profitMargin")}
              value={totalRevenue > 0
                ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%`
                : "—"}
              hint={netProfit >= 0 ? "" : t("finance.summary.lossWarning", { defaultValue: "Cần kiểm soát chi phí" })}
              hintColor="#ef4444"
            />
            {compare && summary.previousNetProfit != null && (
              <SummaryRow
                label={t("finance.summary.previousProfit", { defaultValue: "Kỳ trước" })}
                value={formatVnd(summary.previousNetProfit, locale)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, hint, hintColor }) {
  return (
    <div className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: "1px dashed rgba(196,222,213,0.5)" }}>
      <div className="min-w-0">
        <p className="text-xs font-medium" style={{ color: "#5A7A6E" }}>{label}</p>
        {hint && (
          <p className="text-[11px] mt-0.5" style={{ color: hintColor || "#8ab5a3" }}>{hint}</p>
        )}
      </div>
      <p className="text-sm font-bold text-right" style={{ color: "#1E2D28" }}>{value}</p>
    </div>
  );
}
