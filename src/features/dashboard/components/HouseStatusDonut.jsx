import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { HOUSE_STATUS_DATA } from "../mock/dashboardMockData";

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
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{
        background: "#FAFFFE",
        border: "1px solid #C4DED5",
        boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A7A6E" }}>
        Tình trạng BĐS
      </p>
      <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
        Phân bổ {total} bất động sản
      </p>

      <div className="relative flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={HOUSE_STATUS_DATA}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
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
          <span className="text-3xl font-heading font-bold" style={{ color: "#1E2D28" }}>{total}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Tổng</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {HOUSE_STATUS_DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-xs" style={{ color: "#5A7A6E" }}>{item.name}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: "#1E2D28" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
