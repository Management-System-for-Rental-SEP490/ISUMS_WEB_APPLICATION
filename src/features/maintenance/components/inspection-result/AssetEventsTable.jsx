import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { Pagination } from "antd";
import AssetRow from "./AssetRow";

const PAGE_SIZE = 5;

export default function AssetEventsTable({ events = [], loading }) {
  const { t } = useTranslation("common");
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pageItems = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
    >
      {/* Header bar */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: "#3bb582" }} />
          <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>
            {t("inspection.assetEvents.title")}
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EAF4F0", color: "#3bb582" }}>
              {String(events.length).padStart(2, "0")}
            </span>
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(196,222,213,0.5)" }}>
            {[
              t("inspection.assetEvents.colName"),
              t("inspection.assetEvents.colEventType"),
              t("inspection.assetEvents.colCondition"),
              t("inspection.assetEvents.colNote"),
              t("inspection.assetEvents.colTime"),
              "",
            ].map((h, i) => (
              <th
                key={i}
                className={`py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${i === 0 ? "pl-5" : ""} pr-4`}
                style={{ color: "#5A7A6E" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}>
                {[...Array(6)].map((__, j) => (
                  <td key={j} className="pl-5 pr-4 py-4">
                    <div className="h-3 rounded animate-pulse" style={{ background: "#EAF4F0", width: j === 0 ? 120 : 80 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : pageItems.length > 0 ? (
            pageItems.map((event) => <AssetRow key={event.id} event={event} />)
          ) : (
            <tr>
              <td colSpan={6} className="py-14 text-center">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: "#EAF4F0" }}>
                  <Package className="w-5 h-5" style={{ color: "#5A7A6E" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{t("inspection.assetEvents.empty")}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {events.length > PAGE_SIZE && (
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: "1px solid rgba(196,222,213,0.5)" }}>
          <Pagination
            current={page}
            total={events.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
}
