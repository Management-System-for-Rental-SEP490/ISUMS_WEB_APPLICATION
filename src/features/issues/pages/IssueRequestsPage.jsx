import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Download, RefreshCw, MessageCircle,
  CheckCircle2, Eye, Send, Home, Clock, AlertCircle,
} from "lucide-react";
import { Pagination } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import { getAllIssues } from "../api/issues.api";
import IssueDetailDrawer from "../components/IssueDetailDrawer";
import IssueReplyModal from "../components/IssueReplyModal";

const PAGE_SIZE = 8;

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

function IssueCard({ issue, onView, onReply, t }) {
  const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
  const tenantName = issue.tenant?.name ?? issue.tenantName ?? "?";
  const houseName  = issue.house?.name  ?? "—";

  return (
    <div
      className="flex items-start gap-4 px-5 py-3.5 transition-colors"
      style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <Avatar name={tenantName} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm leading-snug line-clamp-1" style={{ color: "#1E2D28" }}>
            {issue.title}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: status.bg, color: status.color }}>
            {t(status.i18nKey, { defaultValue: status.i18nKey })}
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
            {houseName}
          </span>
          <span className="text-[11px] font-medium" style={{ color: "#5A7A6E" }}>{tenantName}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        <button
          onClick={() => onView(issue.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
        >
          <Eye className="w-3 h-3" /> {t("issues.btnView")}
        </button>
        {issue.status === "CREATED" && (
          <button
            onClick={() => onReply(issue.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full text-white transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Send className="w-3 h-3" /> {t("issues.btnReply")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function IssueRequestsPage() {
  const { t } = useTranslation("common");
  const TABS = [
    { value: "CREATED", label: t("issues.tabUnanswered"), Icon: MessageCircle },
    { value: "DONE",    label: t("issues.tabAnswered"),   Icon: CheckCircle2  },
  ];

  const [issues, setIssues]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [tabCounts, setTabCounts]   = useState({ CREATED: 0, DONE: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState("CREATED");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId]   = useState(null);

  // Search debounce
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchIssues = useCallback(async (status, pageNum, searchTerm) => {
    setLoading(true); setError(null);
    try {
      const data = await getAllIssues({
        type: "QUESTION",
        status,
        page: pageNum,
        pageSize: PAGE_SIZE,
        ...(searchTerm ? { search: searchTerm } : {}),
      });
      const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      const totalCount = data?.total ?? list.length;
      setIssues(list);
      setTotal(totalCount);
      setTabCounts((prev) => ({ ...prev, [status]: totalCount }));


    } catch (err) {
      setError(err?.message ?? t("issues.loadError"));
      setIssues([]);
      setTotal(0);
    } finally { setLoading(false); }
  }, [t]);

  const fetchCounts = useCallback(async () => {
    try {
      const [c, d] = await Promise.all([
        getAllIssues({ type: "QUESTION", status: "CREATED", page: 1, pageSize: PAGE_SIZE }).catch(() => null),
        getAllIssues({ type: "QUESTION", status: "DONE",    page: 1, pageSize: PAGE_SIZE }).catch(() => null),
      ]);
      const toCount = (r) => r?.total ?? (Array.isArray(r) ? r.length : (Array.isArray(r?.items) ? r.items.length : 0));
      setTabCounts({ CREATED: toCount(c), DONE: toCount(d) });
    } catch { /**/ }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => {
    fetchIssues(activeTab, page, debouncedSearch);
  }, [fetchIssues, activeTab, page, debouncedSearch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>{t("issues.listTitle")}</h2>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => { fetchCounts(); fetchIssues(activeTab, page, debouncedSearch); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            {t("issues.btnRefresh")}
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <Download className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} /> {t("issues.btnExport")}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: t("issues.statUnanswered"), value: tabCounts.CREATED, Icon: MessageCircle, iconBg: "rgba(32,150,216,0.12)", iconColor: "#2096d8", badge: tabCounts.CREATED > 0 ? t("issues.statNeedsAction") : null },
          { label: t("issues.statAnswered"),   value: tabCounts.DONE,    Icon: CheckCircle2,  iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582", badge: null },
        ].map(({ label, value, Icon, iconBg, iconColor, badge }) => (
          <div
            key={label}
            className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
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
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Top bar: tabs + search */}
        <div
          className="flex items-center justify-between px-5 py-3 gap-4"
          style={{ borderBottom: "1px solid #C4DED5" }}
        >
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "#EAF4F0" }}>
            {TABS.map(({ value, label, Icon }) => {
              const isActive = activeTab === value;
              const count    = tabCounts[value] ?? 0;
              return (
                <button
                  key={value}
                  onClick={() => handleTabChange(value)}
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

          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 w-56"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("issues.searchPlaceholder")}
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
              <span className="text-sm">{t("issues.loading")}</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <AlertCircle className="w-8 h-8" style={{ color: "#D95F4B", opacity: 0.5 }} />
              <p className="text-sm" style={{ color: "#5A7A6E" }}>{error}</p>
              <button onClick={() => fetchIssues(activeTab, page, debouncedSearch)} className="text-xs underline" style={{ color: "#3bb582" }}>{t("issues.btnRetry")}</button>
            </div>
          )}

          {!loading && !error && issues.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <MessageCircle className="w-10 h-10" style={{ color: "#C4DED5" }} />
              <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("issues.empty")}</p>
            </div>
          )}

          {!loading && !error && issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onView={setDrawerTicketId}
              onReply={setReplyTicketId}
              t={t}
            />
          ))}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div
            className="flex justify-end px-5 py-3"
            style={{ borderTop: "1px solid #C4DED5" }}
          >
            <Pagination
              current={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </div>

      <IssueDetailDrawer
        open={!!drawerTicketId} ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
      />
      <IssueReplyModal
        open={!!replyTicketId} ticketId={replyTicketId}
        onClose={() => setReplyTicketId(null)}
        onReplied={() => { fetchCounts(); fetchIssues(activeTab, page, debouncedSearch); }}
      />
    </div>
  );
}
