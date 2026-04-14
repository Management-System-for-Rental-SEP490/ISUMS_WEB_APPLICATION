import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { HOUSE_STATUS_DATA } from "../mock/dashboardMockData";

const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold shadow-lg"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", color: "#1E2D28" }}
    >
      {name}: <span style={{ color: payload[0].payload.color }}>{value}</span>
    </div>
  );
}

export default function HouseStatusDonut() {
  const total = HOUSE_STATUS_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div
      className="rounded-2xl flex flex-col h-full overflow-hidden"
      style={{
        background: "#FAFFFE",
        border: "1px solid #C4DED5",
        boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08), 0px 1px 2px 0px rgba(16,24,40,0.04)",
      }}
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />

      <div className="p-5 md:p-6 flex flex-col flex-1">
        {/* Header */}
        <p className="text-[11px] font-bold uppercase tracking-[1px] mb-0.5" style={{ color: "#6B7280" }}>
          Tình trạng BĐS
        </p>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
          Phân bổ {total} bất động sản
        </p>

        {/* Donut */}
        <div className="relative flex-1 min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={HOUSE_STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {HOUSE_STATUS_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-heading font-bold leading-none" style={{ color: "#1E2D28" }}>
              {total}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "#5A7A6E" }}>
              Tổng
            </span>
          </div>
        </div>

        {/* Legend with percentage progress bars */}
        <div className="mt-4 space-y-2.5">
          {HOUSE_STATUS_DATA.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs" style={{ color: "#5A7A6E" }}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "#1E2D28" }}>{item.value}</span>
                    <span className="text-[11px] w-7 text-right" style={{ color: "#8ab5a3" }}>{pct}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 rounded-full" style={{ background: "#EAF4F0" }}>
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
