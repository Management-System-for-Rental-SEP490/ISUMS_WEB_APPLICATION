import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CONTRACT_STATUS_DATA } from "../mock/dashboardMockData";

const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

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
          Phân loại hợp đồng
        </p>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E2D28" }}>
          {total} hợp đồng theo trạng thái
        </p>

        {/* Recharts horizontal bar chart */}
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CONTRACT_STATUS_DATA}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(196,222,213,0.4)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#8ab5a3" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#5A7A6E" }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(196,222,213,0.12)" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {CONTRACT_STATUS_DATA.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
