import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const BRAND_GREEN    = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)";

const PERIOD_TABS = [
  { key: "3M",  label: "3T"  },
  { key: "6M",  label: "6T"  },
  { key: "12M", label: "12T" },
];

/** "2026-03" → "T3/26" */
function formatMonth(m) {
  const [year, month] = (m ?? "").split("-");
  if (!year || !month) return m;
  return `T${parseInt(month, 10)}/${year.slice(2)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[10px] px-3.5 py-2.5 text-xs shadow-lg"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", color: "#1E2D28" }}
    >
      <p className="font-medium mb-0.5" style={{ color: "#5A7A6E" }}>{label}</p>
      <p className="text-base font-bold" style={{ color: BRAND_GREEN }}>
        {payload[0].value}
        <span className="text-xs font-normal ml-1" style={{ color: "#8ab5a3" }}>hợp đồng</span>
      </p>
    </div>
  );
}

export default function ContractsByMonthLine({ timeSeries = [], period = "6M", onPeriodChange, loading = false }) {
  const chartData = timeSeries.map((d) => ({ month: formatMonth(d.month), count: d.count }));

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
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1px] mb-0.5" style={{ color: "#6B7280" }}>
              Hợp đồng theo tháng
            </p>
            <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
              Số hợp đồng tạo mới theo kỳ
            </p>
          </div>

          <div className="flex items-center p-0.5 rounded-lg gap-0.5" style={{ background: "#EAF4F0" }}>
            {PERIOD_TABS.map((tab) => {
              const isActive = period === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onPeriodChange?.(tab.key)}
                  className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150"
                  style={{
                    background: isActive ? BRAND_GRADIENT : "transparent",
                    color: isActive ? "#FFFFFF" : "#5A7A6E",
                    boxShadow: isActive ? "0 1px 4px rgba(59,181,130,0.3)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-[200px]">
          {loading ? (
            <div className="h-full rounded-xl animate-pulse" style={{ background: "#EAF4F0" }} />
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs" style={{ color: "#8ab5a3" }}>Không có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="contractAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BRAND_GREEN} stopOpacity={0.20} />
                    <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8ab5a3" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8ab5a3" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(59,181,130,0.15)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={BRAND_GREEN}
                  strokeWidth={2.5}
                  fill="url(#contractAreaGrad)"
                  dot={{ r: 4, fill: "#FFFFFF", stroke: BRAND_GREEN, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#FFFFFF", stroke: BRAND_GREEN, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
