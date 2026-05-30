import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { formatVnd } from "../utils/currency";

const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

export default function RegionFinanceTable({ rows = [], regionNameById = {}, loading = false }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
      <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: "#2096d8" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
            {t("finance.region.title", { defaultValue: "Tài chính theo khu vực" })}
          </h3>
        </div>
        <span className="text-xs font-medium" style={{ color: "#5A7A6E" }}>
          {rows.length} {t("finance.region.count", { defaultValue: "khu vực" })}
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "#F1F8F5" }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: "#5A7A6E" }}>
            {t("finance.region.empty", { defaultValue: "Chưa có dữ liệu khu vực" })}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ color: "#5A7A6E", background: "#F6FBF8" }}>
              <tr>
                <th className="text-left font-semibold px-5 py-3">{t("finance.region.region", { defaultValue: "Khu vực" })}</th>
                <th className="text-right font-semibold px-3 py-3">{t("finance.summary.managedHouses")}</th>
                <th className="text-right font-semibold px-3 py-3">{t("finance.kpi.revenue")}</th>
                <th className="text-right font-semibold px-3 py-3">{t("finance.kpi.expense")}</th>
                <th className="text-right font-semibold px-3 py-3">{t("finance.kpi.netProfit")}</th>
                <th className="text-right font-semibold px-5 py-3">{t("finance.kpi.outstanding")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const name = regionNameById[row.regionId] || row.regionName || shortId(row.regionId);
                const profit = Number(row.netProfit) || 0;
                return (
                  <tr key={row.regionId} style={{ borderTop: "1px solid rgba(196,222,213,0.45)" }}>
                    <td className="px-5 py-3 font-semibold" style={{ color: "#1E2D28" }}>{name}</td>
                    <td className="px-3 py-3 text-right" style={{ color: "#5A7A6E" }}>{row.totalHouses ?? 0}</td>
                    <td className="px-3 py-3 text-right" style={{ color: "#1E2D28" }}>{formatVnd(row.totalRevenue ?? 0, locale)}</td>
                    <td className="px-3 py-3 text-right" style={{ color: "#1E2D28" }}>{formatVnd(row.totalExpense ?? 0, locale)}</td>
                    <td className="px-3 py-3 text-right font-semibold" style={{ color: profit >= 0 ? "#2E8B57" : "#D95F4B" }}>
                      {formatVnd(profit, locale)}
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: "#1E2D28" }}>
                      {formatVnd(row.outstandingAmount ?? 0, locale)}
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

function shortId(value) {
  return value ? `#${String(value).slice(0, 8)}` : "—";
}
