import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "../utils/currency";

export default function OutstandingAlert({ amount = 0, count = 0, rows = [], loading = false }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const dateFormat = locale?.startsWith("en") ? "MM/DD/YYYY" : "DD/MM/YYYY";
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (loading || count === 0 || amount <= 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)",
        border: "1px solid rgba(245,158,11,0.40)",
      }}
    >
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
            <AlertTriangle className="w-5 h-5" style={{ color: "#f59e0b" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "#92400e" }}>
              {t("finance.outstanding.title", { defaultValue: "Có hóa đơn quá hạn" })}
            </p>
            <p className="text-xs" style={{ color: "#a16207" }}>
              {t("finance.outstanding.summary", {
                count,
                amount: formatVnd(amount, locale),
                defaultValue: `${count} hóa đơn — tổng ${formatVnd(amount, locale)}`,
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold rounded-lg px-3 py-1.5 transition flex items-center gap-1.5"
          style={{ background: "rgba(245,158,11,0.20)", color: "#92400e" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.30)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.20)")}
        >
          {expanded
            ? t("finance.outstanding.collapse", { defaultValue: "Thu gọn" })
            : t("finance.outstanding.expand", { defaultValue: "Xem chi tiết" })}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && rows.length > 0 && (
        <div className="px-5 pb-4">
          <ul className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(245,158,11,0.30)" }}>
            {rows.slice(0, 12).map((row) => (
              <li
                key={row.invoiceId}
                className="px-4 py-2.5 flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: "#1E2D28" }}>
                    {t(`finance.category.${row.type}`, { defaultValue: row.type })} · {row.houseName ?? `#${row.houseId?.slice(0, 8) ?? ""}`}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "#8ab5a3" }}>
                    {row.tenantEmail ?? "—"} • {t("finance.outstanding.due", { defaultValue: "Hạn" })} {row.dueDate ? dayjs(row.dueDate).format(dateFormat) : "—"}
                    {" · "}
                    {row.daysOverdue > 0
                      ? t("finance.outstanding.overdueDays", { days: row.daysOverdue, defaultValue: `Quá ${row.daysOverdue} ngày` })
                      : t("finance.outstanding.dueToday", { defaultValue: "Đến hạn hôm nay" })}
                  </p>
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: "#f59e0b" }}>
                  {formatVnd(row.amount, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (row.contractId) navigate(`/contracts/${row.contractId}`);
                    else if (row.houseId) navigate(`/houses/${row.houseId}`);
                  }}
                  className="p-1 rounded-lg transition flex-shrink-0"
                  style={{ color: "#5A7A6E" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.15)";
                    e.currentTarget.style.color = "#f59e0b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#5A7A6E";
                  }}
                  title={t("finance.outstanding.viewInvoice", { defaultValue: "Xem hợp đồng" })}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
