import { useState } from "react";
import { Search, ChevronDown, Download, Phone, Wrench, HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import {
  ISSUE_TYPE_CONFIG,
  ISSUE_STATUS_CONFIG,
  ISSUE_STATUS_OPTIONS,
  ISSUE_TYPE_OPTIONS,
} from "../constants/issue.constants";

const PAGE_SIZE = 8;

// TODO: thay bằng data thật từ API khi có hook
const issues = [];

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-teal-400 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function IssueRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);

  const filtered = issues.filter((i) => {
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchType   = !typeFilter   || i.type   === typeFilter;
    const matchSearch = !search       || i.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setStatusFilter(""); setTypeFilter(""); setSearch(""); setPage(1); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yêu cầu sửa chữa</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý tất cả yêu cầu sửa chữa và thắc mắc từ khách thuê.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Lọc</span>
          <FilterSelect
            value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}
            placeholder="Tất cả trạng thái"
            options={ISSUE_STATUS_OPTIONS}
          />
          <FilterSelect
            value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }}
            placeholder="Loại yêu cầu"
            options={ISSUE_TYPE_OPTIONS}
          />
          {(statusFilter || typeFilter || search) && (
            <button onClick={clearFilters} className="text-sm text-teal-600 hover:text-teal-700 font-medium ml-1">
              Xóa bộ lọc
            </button>
          )}
          <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-teal-400 transition">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm yêu cầu..."
              className="bg-transparent text-sm outline-none w-44 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">Chi tiết yêu cầu</th>
                <th className="px-5 py-3">Khách thuê & BĐS</th>
                <th className="px-5 py-3">Thiết bị</th>
                <th className="px-5 py-3">Nhân viên</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((issue) => {
                const type   = ISSUE_TYPE_CONFIG[issue.type]     ?? ISSUE_TYPE_CONFIG.REPAIR;
                const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
                const TypeIcon = issue.type === "REPAIR" ? Wrench : HelpCircle;
                return (
                  <tr key={issue.id} className="hover:bg-gray-50/60 transition group">
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="text-[11px] font-mono text-teal-600 mb-0.5">#{issue.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-semibold text-gray-800 text-sm leading-snug truncate">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{issue.description}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Tạo {dayjs(issue.createdAt).format("DD/MM/YYYY")} · {dayjs(issue.createdAt).format("HH:mm")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={issue.tenantName ?? "?"} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{issue.tenantName}</p>
                          <p className="text-xs text-gray-400">{issue.tenantRole}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">🏠 {issue.houseName} · {issue.houseUnit}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{issue.assetName}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${type.cls}`}>
                            {type.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {issue.staffName ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700">{issue.staffName}</p>
                          <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 rounded-md w-fit">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{issue.staffPhone}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-teal-300 hover:text-teal-600 transition opacity-0 group-hover:opacity-100">
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">Không có yêu cầu nào</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} yêu cầu
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p} onClick={() => setPage(p)}
                  className={["w-8 h-8 rounded-lg text-sm font-medium transition", p === page ? "bg-teal-500 text-white" : "text-gray-500 hover:bg-gray-100"].join(" ")}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
