import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Send, Bold, Italic, List, Paperclip, Home, Calendar, Tag, User } from "lucide-react";
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
  const [mounted, setMounted]       = useState(false);
  const [visible, setVisible]       = useState(false);
  const [detail, setDetail]         = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [content, setContent]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setContent("");
      setError(null);
      setDetail(null);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));

      if (ticketId) {
        setDetailLoading(true);
        getIssueById(ticketId)
          .then(setDetail)
          .catch(() => setDetail(null))
          .finally(() => setDetailLoading(false));
      }
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(t);
    }
  }, [open, ticketId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 250); };

  const handleSubmit = async () => {
    if (!content.trim() || !ticketId) return;
    setError(null);
    setSubmitting(true);
    try {
      await replyToIssue(ticketId, { content: content.trim() });
      onReplied?.();
      handleClose();
    } catch (e) {
      setError(e.message ?? "Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const insertFormat = (before, after = "") => {
    const el = document.getElementById("reply-textarea");
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = content.slice(start, end);
    setContent(content.slice(0, start) + before + sel + after + content.slice(end));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  };

  const idShort  = ticketId ? `#${String(ticketId).slice(0, 8).toUpperCase()}` : "";
  const status   = detail ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED) : null;
  const typeConf = detail ? (ISSUE_TYPE_CONFIG[detail.type] ?? null) : null;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 250ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{
          maxWidth: 620,
          maxHeight: "92vh",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 250ms cubic-bezier(0.34,1.2,0.64,1), opacity 250ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-sm font-bold">!</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">
              Phản hồi yêu cầu <span className="text-teal-600">{idShort}</span>
            </h3>
          </div>
          <button type="button" onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Detail card */}
          {detailLoading ? (
            <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ) : detail ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 space-y-3">
              {/* Title + badges */}
              <div className="flex items-start gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-800 flex-1">{detail.title}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {status && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.pill}`}>
                      {status.label}
                    </span>
                  )}
                  {typeConf && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeConf.cls}`}>
                      {typeConf.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {detail.description && (
                <p className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-slate-300 pl-3">
                  "{detail.description}"
                </p>
              )}

              {/* Info rows */}
              <div className="pt-1 space-y-1.5">
                <InfoRow label="Khách thuê"   value={detail.tenantName} />
                <InfoRow label="Nhà / Phòng"  value={[detail.houseName, detail.houseUnit].filter(Boolean).join(" · ") || null} />
                <InfoRow label="Nhân viên"    value={detail.staffName ?? (detail.assignedStaffId ? "Đã phân công" : "Chưa phân công")} />
                <InfoRow label="Trạng thái"   value={status?.label} />
                <InfoRow label="Ngày tạo"     value={detail.createdAt ? dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm") : null} />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">Không thể tải thông tin yêu cầu.</div>
          )}

          {/* Content editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Nội dung phản hồi</label>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-400 text-white font-semibold cursor-default select-none">
                ✦ Gợi ý bằng AI
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border border-b-0 border-slate-200 rounded-t-xl bg-slate-50">
              {[
                { icon: Bold,      action: () => insertFormat("**", "**"), title: "In đậm"     },
                { icon: Italic,    action: () => insertFormat("_", "_"),   title: "In nghiêng"  },
                { icon: List,      action: () => insertFormat("\n- "),     title: "Danh sách"   },
                { icon: Paperclip, action: () => {},                       title: "Đính kèm"    },
              ].map(({ icon: Icon, action, title }) => (
                <button key={title} type="button" title={title} onClick={action}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <textarea
              id="reply-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung phản hồi, kế hoạch sửa chữa hoặc hướng dẫn tạm thời cho cư dân..."
              rows={5}
              className="w-full border border-slate-200 rounded-b-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">{content.length} ký tự</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
            {submitting ? "Đang gửi..." : "Gửi phản hồi & Cập nhật trạng thái"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
