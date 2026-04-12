import { useState, useEffect, useCallback } from "react";
import {
  Search, Download, RefreshCw, MessageCircle,
  CheckCircle2, Eye, Send, Home, Clock, AlertCircle, Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import { getAllIssues } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import IssueDetailDrawer from "../components/IssueDetailDrawer";
import IssueReplyModal from "../components/IssueReplyModal";

const TABS = [
  { value: "CREATED", label: "Chưa trả lời", Icon: MessageCircle },
  { value: "DONE",    label: "Đã trả lời",   Icon: CheckCircle2  },
];

function Avatar({ name }) {
  const letters = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
    >
      {letters}
    </div>
  );
}

function IssueCard({ issue, houseName, onView, onReply, showReply }) {
  const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 transition-colors"
      style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <Avatar name={issue.tenantName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm leading-snug line-clamp-1" style={{ color: "#1E2D28" }}>
            {issue.title}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582" }}
          >
            #{String(issue.id).slice(0, 8).toUpperCase()}
          </span>
        </div>
        {issue.description && (
          <p className="text-xs line-clamp-1 mb-1" style={{ color: "#5A7A6E" }}>{issue.description}</p>
        )}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "#5A7A6E" }}>
            <Clock className="w-3 h-3" />
            {dayjs(issue.createdAt).format("DD/MM/YYYY · HH:mm")}
          </span>
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "#5A7A6E" }}>
            <Home className="w-3 h-3" />
            {houseName}{issue.houseUnit ? ` · ${issue.houseUnit}` : ""}
          </span>
          {issue.tenantName && (
            <span className="text-[11px] font-medium" style={{ color: "#5A7A6E" }}>{issue.tenantName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onView(issue.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
        >
          <Eye className="w-3 h-3" /> Xem
        </button>
        {showReply && (
          <button
            onClick={() => onReply(issue.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full text-white transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Send className="w-3 h-3" /> Trả lời
          </button>
        )}
      </div>
    </div>
  );
}

export default function IssueRequestsPage() {
  const [issues, setIssues]         = useState([]);
  const [tabCounts, setTabCounts]   = useState({ CREATED: 0, DONE: 0 });
  const [houseNames, setHouseNames] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState("CREATED");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const PAGE_SIZE = 8;

  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId]   = useState(null);

  const fetchIssues = useCallback(async (status) => {
    setLoading(true); setError(null);
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
      setPage(1);
    } catch (err) {
      setError(err?.message ?? "Không thể tải dữ liệu.");
      setIssues([]);
    } finally { setLoading(false); }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [c, d] = await Promise.all([
        getAllIssues({ type: "QUESTION", status: "CREATED" }).catch(() => []),
        getAllIssues({ type: "QUESTION", status: "DONE"    }).catch(() => []),
      ]);
      setTabCounts({ CREATED: (Array.isArray(c) ? c : []).length, DONE: (Array.isArray(d) ? d : []).length });
    } catch { /**/ }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchIssues(activeTab); }, [fetchIssues, activeTab]);

  const filtered   = issues.filter((i) => !search || i.title?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Yêu cầu</span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Danh sách thắc mắc</h2>
          <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>Câu hỏi và phản hồi từ khách thuê.</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => { fetchCounts(); fetchIssues(activeTab); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            Làm mới
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <Download className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} /> Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Chưa trả lời", value: tabCounts.CREATED, Icon: MessageCircle, iconBg: "rgba(32,150,216,0.12)", iconColor: "#2096d8", badge: tabCounts.CREATED > 0 ? "Cần xử lý" : null },
          { label: "Đã trả lời",   value: tabCounts.DONE,    Icon: CheckCircle2,  iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582", badge: null },
        ].map(({ label, value, Icon, iconBg, iconColor, badge }) => (
          <div
            key={label}
            className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#5A7A6E" }}>{label}</p>
              <p className="text-2xl font-heading font-bold leading-none" style={{ color: "#1E2D28" }}>{value}</p>
            </div>
            {badge && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(217,95,75,0.10)", color: "#D95F4B" }}
              >
                {badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Top bar: tabs + search */}
        <div
          className="flex items-center justify-between px-5 py-3 gap-4"
          style={{ borderBottom: "1px solid #C4DED5" }}
        >
          {/* Pill tabs */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "#EAF4F0" }}>
            {TABS.map(({ value, label, Icon }) => {
              const isActive = activeTab === value;
              const count    = tabCounts[value] ?? 0;
              return (
                <button
                  key={value}
                  onClick={() => { setActiveTab(value); setSearch(""); setPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
                  style={isActive
                    ? { background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)", color: "#ffffff", boxShadow: "0 2px 8px rgba(59,181,130,0.3)" }
                    : { color: "#5A7A6E" }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.5)")}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={isActive
                      ? { background: "rgba(255,255,255,0.25)", color: "#ffffff" }
                      : { background: "#C4DED5", color: "#5A7A6E" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 w-56"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm câu hỏi..."
              className="bg-transparent text-sm outline-none flex-1"
              style={{ color: "#1E2D28" }}
            />
          </div>
        </div>

        {/* List */}
        <div>
          {loading && (
            <div className="flex items-center justify-center h-48 gap-2" style={{ color: "#5A7A6E" }}>
              <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "#3bb582" }} />
              <span className="text-sm">Đang tải...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <AlertCircle className="w-8 h-8" style={{ color: "#D95F4B", opacity: 0.5 }} />
              <p className="text-sm" style={{ color: "#5A7A6E" }}>{error}</p>
              <button onClick={() => fetchIssues(activeTab)} className="text-xs underline" style={{ color: "#3bb582" }}>Thử lại</button>
            </div>
          )}

          {!loading && !error && paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <MessageCircle className="w-10 h-10" style={{ color: "#C4DED5" }} />
              <p className="text-sm" style={{ color: "#5A7A6E" }}>Không có câu hỏi nào</p>
            </div>
          )}

          {!loading && !error && paginated.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              houseName={houseNames[issue.houseId] ?? issue.houseName ?? "—"}
              onView={setDrawerTicketId}
              onReply={setReplyTicketId}
              showReply={activeTab === "CREATED"}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid #C4DED5", background: "#EAF4F0" }}
          >
            <p className="text-xs" style={{ color: "#5A7A6E" }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} câu hỏi
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-7 h-7 rounded-lg text-sm transition disabled:opacity-30"
                style={{ color: "#5A7A6E" }}
                onMouseEnter={e => e.currentTarget.style.background = "#C4DED5"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg text-sm font-medium transition"
                  style={p === page
                    ? { background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)", color: "#ffffff" }
                    : { color: "#5A7A6E" }}
                  onMouseEnter={e => p !== page && (e.currentTarget.style.background = "#C4DED5")}
                  onMouseLeave={e => p !== page && (e.currentTarget.style.background = "transparent")}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 rounded-lg text-sm transition disabled:opacity-30"
                style={{ color: "#5A7A6E" }}
                onMouseEnter={e => e.currentTarget.style.background = "#C4DED5"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >›</button>
            </div>
          </div>
        )}
      </div>

      <IssueDetailDrawer
        open={!!drawerTicketId} ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)} showResponse={activeTab === "DONE"}
      />
      <IssueReplyModal
        open={!!replyTicketId} ticketId={replyTicketId}
        onClose={() => setReplyTicketId(null)}
        onReplied={() => { fetchCounts(); fetchIssues(activeTab); }}
      />
    </div>
  );
}
