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
    { value: "active", label: "Đang hiệu lực" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "draft", label: "Bản nháp" },
    { value: "expired", label: "Đã hết hạn" },
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
            onClick={() => onFilter("active")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "active"
                ? "border-emerald-500/70 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            } transition-colors`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Đang hiệu lực
          </button>
          <button
            type="button"
            onClick={() => onFilter("pending")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "pending"
                ? "border-amber-500/70 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            } transition-colors`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Chờ duyệt
          </button>
          <button
            type="button"
            onClick={() => onFilter("draft")}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
              filterStatus === "draft"
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
