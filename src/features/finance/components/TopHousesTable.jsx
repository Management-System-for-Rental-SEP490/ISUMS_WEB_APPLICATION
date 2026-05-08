import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

function ProfitBar({ ratio, positive }) {
  const width = Math.max(2, Math.min(100, Math.abs(ratio) * 100));
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

export default function TopHousesTable({ rows = [], loading = false }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const navigate = useNavigate();

  const maxAbsProfit = rows.reduce((max, r) => Math.max(max, Math.abs(Number(r.profit) || 0)), 0);

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden h-full"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
      <div
        className="px-5 py-3.5 flex items-center gap-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}
      >
        <Trophy className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
          {t("finance.table.topHouses")}
        </h3>
      </div>

      <div className="overflow-auto flex-1 min-h-[200px]">
        {loading ? (
          <ul>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-2.5 w-1/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                </div>
                <div className="h-3 w-16 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <Trophy className="w-6 h-6" style={{ color: BRAND_GREEN }} />
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("finance.table.empty")}</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead style={{ background: "#F8FBF9" }}>
              <tr style={{ color: "#5A7A6E" }}>
                <th className="text-left font-semibold px-4 py-2.5">#</th>
                <th className="text-left font-semibold px-2 py-2.5">{t("finance.table.house")}</th>
                <th className="text-right font-semibold px-2 py-2.5">{t("finance.kpi.revenue")}</th>
                <th className="text-right font-semibold px-2 py-2.5">{t("finance.kpi.expense")}</th>
                <th className="text-right font-semibold px-2 py-2.5">{t("finance.kpi.netProfit")}</th>
                <th className="text-left font-semibold px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const positive = (row.profit ?? 0) >= 0;
                const ratio = maxAbsProfit > 0 ? Math.abs(row.profit) / maxAbsProfit : 0;
                return (
                  <tr
                    key={row.houseId}
                    className="transition-colors duration-150 group"
                    style={{
                      borderBottom: "1px solid rgba(196,222,213,0.3)",
                      cursor: row.houseId ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FAF6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={row.houseId ? () => navigate(`/houses/${row.houseId}`) : undefined}
                  >
                    <td className="px-4 py-2.5 font-bold" style={{ color: "#8ab5a3" }}>
                      {i + 1}
                    </td>
                    <td className="px-2 py-2.5 min-w-0">
                      <p className="font-semibold truncate" style={{ color: "#1E2D28" }}>
                        {row.houseName ?? `#${row.houseId.slice(0, 8)}`}
                      </p>
                      {row.address && (
                        <p className="text-[10px] truncate" style={{ color: "#8ab5a3" }}>
                          {row.address}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: "#10b981" }}>
                      {formatVnd(row.revenue, locale)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: "#ef4444" }}>
                      {formatVnd(row.expense, locale)}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span
                        className="font-bold tabular-nums"
                        style={{ color: positive ? "#3b82f6" : "#ef4444" }}
                      >
                        {formatVnd(row.profit, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ProfitBar ratio={ratio} positive={positive} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
