import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CONTRACT_STATUS_DATA } from "../mock/dashboardMockData";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-semibold shadow-lg"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", color: "#1E2D28" }}
    >
      <p style={{ color: "#5A7A6E" }}>{label}</p>
      <p style={{ color: payload[0].payload.color }}>{payload[0].value} hợp đồng</p>
    </div>
  );
}

export default function ContractStatusBar() {
  const total = CONTRACT_STATUS_DATA.reduce((s, d) => s + d.value, 0);

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
        Phân loại hợp đồng
      </p>
      <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
        {total} hợp đồng theo trạng thái
      </p>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CONTRACT_STATUS_DATA}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,222,213,0.5)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#8ab5a3" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8ab5a3" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(196,222,213,0.15)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {CONTRACT_STATUS_DATA.map((entry) => (
                <Cell key={entry.label} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
