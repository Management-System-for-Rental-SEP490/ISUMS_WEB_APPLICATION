import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import { formatVnd, formatVndCompact } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const REVENUE_COLOR = "#10b981";
const EXPENSE_COLOR = "#ef4444";
const PROFIT_COLOR = "#3b82f6";

function CustomTooltip({ active, payload, label, t, locale }) {
  if (!active || !payload || !payload.length) return null;
  const dataPoint = payload[0]?.payload ?? {};
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: "rgba(255,255,255,0.98)",
        border: "1px solid #C4DED5",
        boxShadow: "0px 4px 12px rgba(16,24,40,0.10)",
        minWidth: 200,
      }}
    >
      <p className="font-semibold mb-1.5" style={{ color: "#1E2D28" }}>{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: REVENUE_COLOR }} />
            <span style={{ color: "#5A7A6E" }}>{t("finance.kpi.revenue")}</span>
          </span>
          <span className="font-semibold tabular-nums" style={{ color: "#1E2D28" }}>{formatVnd(dataPoint.revenue, locale)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: EXPENSE_COLOR }} />
            <span style={{ color: "#5A7A6E" }}>{t("finance.kpi.expense")}</span>
          </span>
          <span className="font-semibold tabular-nums" style={{ color: "#1E2D28" }}>{formatVnd(dataPoint.expense, locale)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 mt-1" style={{ borderTop: "1px dashed rgba(196,222,213,0.6)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 rounded-sm" style={{ background: PROFIT_COLOR }} />
            <span style={{ color: "#5A7A6E" }}>{t("finance.kpi.netProfit")}</span>
          </span>
          <span
            className="font-bold tabular-nums"
            style={{ color: dataPoint.profit >= 0 ? PROFIT_COLOR : EXPENSE_COLOR }}
          >
            {formatVnd(dataPoint.profit, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RevenueExpenseChart({ data = [], loading = false }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const chartData = useMemo(
    () => (data ?? []).map((row) => ({
      ...row,
      monthLabel: row.month,
    })),
    [data]
  );

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden h-full"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
      <div
        className="px-5 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: BRAND_GREEN }} />
          <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
            {t("finance.charts.monthlyTrend")}
          </h3>
        </div>
      </div>
      <div className="flex-1 px-2 pb-2 pt-3 min-h-[280px]">
        {loading ? (
          <div className="h-full w-full rounded-xl animate-pulse" style={{ background: "#EAF4F0" }} />
        ) : chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <TrendingUp className="w-6 h-6" style={{ color: BRAND_GREEN }} />
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("finance.charts.empty")}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity={0.55} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(196,222,213,0.4)" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: "#5A7A6E" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatVndCompact(v, locale)} tick={{ fontSize: 11, fill: "#5A7A6E" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip t={t} locale={locale} />} cursor={{ fill: "rgba(59,181,130,0.06)" }} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(v) => <span style={{ color: "#5A7A6E" }}>{v}</span>}
              />
              <Bar
                dataKey="revenue"
                name={t("finance.kpi.revenue")}
                fill="url(#revenueGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="expense"
                name={t("finance.kpi.expense")}
                fill="url(#expenseGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Line
                dataKey="profit"
                name={t("finance.kpi.netProfit")}
                type="monotone"
                stroke={PROFIT_COLOR}
                strokeWidth={2.5}
                dot={{ r: 3, fill: PROFIT_COLOR }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
