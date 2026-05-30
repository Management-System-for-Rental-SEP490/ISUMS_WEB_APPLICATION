import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, ArrowDownNarrowWide, ArrowUpNarrowWide, RefreshCw } from "lucide-react";
import { Select } from "antd";

const QUICK_FILTER_KEYS = [
  { value: "PENDING_TENANT_REVIEW", tKey: "qfPendingTenant", dotColor: "#2096d8" },
  { value: "READY",                 tKey: "qfReady",         dotColor: "#3bb582" },
  { value: "DRAFT",                 tKey: "qfDraft",         dotColor: "#5A7A6E" },
];

const STATUS_KEYS = [
  { value: "all",                   tKey: "statusAll" },
  { value: "DRAFT",                 tKey: "statusDraft" },
  { value: "PENDING_TENANT_REVIEW", tKey: "statusPendingTenant" },
  { value: "READY",                 tKey: "statusReady" },
  { value: "IN_PROGRESS",           tKey: "statusInProgress" },
  { value: "COMPLETED",             tKey: "statusCompleted" },
  { value: "CANCELLED_BY_TENANT",   tKey: "statusCancelledByTenant" },
  { value: "CANCELLED_BY_LANDLORD", tKey: "statusCancelledByLandlord" },
];

export default function ContractsFilters({
  searchTerm,
  onSearch,
  filterStatus,
  onFilter,
  sortDir,
  onToggleSortDir,
  onRefresh,
  refreshing,
}) {
  const { t } = useTranslation("common");

  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#5A7A6E" }}
            />
            <input
              type="text"
              placeholder={t("contracts.filters.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none transition"
              style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
              onFocus={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Refresh */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              title={t("contracts.filters.refresh")}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition disabled:opacity-50"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} style={{ color: "#5A7A6E" }} />
            </button>

            {/* Sort toggle */}
            <button
              type="button"
              onClick={onToggleSortDir}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
            >
              {sortDir === "DESC" ? (
                <ArrowDownNarrowWide className="w-4 h-4" style={{ color: "#3bb582" }} />
              ) : (
                <ArrowUpNarrowWide className="w-4 h-4" style={{ color: "#3bb582" }} />
              )}
              {sortDir === "DESC" ? t("contracts.filters.newest") : t("contracts.filters.oldest")}
            </button>

            <div
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
              style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#5A7A6E" }}
            >
              <Filter className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
              {t("contracts.filters.quickFilters")}
            </div>

            <Select
              value={filterStatus}
              onChange={onFilter}
              options={STATUS_KEYS.map((s) => ({ value: s.value, label: t(`contracts.filters.${s.tKey}`) }))}
              style={{ width: 220 }}
            />
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px]" style={{ color: "#5A7A6E" }}>
          <span className="hidden sm:inline" style={{ color: "#5A7A6E", opacity: 0.7 }}>{t("contracts.filters.suggestions")}</span>
          {QUICK_FILTER_KEYS.map((qf) => {
            const active = filterStatus === qf.value;
            return (
              <button
                key={qf.value}
                type="button"
                onClick={() => onFilter(qf.value)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors"
                style={active
                  ? { border: `1px solid ${qf.dotColor}`, background: `${qf.dotColor}18`, color: qf.dotColor, fontWeight: 600 }
                  : { border: "1px solid #C4DED5", background: "#EAF4F0", color: "#5A7A6E" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: qf.dotColor }} />
                {t(`contracts.filters.${qf.tKey}`)}
              </button>
            );
          })}
          {filterStatus !== "all" && (
            <button
              type="button"
              onClick={() => onFilter("all")}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition"
              style={{ border: "1px solid transparent", color: "#D95F4B" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(217,95,75,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {t("contracts.filters.clearFilter")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
