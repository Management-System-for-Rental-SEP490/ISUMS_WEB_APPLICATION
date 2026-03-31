import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, User, Phone, Home, Calendar, Tag, FileText, Wrench, MessageCircle, Clock } from "lucide-react";
import { getIssueById } from "../api/issues.api";
import { ISSUE_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

export default function IssueDetailDrawer({ open, ticketId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !ticketId) return;
    setDetail(null);
    setError(null);
    setLoading(true);
    getIssueById(ticketId)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, ticketId]);

  if (!open) return null;

  const status = detail ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED) : null;
  const typeLabel = detail ? (ISSUE_TYPE_CONFIG[detail.type]?.label ?? detail.type) : null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-teal-600 font-semibold mb-1">Chi tiết yêu cầu</p>
            <h3 className="text-base font-bold text-slate-900 truncate">
              {loading ? "Đang tải..." : (detail?.title ?? "—")}
            </h3>
            {detail && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                #{String(detail.id ?? ticketId).slice(0, 8).toUpperCase()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {loading && (
            <div className="py-20 text-center text-slate-400 text-sm">Đang tải thông tin...</div>
          )}
          {error && (
            <div className="py-10 text-center text-red-500 text-sm">{error}</div>
          )}

          {!loading && detail && (
            <>
              {/* Status + Type badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                {typeLabel && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl ${ISSUE_TYPE_CONFIG[detail.type]?.cls ?? "bg-gray-100 text-gray-600"}`}>
                    {typeLabel}
                  </span>
                )}
              </div>

              {/* Mô tả */}
              {detail.description && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1.5 font-bold">Mô tả</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{detail.description}</p>
                </div>
              )}

              {/* Thời gian */}
              <Section title="Thời gian">
                <Row icon={Calendar} label="Ngày tạo" value={detail.createdAt ? dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm") : null} />
                {detail.updatedAt && (
                  <Row icon={Clock} label="Cập nhật lần cuối" value={dayjs(detail.updatedAt).format("DD/MM/YYYY HH:mm")} />
                )}
                {detail.resolvedAt && (
                  <Row icon={Clock} label="Ngày giải quyết" value={dayjs(detail.resolvedAt).format("DD/MM/YYYY HH:mm")} />
                )}
                {detail.scheduledDate && (
                  <Row icon={Calendar} label="Ngày hẹn xử lý" value={dayjs(detail.scheduledDate).format("DD/MM/YYYY HH:mm")} />
                )}
              </Section>

              {/* Khách thuê */}
              <Section title="Khách thuê">
                <Row icon={User}  label="Họ tên"        value={detail.tenantName} />
                <Row icon={Phone} label="Số điện thoại" value={detail.tenantPhone} />
                <Row icon={Tag}   label="Vai trò"       value={detail.tenantRole} />
                {detail.tenantEmail && <Row icon={FileText} label="Email" value={detail.tenantEmail} />}
              </Section>

              {/* Bất động sản */}
              <Section title="Bất động sản">
                <Row icon={Home}     label="Nhà"     value={detail.houseName} />
                {detail.houseUnit && <Row icon={Home} label="Phòng/Căn" value={detail.houseUnit} />}
                {detail.houseAddress && <Row icon={Home} label="Địa chỉ" value={detail.houseAddress} />}
              </Section>

              {/* Nhân viên xử lý */}
              {(detail.staffName || detail.staffPhone) && (
                <Section title="Nhân viên xử lý">
                  <Row icon={User}  label="Họ tên"        value={detail.staffName} />
                  <Row icon={Phone} label="Số điện thoại" value={detail.staffPhone} />
                </Section>
              )}

              {/* Thiết bị / Loại sửa chữa */}
              {detail.assetName && (
                <Section title="Thiết bị liên quan">
                  <Row icon={Wrench}   label="Tên thiết bị" value={detail.assetName} />
                  {detail.assetType && <Row icon={Tag} label="Loại" value={detail.assetType} />}
                </Section>
              )}

              {/* Ghi chú / Phản hồi */}
              {detail.note && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wide mb-1.5 font-bold flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> Ghi chú / Phản hồi
                  </p>
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{detail.note}</p>
                </div>
              )}

              {/* Hình ảnh đính kèm */}
              {Array.isArray(detail.images) && detail.images.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-3 font-bold">Hình ảnh đính kèm</p>
                  <div className="grid grid-cols-3 gap-2">
                    {detail.images.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={`img-${idx}`} className="w-full h-20 object-cover rounded-xl border border-slate-200" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
