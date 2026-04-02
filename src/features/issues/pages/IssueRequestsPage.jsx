import { useState, useEffect, useCallback } from "react";
import { Search, Download, RefreshCw, MessageCircle, CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import { getAllIssues } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import IssueDetailDrawer from "../components/IssueDetailDrawer";
import IssueReplyModal from "../components/IssueReplyModal";

const DEFAULT_PAGE_SIZE = 10;

// Tab = status value
const TABS = [
  {
    value: "CREATED",
    label: "Câu hỏi chưa trả lời",
    icon: MessageCircle,
    color: "text-blue-600",
    activeBorder: "border-blue-500",
  },
  {
    value: "DONE",
    label: "Câu hỏi đã trả lời",
    icon: CheckCircle,
    color: "text-teal-600",
    activeBorder: "border-teal-500",
  },
];

function StatCard({ icon, label, value, iconBg, iconColor, accent, badge }) {
  const Icon = icon;
  return (
    <div className={`bg-white rounded-xl border shadow-sm px-5 py-4 flex items-center gap-4 border-l-4 ${accent}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
      {badge && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function IssueRequestsPage() {
  const [issues, setIssues]             = useState([]);
  const [tabCounts, setTabCounts]       = useState({ CREATED: 0, DONE: 0 });
  const [houseNames, setHouseNames]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState("CREATED");
  const [search, setSearch]             = useState("");
  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId]   = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const [createdData, doneData] = await Promise.all([
        getAllIssues({ type: "QUESTION", status: "CREATED" }).catch(() => []),
        getAllIssues({ type: "QUESTION", status: "DONE" }).catch(() => []),
      ]);
      setTabCounts({
        CREATED: (Array.isArray(createdData) ? createdData : []).length,
        DONE:    (Array.isArray(doneData)    ? doneData    : []).length,
      });
    } catch {
      // giữ counts cũ nếu lỗi
    }
  }, []);

  const fetchIssues = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({ type: "QUESTION", status });
      const list = Array.isArray(data) ? data : [];
      setIssues(list);
      setTabCounts((prev) => ({ ...prev, [status]: list.length }));
      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id).then((h) => [id, h?.name ?? h?.houseName ?? "—"]).catch(() => [id, "—"])
        )
      );
      setHouseNames(Object.fromEntries(entries));
      setPagination((p) => ({ ...p, total: list.length, page: 1 }));
    } catch (err) {
      setError(err?.message ?? "Không thể tải danh sách, vui lòng thử lại.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchIssues(activeTab); }, [fetchIssues, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const filtered = issues.filter((i) =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pagination.pageSize);
  const paginated  = filtered.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách các thắc mắc</h2>
          <p className="text-sm text-gray-500 mt-1">Câu hỏi và phản hồi từ khách thuê.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchCounts(); fetchIssues(activeTab); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={MessageCircle}
          label="Câu hỏi chưa trả lời"
          value={tabCounts.CREATED}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          accent="border-blue-400"
          badge={tabCounts.CREATED > 0 ? { text: "Cần xử lý", cls: "bg-blue-100 text-blue-600" } : null}
        />
        <StatCard
          icon={CheckCircle}
          label="Đã trả lời"
          value={tabCounts.DONE}
          iconBg="bg-teal-50"
          iconColor="text-teal-500"
          accent="border-teal-400"
        />
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon     = tab.icon;
            const count    = tabCounts[tab.value] ?? 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? `${tab.activeBorder} ${tab.color} bg-gray-50/50`
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-gray-100 flex justify-end">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-teal-400 transition">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
              placeholder="Tìm kiếm câu hỏi..."
              className="bg-transparent text-sm outline-none w-52 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">Chi tiết câu hỏi</th>
                <th className="px-5 py-3">Khách thuê & Nhà</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((issue) => {
                const status    = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
                const houseName = houseNames[issue.houseId] ?? issue.houseName ?? "—";
                return (
                  <tr key={issue.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4 max-w-[240px]">
                      <p className="text-[11px] font-mono text-teal-600 mb-0.5">
                        #{String(issue.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="font-semibold text-gray-800 text-sm leading-snug truncate">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{issue.description}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {dayjs(issue.createdAt).format("DD/MM/YYYY · HH:mm")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={issue.tenantName} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{issue.tenantName}</p>
                          <p className="text-xs text-gray-400">{issue.tenantRole}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        🏠 {houseName}{issue.houseUnit ? ` · ${issue.houseUnit}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDrawerTicketId(issue.id)}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-teal-300 hover:text-teal-600 transition"
                        >
                          Xem
                        </button>
                        {activeTab === "CREATED" && (
                          <button
                            onClick={() => setReplyTicketId(issue.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                          >
                            Trả lời
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
          )}
          {!loading && error && (
            <div className="py-10 flex flex-col items-center gap-3">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => fetchIssues(activeTab)}
                className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
              >
                Thử lại
              </button>
            </div>
          )}
          {!loading && !error && paginated.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">Không có câu hỏi nào</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, filtered.length)} / {filtered.length} câu hỏi
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="w-8 h-8 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                  className={["w-8 h-8 rounded-lg text-sm font-medium transition",
                    p === pagination.page ? "bg-teal-500 text-white" : "text-gray-500 hover:bg-gray-100"
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={pagination.page === totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="w-8 h-8 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <IssueDetailDrawer
        open={!!drawerTicketId}
        ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
        showResponse={activeTab === "DONE"}
      />

      <IssueReplyModal
        open={!!replyTicketId}
        ticketId={replyTicketId}
        onClose={() => setReplyTicketId(null)}
        onReplied={() => { fetchCounts(); fetchIssues(activeTab); }}
      />
    </div>
  );
}
