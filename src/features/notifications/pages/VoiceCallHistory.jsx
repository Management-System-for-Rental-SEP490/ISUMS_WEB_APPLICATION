import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Phone, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import { getMyCallHistory } from "../api/preferences.api";

const STATUS_COLOR = {
  PENDING:      { bg: "#F3F4F6", fg: "#374151" },
  DIALING:      { bg: "#DBEAFE", fg: "#1E40AF" },
  ANSWERED:     { bg: "#D1FAE5", fg: "#065F46" },
  ACKNOWLEDGED: { bg: "#D1FAE5", fg: "#065F46" },
  NO_ANSWER:    { bg: "#FEF3C7", fg: "#92400E" },
  BUSY:         { bg: "#FEF3C7", fg: "#92400E" },
  FAILED:       { bg: "#FEE2E2", fg: "#991B1B" },
  ESCALATED:    { bg: "#E0E7FF", fg: "#3730A3" },
  SKIPPED:      { bg: "#F3F4F6", fg: "#6B7280" },
};

export default function VoiceCallHistory() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n?.resolvedLanguage || "vi";

  const [page, setPage]       = useState(0);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (p) => {
    setLoading(true);
    try {
      const r = await getMyCallHistory(p, 20);
      setData(r);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang); } catch { return d; }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Phone size={22} /> {t("notif.callHistory.title")}
        </h2>
        <button onClick={() => load(page)}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 inline-flex items-center gap-2 hover:bg-gray-50">
          <RefreshCcw size={14} /> {t("common.refresh")}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden bg-white border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.eventType")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.status")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.dtmf")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.attempts")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.duration")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.locale")}</th>
              <th className="px-4 py-3 text-left">{t("notif.callHistory.createdAt")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">{t("common.loading")}</td></tr>
            )}
            {!loading && (data?.content?.length ?? 0) === 0 && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">{t("notif.callHistory.empty")}</td></tr>
            )}
            {!loading && (data?.content || []).map((c) => {
              const palette = STATUS_COLOR[c.status] || STATUS_COLOR.PENDING;
              return (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{c.eventType}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: palette.bg, color: palette.fg }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.dtmfReceived || "—"}</td>
                  <td className="px-4 py-3">{c.attemptNumber}/{c.maxAttempts}</td>
                  <td className="px-4 py-3">{c.durationSec != null ? `${c.durationSec}s` : "—"}</td>
                  <td className="px-4 py-3">{c.locale}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50">
            ←
          </button>
          <span className="text-gray-600">{page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50">
            →
          </button>
        </div>
      )}
    </div>
  );
}
