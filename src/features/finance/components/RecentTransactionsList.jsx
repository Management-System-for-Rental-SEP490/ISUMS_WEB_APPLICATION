import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const REVENUE_TYPES = new Set(["MONTHLY_RENT", "UTILITY", "PENALTY", "DEPOSIT"]);

export default function RecentTransactionsList({ rows = [], loading = false }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const dateFormat = locale?.startsWith("en") ? "MM/DD/YYYY HH:mm" : "DD/MM/YYYY HH:mm";
  const navigate = useNavigate();
  const goToContext = (row) => {
    if (row.contractId) navigate(`/contracts/${row.contractId}`);
    else if (row.houseId) navigate(`/houses/${row.houseId}`);
  };

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
        <Receipt className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
          {t("finance.table.recentTransactions")}
        </h3>
      </div>

      <div className="overflow-auto flex-1 min-h-[200px]">
        {loading ? (
          <ul>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-2.5 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                </div>
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <Receipt className="w-6 h-6" style={{ color: BRAND_GREEN }} />
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("finance.table.empty")}</p>
          </div>
        ) : (
          <ul>
            {rows.map((row) => {
              const isRevenue = REVENUE_TYPES.has(row.type);
              const sign = isRevenue ? "+" : "−";
              const color = isRevenue ? "#10b981" : "#ef4444";
              const typeLabel = t(`finance.category.${row.type}`, { defaultValue: row.type });
              const clickable = !!(row.contractId || row.houseId);
              return (
                <li
                  key={row.invoiceId}
                  className="px-4 py-3 transition-colors duration-150 group"
                  style={{
                    borderBottom: "1px solid rgba(196,222,213,0.3)",
                    cursor: clickable ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FAF6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={clickable ? () => goToContext(row) : undefined}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={clickable ? (e) => { if (e.key === "Enter") goToContext(row); } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: `${color}1F`, color }}
                    >
                      {sign}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: "#1E2D28" }}>
                        {typeLabel}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "#8ab5a3" }}>
                        {row.houseName ?? `#${row.houseId?.slice(0, 8) ?? ""}`}
                        {row.tenantEmail ? ` • ${row.tenantEmail}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold tabular-nums" style={{ color }}>
                        {sign}{formatVnd(row.amount, locale)}
                      </p>
                      <p className="text-[10px]" style={{ color: "#8ab5a3" }}>
                        {row.paidAt ? dayjs(row.paidAt).format(dateFormat) : "—"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
