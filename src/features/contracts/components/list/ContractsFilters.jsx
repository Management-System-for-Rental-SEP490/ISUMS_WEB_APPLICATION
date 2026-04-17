import React from "react";
import { Search, Filter, ArrowDownNarrowWide, ArrowUpNarrowWide, RefreshCw } from "lucide-react";
import { Select } from "antd";

const QUICK_FILTERS = [
  { value: "PENDING_TENANT_REVIEW", label: "Chờ khách thuê xác nhận", dotColor: "#2096d8" },
  { value: "READY",                 label: "Chờ chủ nhà ký",          dotColor: "#3bb582" },
  { value: "DRAFT",                 label: "Bản nháp",                 dotColor: "#5A7A6E" },
];

const STATUSES = [
  { value: "all",                   label: "Toàn bộ" },
  { value: "DRAFT",                 label: "Bản nháp" },
  { value: "PENDING_TENANT_REVIEW", label: "Chờ khách thuê xác nhận" },
  { value: "READY",                 label: "Chờ chủ nhà ký" },
  { value: "IN_PROGRESS",           label: "Chờ khách thuê ký" },
  { value: "COMPLETED",             label: "Đã hoàn thành" },
  { value: "CANCELLED_BY_TENANT",   label: "Khách thuê đã huỷ" },
  { value: "CANCELLED_BY_LANDLORD", label: "Chủ nhà đã huỷ" },
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
  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
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
              placeholder="Tìm theo số hợp đồng, khách thuê, bất động sản..."
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
              title="Làm mới danh sách"
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
              {sortDir === "DESC" ? "Mới nhất" : "Cũ nhất"}
            </button>

            <div
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
              style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#5A7A6E" }}
            >
              <Filter className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
              Bộ lọc nhanh
            </div>

            <Select
              value={filterStatus}
              onChange={onFilter}
              options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              style={{ width: 220 }}
            />
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px]" style={{ color: "#5A7A6E" }}>
          <span className="hidden sm:inline" style={{ color: "#5A7A6E", opacity: 0.7 }}>Gợi ý:</span>
          {QUICK_FILTERS.map((qf) => {
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
                {qf.label}
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
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
