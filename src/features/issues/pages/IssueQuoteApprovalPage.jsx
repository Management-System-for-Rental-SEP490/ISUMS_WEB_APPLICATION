import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Wrench, PackageSearch } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { getAllIssues } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import QuoteDetail from "../components/QuoteDetail";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function IssueQuoteApprovalPage() {
  const { t } = useTranslation("common");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [houseNames, setHouseNames] = useState({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({ type: "REPAIR", status: "WAITING_MANAGER_APPROVAL_QUOTE" });
      const list = Array.isArray(data?.items) ? data.items : [];
      setTickets(list);
      setSelected((prev) => (prev ? list.find((t) => t.id === prev.id) ?? list[0] : list[0]) ?? null);
      const ids = [...new Set(list.map((t) => t.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id)
            .then((h) => [id, h?.name ?? h?.houseName ?? "—"])
            .catch(() => [id, "—"]),
        ),
      );
      setHouseNames(Object.fromEntries(entries));
    } catch (e) {
      setError(e?.message ?? t("issues.loadQuoteError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleActionDone = () => {
    setSelected(null);
    fetchTickets();
  };

  const quote = selected?.quote ?? null;

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>{t("issues.quoteApprovalTitle")}</h2>

      {error && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm" style={{ color: "#D95F4B" }}>{error}</p>
          <button onClick={fetchTickets} className="text-xs underline" style={{ color: "#D95F4B" }}>{t("issues.btnRetry")}</button>
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* LEFT — ticket list */}
        <div
          className="w-64 flex-shrink-0 rounded-2xl overflow-hidden sticky top-0"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
            <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>{t("issues.waitingApproval")}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#b45309" }}>
                {tickets.length}
              </span>
              <button
                onClick={fetchTickets} disabled={loading}
                className="p-1 rounded-lg transition disabled:opacity-50"
                style={{ color: "#5A7A6E" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {loading && [1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3 animate-pulse space-y-2" style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}>
                <div className="h-3 rounded w-1/3" style={{ background: "#EAF4F0" }} />
                <div className="h-4 rounded w-3/4" style={{ background: "#EAF4F0" }} />
              </div>
            ))}
            {!loading && tickets.length === 0 && (
              <div className="py-10 text-center text-xs" style={{ color: "#5A7A6E" }}>{t("issues.emptyRepair")}</div>
            )}
            {!loading && tickets.map((ticket) => {
              const isActive = selected?.id === ticket.id;
              return (
                <button
                  key={ticket.id} onClick={() => setSelected(ticket)}
                  className="w-full text-left px-4 py-3 transition"
                  style={{
                    borderBottom: "1px solid rgba(196,222,213,0.4)",
                    background: isActive ? "rgba(59,181,130,0.08)" : "transparent",
                    borderLeft: isActive ? "3px solid #3bb582" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F0FAF6"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold" style={{ color: isActive ? "#3bb582" : "#5A7A6E" }}>
                      #{String(ticket.id).slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px]" style={{ color: "#5A7A6E" }}>{dayjs(ticket.createdAt).fromNow()}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug truncate" style={{ color: isActive ? "#1E2D28" : "#5A7A6E" }}>
                    {ticket.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — main content */}
        <div className="flex-1 min-w-0">
          {selected && quote && (
            <QuoteDetail
              quote={quote}
              ticket={selected}
              houseName={houseNames[selected.houseId]}
              onApproved={handleActionDone}
              onRejected={handleActionDone}
              t={t}
            />
          )}

          {selected && !quote && (
            <div className="rounded-2xl py-20 flex flex-col items-center gap-3" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <PackageSearch className="w-7 h-7" style={{ color: "#3bb582" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{t("issues.quoteNoQuote")}</p>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>{t("issues.quoteNoQuoteDesc")}</p>
            </div>
          )}

          {!loading && !selected && (
            <div className="rounded-2xl flex items-center justify-center py-32" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4F0" }}>
                  <Wrench className="w-7 h-7" style={{ color: "#3bb582" }} />
                </div>
                <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("issues.selectToViewQuote")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
