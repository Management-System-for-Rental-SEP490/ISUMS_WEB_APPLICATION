import React from "react";
import { Search, Filter } from "lucide-react";

export default function ContractsFilters({
  searchTerm,
  onSearch,
  filterStatus,
  onFilter,
}) {
  const statuses = [
    { value: "all", label: "Toàn bộ" },
    { value: "DRAFT", label: "Bản nháp" },
    { value: "PENDING_TENANT_REVIEW", label: "Chờ khách thuê xem xét" },
    { value: "READY", label: "Chờ chủ nhà ký" },
    { value: "IN_PROGRESS", label: "Chờ khách thuê ký" },
    { value: "COMPLETED", label: "Đã hoàn thành" },
    { value: "CANCELLED_BY_TENANT", label: "Khách thuê đã huỷ" },
    { value: "CANCELLED_BY_LANDLORD", label: "Chủ nhà đã huỷ" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số hợp đồng, khách thuê, bất động sản..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500/60 transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100 text-[11px] text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Bộ lọc nhanh
            </div>
            <select
              value={filterStatus}
              onChange={(e) => onFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500/60"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] text-slate-500">
          <span className="hidden sm:inline text-slate-400">Gợi ý:</span>
          <button
            type="button"
            onClick={() => onFilter("PENDING_TENANT_REVIEW")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "PENDING_TENANT_REVIEW"
                ? "border-sky-500/70 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            } transition-colors`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Chờ khách thuê xác nhận
          </button>
          <button
            type="button"
            onClick={() => onFilter("READY")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "READY"
                ? "border-blue-500/70 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            } transition-colors`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Chờ chủ nhà ký
          </button>
          <button
            type="button"
            onClick={() => onFilter("DRAFT")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "DRAFT"
                ? "border-slate-700/70 bg-slate-900 text-slate-50"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            } transition-colors`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            Bản nháp
          </button>
          {filterStatus !== "all" && (
            <button
              type="button"
              onClick={() => onFilter("all")}
              className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
