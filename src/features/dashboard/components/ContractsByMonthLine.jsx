import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { CONTRACTS_BY_MONTH_DATA } from "../mock/dashboardMockData";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold shadow-lg"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", color: "#1E2D28" }}
    >
      <p style={{ color: "#5A7A6E" }}>{label}</p>
      <p style={{ color: "#3bb582" }}>{payload[0].value} hợp đồng</p>
    </div>
  );
}

export default function ContractsByMonthLine() {
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
        Hợp đồng theo tháng
      </p>
      <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
        Số hợp đồng mới tạo trong năm 2025
      </p>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CONTRACTS_BY_MONTH_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="contractGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3bb582" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#3bb582" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,222,213,0.5)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#8ab5a3" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8ab5a3" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(59,181,130,0.2)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="contracts"
              stroke="#3bb582"
              strokeWidth={2.5}
              fill="url(#contractGradient)"
              dot={{ r: 3, fill: "#3bb582", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#3bb582", stroke: "#FAFFFE", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
