import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const STATUS_COLOR = {
  COMPLETED:             "#3bb582",
  IN_PROGRESS:           "#2096d8",
  PENDING_TENANT_REVIEW: "#f59e0b",
  READY:                 "#8b5cf6",
  PENDING_TERMINATION:   "#f97316",
  DRAFT:                 "#8ab5a3",
  INSPECTION_DONE:       "#06b6d4",
  CANCELLED_BY_TENANT:   "#D95F4B",
};

function CustomTooltip({ active, payload, label, contractUnit }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold shadow-lg"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", color: "#1E2D28" }}
    >
      <p style={{ color: "#5A7A6E" }}>{label}</p>
      <p style={{ color: payload[0].payload.color }}>{payload[0].value} {contractUnit}</p>
    </div>
  );
}

export default function ContractStatusBar({ breakdown = [], loading = false }) {
  const { t } = useTranslation("common");

  const contractUnit = t("dashboard.contractStatus.contractUnit");

  const chartData = breakdown.map((d) => ({
    label: t(`dashboard.contractStatus.${d.status}`, { defaultValue: d.status }),
    value: d.count,
    color: STATUS_COLOR[d.status] ?? "#8ab5a3",
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div
      className="rounded-2xl flex flex-col h-full overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #C4DED5",
        boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08), 0px 1px 2px 0px rgba(16,24,40,0.04)",
      }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[1px] mb-0.5" style={{ color: "#6B7280" }}>
          {t("dashboard.contractStatus.title")}
        </p>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
          {loading
            ? t("dashboard.contractStatus.loading")
            : t("dashboard.contractStatus.subtitle", { total })}
        </p>

        <div className="flex-1 min-h-[200px]">
          {loading ? (
            <div className="h-full rounded-xl animate-pulse" style={{ background: "#EAF4F0" }} />
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs" style={{ color: "#8ab5a3" }}>{t("dashboard.contractStatus.noData")}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                barSize={14}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(196,222,213,0.4)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8ab5a3" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#5A7A6E" }} axisLine={false} tickLine={false} width={96} />
                <Tooltip content={<CustomTooltip contractUnit={contractUnit} />} cursor={{ fill: "rgba(196,222,213,0.12)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
