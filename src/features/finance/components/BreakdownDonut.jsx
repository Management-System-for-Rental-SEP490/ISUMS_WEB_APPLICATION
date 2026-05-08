import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { PieChart as PieIcon } from "lucide-react";
import { formatVnd } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const REVENUE_COLORS = ["#10b981", "#06b6d4", "#3b82f6"];
const EXPENSE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6"];

function getCategoryColor(variant, index) {
  const palette = variant === "expense" ? EXPENSE_COLORS : REVENUE_COLORS;
  return palette[index % palette.length];
}

function CustomTooltip({ active, payload, locale }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: "rgba(255,255,255,0.98)",
        border: "1px solid #C4DED5",
        boxShadow: "0px 4px 12px rgba(16,24,40,0.10)",
      }}
    >
      <p className="font-semibold mb-1" style={{ color: "#1E2D28" }}>{item.label}</p>
      <p style={{ color: "#5A7A6E" }}>{formatVnd(item.amount, locale)}</p>
      <p className="text-[11px]" style={{ color: "#8ab5a3" }}>{item.percent.toFixed(1)}%</p>
    </div>
  );
}

export default function BreakdownDonut({
  variant = "revenue",
  data = [],
  loading = false,
  total = 0,
  title,
}) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;

  const enriched = useMemo(() => {
    return (data ?? [])
      .filter((row) => row?.amount > 0)
      .map((row, index) => ({
        ...row,
        label: t(`finance.category.${row.category}`, { defaultValue: row.category }),
        color: getCategoryColor(variant, index),
      }));
  }, [data, variant, t]);

  const isEmpty = !loading && (enriched.length === 0 || total <= 0);

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
          <PieIcon className="w-4 h-4" style={{ color: BRAND_GREEN }} />
          <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{title}</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-3 min-h-[240px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full animate-pulse" style={{ background: "#EAF4F0" }} />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <PieIcon className="w-6 h-6" style={{ color: BRAND_GREEN }} />
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("finance.charts.empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enriched}
                    dataKey="amount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {enriched.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip locale={locale} />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#8ab5a3" }}>
                  {t("finance.kpi.total", { defaultValue: "Tổng" })}
                </p>
                <p className="text-base font-bold mt-0.5 tabular-nums" style={{ color: "#1E2D28" }}>{formatVnd(total, locale)}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {enriched.map((entry) => (
                <li key={entry.category} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="truncate" style={{ color: "#5A7A6E" }}>{entry.label}</span>
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold tabular-nums" style={{ color: "#1E2D28" }}>{formatVnd(entry.amount, locale)}</span>
                    <span className="text-[10px] font-medium tabular-nums" style={{ color: "#8ab5a3" }}>{entry.percent.toFixed(1)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
