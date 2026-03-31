import { useState, useEffect, useCallback } from "react";
import { Search, Download, Phone, RefreshCw, Wrench, MessageCircle, AlertCircle, CheckCircle, MessagesSquare } from "lucide-react";
import dayjs from "dayjs";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import { getAllIssues, getAllResponses } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import IssueDetailDrawer from "../components/IssueDetailDrawer";
import IssueReplyModal from "../components/IssueReplyModal";

const DEFAULT_PAGE_SIZE = 10;

const STATUS_CHIPS = [
  { value: "",                         label: "Tất cả",         dot: "bg-gray-400"   },
  { value: "CREATED",                  label: "Mới tạo",        dot: "bg-slate-400"  },
  { value: "WAITING_PAYMENT",          label: "Chờ thanh toán", dot: "bg-amber-500"  },
  { value: "WAITING_MANAGER_APPROVAL", label: "Chờ duyệt",      dot: "bg-purple-500" },
  { value: "SCHEDULED",                label: "Đang xử lý",     dot: "bg-blue-500"   },
  { value: "DONE",                     label: "Hoàn thành",     dot: "bg-teal-500"   },
];

const TABS = [
  { value: "REPAIR",    label: "Yêu cầu sửa chữa",  icon: Wrench,          color: "text-orange-600", activeBorder: "border-orange-500" },
  { value: "QUESTION",  label: "Câu hỏi & Phản hồi", icon: MessageCircle,   color: "text-blue-600",   activeBorder: "border-blue-500"   },
  { value: "RESPONSES", label: "Lịch sử phản hồi",   icon: MessagesSquare,  color: "text-teal-600",   activeBorder: "border-teal-500"   },
];

function StatCard({ icon: Icon, label, value, iconBg, iconColor, accent, badge }) {
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
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>{badge.text}</span>
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
  const [issues, setIssues]                 = useState([]);
  const [houseNames, setHouseNames]         = useState({});
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState("REPAIR");
  const [statusFilter, setStatusFilter]     = useState("");
  const [search, setSearch]                 = useState("");
  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId]   = useState(null);
  const [responses, setResponses]           = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  // TODO(backend-pagination): khi có API hỗ trợ pagination, truyền pagination.page + pagination.pageSize
  // vào fetchIssues, và set pagination.total từ response (totalItems / totalCount)
  const [pagination, setPagination] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllIssues();
      const list = Array.isArray(data) ? data : [];
      setIssues(list);
      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id).then((h) => [id, h?.name ?? h?.houseName ?? "—"]).catch(() => [id, "—"])
        )
      );
      setHouseNames(Object.fromEntries(entries));
      // TODO(backend-pagination): thay dòng dưới bằng total từ response, vd: setPagination(p => ({ ...p, total: data.totalItems }))
      setPagination((p) => ({ ...p, total: list.length, page: 1 }));
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStatusFilter("");
    setSearch("");
    setPagination((p) => ({ ...p, page: 1 }));
    if (tab === "RESPONSES" && responses.length === 0) {
      setResponsesLoading(true);
      getAllResponses()
        .then((data) => setResponses(Array.isArray(data) ? data : []))
        .catch(() => setResponses([]))
        .finally(() => setResponsesLoading(false));
    }
  };

  const tabIssues = issues.filter((i) => i.type === activeTab);
  const filtered  = tabIssues.filter((i) => {
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // TODO(backend-pagination): khi dùng backend, bỏ 2 dòng này — backend trả đúng trang rồi
  const totalPages = Math.ceil(filtered.length / pagination.pageSize);
  const paginated  = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);

  const repair    = issues.filter((i) => i.type === "REPAIR");
  const question  = issues.filter((i) => i.type === "QUESTION");
  const pending   = issues.filter((i) => ["CREATED", "WAITING_PAYMENT", "WAITING_MANAGER_APPROVAL"].includes(i.status));
  const done      = issues.filter((i) => i.status === "DONE");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu</h2>
          <p className="text-sm text-gray-500 mt-1">Tổng hợp yêu cầu sửa chữa và câu hỏi từ khách thuê.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchIssues} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition bg-white shadow-sm disabled:opacity-50">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wrench}        label="Tổng sửa chữa"  value={repair.length}
          iconBg="bg-orange-50" iconColor="text-orange-500"
          accent="border-orange-400"
          badge={repair.filter(i => i.status === "CREATED").length > 0
            ? { text: `${repair.filter(i => i.status === "CREATED").length} mới`, cls: "bg-orange-100 text-orange-600" }
            : null}
        />
        <StatCard
          icon={MessageCircle} label="Câu hỏi"         value={question.length}
          iconBg="bg-blue-50"  iconColor="text-blue-500"
          accent="border-blue-400"
          badge={question.filter(i => i.status === "CREATED").length > 0
            ? { text: `${question.filter(i => i.status === "CREATED").length} mới`, cls: "bg-blue-100 text-blue-600" }
            : null}
        />
        <StatCard
          icon={AlertCircle}   label="Chờ xử lý"      value={pending.length}
          iconBg="bg-amber-50" iconColor="text-amber-500"
          accent="border-amber-400"
          badge={{ text: "Cần xử lý", cls: "bg-amber-100 text-amber-600" }}
        />
        <StatCard
          icon={CheckCircle}   label="Hoàn thành"      value={done.length}
          iconBg="bg-teal-50"  iconColor="text-teal-500"
          accent="border-teal-400"
        />
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon    = tab.icon;
            const count   = tab.value === "RESPONSES"
              ? responses.length
              : issues.filter((i) => i.type === tab.value).length;
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

        {/* Status chips — ẩn khi ở tab responses */}
        {activeTab === "RESPONSES" && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Toàn bộ phản hồi đã gửi cho cư dân</p>
            <button
              onClick={() => {
                setResponsesLoading(true);
                getAllResponses()
                  .then((data) => setResponses(Array.isArray(data) ? data : []))
                  .catch(() => setResponses([]))
                  .finally(() => setResponsesLoading(false));
              }}
              disabled={responsesLoading}
              className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${responsesLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        )}
        {activeTab !== "RESPONSES" && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-3 border-b border-gray-100 flex-wrap">
          {STATUS_CHIPS.map((chip) => {
            const active = statusFilter === chip.value;
            return (
              <button key={chip.value}
                onClick={() => { setStatusFilter(chip.value); setPagination((p) => ({ ...p, page: 1 })); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600"
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-white/80" : chip.dot}`} />
                {chip.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-teal-400 transition">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
              placeholder="Tìm kiếm yêu cầu..."
              className="bg-transparent text-sm outline-none w-44 text-gray-700 placeholder-gray-400" />
          </div>
        </div>
        )}

        {/* Responses tab content */}
        {activeTab === "RESPONSES" && (
          <div className="divide-y divide-gray-50">
            {responsesLoading && (
              <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
            )}
            {!responsesLoading && responses.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm">Chưa có phản hồi nào</div>
            )}
            {!responsesLoading && responses.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  Q
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="text-[11px] font-mono text-teal-600">
                      Ticket: #{String(r.ticketId ?? "").slice(0, 8).toUpperCase()}
                    </p>
                    <span className="text-[10px] text-gray-400">·</span>
                    <p className="text-[11px] text-gray-400">
                      {r.createdAt ? dayjs(r.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                </div>
                <button
                  onClick={() => setDrawerTicketId(r.ticketId)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-teal-300 hover:text-teal-600 transition flex-shrink-0"
                >
                  Xem ticket
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Table — ẩn khi tab RESPONSES */}
        {activeTab !== "RESPONSES" && <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">Chi tiết yêu cầu</th>
                <th className="px-5 py-3">Khách thuê & Nhà</th>
                {activeTab === "REPAIR" && <th className="px-5 py-3">Nhân viên</th>}
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
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="text-[11px] font-mono text-teal-600 mb-0.5">#{String(issue.id).slice(0, 8).toUpperCase()}</p>
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
                      <p className="text-xs text-gray-500 mt-1.5">🏠 {houseName}{issue.houseUnit ? ` · ${issue.houseUnit}` : ""}</p>
                    </td>
                    {activeTab === "REPAIR" && (
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
                    )}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDrawerTicketId(issue.id)}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-teal-300 hover:text-teal-600 transition">
                          Xem
                        </button>
                        {activeTab === "REPAIR" ? (
                          <button className="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition">
                            Gán sửa chữa
                          </button>
                        ) : (
                          <button
                            onClick={() => setReplyTicketId(issue.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
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

          {loading && <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>}
          {!loading && paginated.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">Không có yêu cầu nào</div>
          )}
        </div>}

        {/* Pagination */}
        {/* TODO(backend-pagination): thay filtered.length bằng pagination.total từ backend */}
        {activeTab !== "RESPONSES" && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, filtered.length)} / {filtered.length} yêu cầu
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
                <button key={p}
                  onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                  className={["w-8 h-8 rounded-lg text-sm font-medium transition", p === pagination.page ? "bg-teal-500 text-white" : "text-gray-500 hover:bg-gray-100"].join(" ")}>
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
      />

      <IssueReplyModal
        open={!!replyTicketId}
        ticketId={replyTicketId}
        onClose={() => setReplyTicketId(null)}
        onReplied={fetchIssues}
      />
    </div>
  );
}
