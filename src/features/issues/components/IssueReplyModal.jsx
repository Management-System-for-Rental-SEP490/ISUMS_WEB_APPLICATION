import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "antd";
import { Send } from "lucide-react";
import { getIssueById, replyToIssue } from "../api/issues.api";
import { ISSUE_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-[10px] text-slate-400 font-medium w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-700 font-medium flex-1 min-w-0 break-words">{value}</span>
    </div>
  );
}

export default function IssueReplyModal({ open, ticketId, onClose, onReplied }) {
  const { t } = useTranslation("common");
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [content, setContent]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!open) return;
    setContent("");
    setError(null);
    setDetail(null);
    if (!ticketId) return;
    setDetailLoading(true);
    getIssueById(ticketId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [open, ticketId]);

  const handleSubmit = async () => {
    if (!content.trim() || !ticketId) return;
    setError(null);
    setSubmitting(true);
    try {
      await replyToIssue(ticketId, { content: content.trim() });
      onReplied?.();
      onClose();
    } catch (e) {
      setError(e.message ?? t("issues.replyFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const idShort  = ticketId ? `#${String(ticketId).slice(0, 8).toUpperCase()}` : "";
  const status   = detail ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED) : null;
  const typeConf = detail ? (ISSUE_TYPE_CONFIG[detail.type] ?? null) : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={620}
      title={
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-sm font-bold">!</span>
          </div>
          <span className="text-base font-bold text-slate-800">
            {t("issues.replyModalTitle")} <span className="text-teal-600">{idShort}</span>
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button onClick={onClose}>{t("actions.cancel")}</Button>
          <Button
            type="primary"
            icon={<Send className="w-4 h-4" />}
            loading={submitting}
            disabled={!content.trim()}
            onClick={handleSubmit}
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            {submitting ? t("issues.replySending") : t("issues.replySubmit")}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <div className="space-y-5 py-1">
        {/* Detail card */}
        {detailLoading ? (
          <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        ) : detail ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 space-y-3">
            <div className="flex items-start gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800 flex-1">{detail.title}</p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {status && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.color }}>
                    {t(status.i18nKey, { defaultValue: status.i18nKey })}
                  </span>
                )}
                {typeConf && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: typeConf.bg, color: typeConf.color }}>
                    {t(typeConf.i18nKey, { defaultValue: typeConf.i18nKey })}
                  </span>
                )}
              </div>
            </div>
            {detail.description && (
              <p className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-slate-300 pl-3">
                "{detail.description}"
              </p>
            )}
            <div className="pt-1 space-y-1.5">
              <InfoRow label={t("issues.drawerTenant")}  value={detail.tenantName} />
              <InfoRow label={t("issues.drawerLocation")} value={[detail.houseName, detail.houseUnit].filter(Boolean).join(" · ") || null} />
              <InfoRow label={t("issues.technicianSection")}   value={detail.staffName ?? (detail.assignedStaffId ? t("issues.assignedStaff") : t("issues.unassignedStaff"))} />
              <InfoRow label={t("detailCreatedAt", { defaultValue: "Ngày tạo" })}    value={detail.createdAt ? dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm") : null} />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">{t("issues.replyLoadError")}</p>
        )}

        {/* Textarea */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t("issues.replyContent")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("issues.replyPlaceholder")}
            rows={5}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">{t("issues.charCount", { count: content.length })}</p>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
