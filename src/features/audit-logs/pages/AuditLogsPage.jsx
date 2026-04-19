import { useState, useEffect, useCallback } from "react";
import { Pagination, Select } from "antd";
import { Search, Filter, RotateCcw } from "lucide-react";
import { getAuditLogs } from "../api/audit-logs.api";
import { LoadingSpinner } from "../../../components/shared/Loading";
import AuditLogDetailDrawer from "../components/AuditLogDetailDrawer";

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "SUCCESS", label: "SUCCESS" },
  { value: "FAILURE", label: "FAILURE" },
];

const SERVICE_OPTIONS = [
  "api-gateway",
  "ai-service",
  "asset-service",
  "audit-log-service",
  "discovery-server",
  "econtract-service",
  "econtract-vn-service",
  "house-service",
  "issue-service",
  "maintenance-service",
  "notification-service",
  "payment-service",
  "schedule-service",
  "user-service",
].map((s) => ({ value: s, label: s }));

// Known @AuditAction values + common HTTP-auto-generated patterns
const ACTION_OPTIONS = [
  // ASSET service manual actions
  "ASSET.LIST", "ASSET.CREATE", "ASSET.UPDATE", "ASSET.DELETE", "ASSET.VIEW",
  "ASSET.LIST_BY_HOUSE", "ASSET.COUNT_BY_HOUSE_AREA", "ASSET.LIST_BY_HOUSE_AREA",
  "ASSET.TRANSFER", "ASSET.IMAGE_UPLOAD", "ASSET.IMAGE_DELETE",
  "ASSET.CONDITION_BATCH_UPDATE", "ASSET.CONFIRM",
  // Common HTTP auto patterns
  "HOUSE.LIST", "HOUSE.VIEW", "HOUSE.CREATE", "HOUSE.UPDATE", "HOUSE.DELETE",
  "ECONTRACT.LIST", "ECONTRACT.VIEW", "ECONTRACT.CREATE", "ECONTRACT.UPDATE", "ECONTRACT.DELETE",
  "USER.LIST", "USER.VIEW", "USER.CREATE", "USER.UPDATE", "USER.DELETE",
  "ISSUE.LIST", "ISSUE.VIEW", "ISSUE.CREATE", "ISSUE.UPDATE", "ISSUE.DELETE",
  "MAINTENANCE.LIST", "MAINTENANCE.VIEW", "MAINTENANCE.CREATE", "MAINTENANCE.UPDATE",
  "SCHEDULE.LIST", "SCHEDULE.VIEW", "SCHEDULE.CREATE", "SCHEDULE.UPDATE",
  "NOTIFICATION.LIST", "NOTIFICATION.VIEW",
].map((a) => ({ value: a, label: a }));

const STATUS_STYLE = {
  SUCCESS: { bg: "rgba(59,181,130,0.10)", color: "#3bb582" },
  FAILURE: { bg: "rgba(217,95,75,0.10)",  color: "#D95F4B" },
};

const EMPTY_FILTERS = {
  action: null,
  resourceType: "",
  serviceName: null,
  status: null,
  actorUserId: "",
  traceId: "",
  requestId: "",
};

const PAGE_SIZE = 10;

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  if (!value) return <span style={{ color: "#5A7A6E" }}>—</span>;
  const s = STATUS_STYLE[value.toUpperCase()] ?? { bg: "rgba(90,122,110,0.08)", color: "#5A7A6E" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={s}>
      {value}
    </span>
  );
}

function FilterInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-xl text-sm outline-none transition"
        style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28", height: 38 }}
        onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
        onBlur={(e) => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{label}</label>
      <Select
        value={value || undefined}
        onChange={(v) => onChange(v ?? null)}
        options={options}
        placeholder={placeholder}
        allowClear
        showSearch
        filterOption={(input, opt) =>
          (opt?.value ?? "").toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: "100%" }}
        styles={{
          popup: { root: { zIndex: 1200 } },
        }}
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const fetchLogs = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== null && v !== ""),
      );
      const result = await getAuditLogs({ ...params, page: currentPage - 1, size: PAGE_SIZE });

      if (result && "content" in result) {
        setData({ items: result.content ?? [], total: result.totalElements ?? 0 });
      } else if (result && "items" in result) {
        setData({ items: result.items ?? [], total: result.total ?? 0 });
      } else if (Array.isArray(result)) {
        setData({ items: result, total: result.length });
      } else {
        setData({ items: [], total: 0 });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(appliedFilters, page);
  }, [appliedFilters, page, fetchLogs]);

  const handleSearch = () => { setPage(1); setAppliedFilters(filters); };
  const handleReset  = () => { setFilters(EMPTY_FILTERS); setPage(1); setAppliedFilters(EMPTY_FILTERS); };
  const setFilter    = (key) => (val) => setFilters((prev) => ({ ...prev, [key]: val }));

  const logs = data.items;
  const hasActiveFilter = Object.values(appliedFilters).some((v) => v !== null && v !== "");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Audit Logs</h2>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>Lịch sử hoạt động hệ thống</p>
        </div>
        {hasActiveFilter && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582", border: "1px solid rgba(59,181,130,0.25)" }}>
            <Filter className="w-3.5 h-3.5" /> Đang lọc kết quả
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div className="rounded-2xl p-5"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#5A7A6E" }}>
          <Filter className="w-3.5 h-3.5" /> Bộ lọc
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Select fields */}
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={setFilter("status")}
            options={STATUS_OPTIONS}
            placeholder="Tất cả"
          />
          <FilterSelect
            label="Service"
            value={filters.serviceName}
            onChange={setFilter("serviceName")}
            options={SERVICE_OPTIONS}
            placeholder="Chọn service..."
          />
          <FilterSelect
            label="Action"
            value={filters.action}
            onChange={setFilter("action")}
            options={ACTION_OPTIONS}
            placeholder="Chọn action..."
          />

          {/* Text fields */}
          <FilterInput label="Resource Type" value={filters.resourceType} onChange={setFilter("resourceType")} placeholder="ASSET, HOUSE, USER..." />
          <FilterInput label="Actor User ID" value={filters.actorUserId}  onChange={setFilter("actorUserId")}  placeholder="UUID của actor..." />
          <FilterInput label="Trace ID"      value={filters.traceId}      onChange={setFilter("traceId")}      placeholder="trace-..." />
          <FilterInput label="Request ID"    value={filters.requestId}    onChange={setFilter("requestId")}    placeholder="req-..." />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Search className="w-4 h-4" /> Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold flex-1" style={{ color: "#D95F4B" }}>{error}</p>
          <button onClick={() => fetchLogs(appliedFilters, page)} className="text-xs font-semibold underline" style={{ color: "#D95F4B" }}>Thử lại</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl py-16 flex justify-center" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
          <LoadingSpinner size="lg" showLabel label="Đang tải audit logs..." />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          {logs.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}>
                <Search className="w-7 h-7" style={{ color: "#3bb582" }} />
              </div>
              <p className="font-semibold" style={{ color: "#1E2D28" }}>
                {hasActiveFilter ? "Không tìm thấy log phù hợp" : "Chưa có audit log nào"}
              </p>
              <p className="text-sm" style={{ color: "#5A7A6E" }}>
                {hasActiveFilter ? "Thử thay đổi bộ lọc" : "Dữ liệu sẽ xuất hiện tại đây"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wide w-12" style={{ color: "#5A7A6E" }}>STT</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Actor</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Action</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Resource</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Service</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Thời gian</th>
                    <th className="px-4 py-3.5 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const ts = log.timestamp || log.createdAt;
                    return (
                      <tr
                        key={log.id ?? log.eventId ?? idx}
                        className="transition cursor-pointer"
                        style={{ borderBottom: idx < logs.length - 1 ? "1px solid rgba(196,222,213,0.4)" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FAF6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setSelectedEventId(log.eventId ?? log.id)}
                      >
                        <td className="px-4 py-3.5 text-center text-xs font-medium" style={{ color: "#5A7A6E" }}>
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm leading-tight" style={{ color: "#1E2D28" }}>{log.actorUsername ?? "—"}</p>
                          {log.actorRole && <p className="text-[11px] mt-0.5" style={{ color: "#5A7A6E" }}>{log.actorRole}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "#EAF4F0", color: "#1E4A38" }}>
                            {log.action ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "#1E2D28" }}>
                          <p className="font-medium">{log.resourceType ?? "—"}</p>
                          {log.resourceId && (
                            <p className="text-[11px] font-mono mt-0.5 truncate max-w-[140px]" style={{ color: "#5A7A6E" }}>
                              {log.resourceId}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "#EAF4F0", color: "#5A7A6E" }}>
                            {log.serviceName ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge value={log.status} /></td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "#5A7A6E" }}>
                          {ts ? new Date(ts).toLocaleString("vi-VN") : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedEventId(log.eventId ?? log.id); }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                            style={{ color: "#2096d8", background: "rgba(32,150,216,0.08)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(32,150,216,0.15)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(32,150,216,0.08)")}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data.total > PAGE_SIZE && (
            <div className="flex justify-center py-4" style={{ borderTop: "1px solid rgba(196,222,213,0.4)" }}>
              <Pagination
                current={page}
                total={data.total}
                pageSize={PAGE_SIZE}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}

      <AuditLogDetailDrawer
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
      />
    </div>
  );
}
