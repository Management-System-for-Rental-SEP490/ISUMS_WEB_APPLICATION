import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  User,
} from "lucide-react";
import { getIssueById, getResponseByTicket } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  return (
    <div
      className={`${cls} rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function IssueDetailDrawer({
  open,
  ticketId,
  onClose,
  showResponse = false,
}) {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState(null);
  const [response, setResponse] = useState(null);
  const [houseName, setHouseName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !ticketId) return;
    setDetail(null);
    setResponse(null);
    setHouseName(null);
    setError(null);
    setLoading(true);
    const requests = [getIssueById(ticketId)];
    if (showResponse)
      requests.push(getResponseByTicket(ticketId).catch(() => null));
    Promise.all(requests)
      .then(([ticketDetail, resp]) => {
        setDetail(ticketDetail);
        if (resp) setResponse(resp);
        if (ticketDetail?.houseId) {
          getHouseById(ticketDetail.houseId)
            .then((h) => setHouseName(h?.name ?? h?.houseName ?? null))
            .catch(() => null);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, ticketId, showResponse]);

  if (!open) return null;

  const status = detail
    ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED)
    : null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ transition: "opacity 0.5s ease" }}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer */}
      <div
        style={{ transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        className={`fixed right-0 top-0 h-full w-full max-w-[520px] bg-white z-50 shadow-2xl flex flex-col
          ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg tracking-wide uppercase">
                Mã câu hỏi: #
                {String(ticketId ?? "")
                  .slice(0, 8)
                  .toUpperCase()}
              </span>
              {detail?.createdAt && (
                <span className="text-[11px] text-gray-400">
                  {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
                </span>
              )}
              {status && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${status.pill}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">
            {loading ? "Đang tải..." : (detail?.title ?? "—")}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
              <div className="w-7 h-7 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
              <p className="text-sm">Đang tải thông tin...</p>
            </div>
          )}
          {error && (
            <div className="py-10 text-center text-red-500 text-sm px-6">
              {error}
            </div>
          )}

          {!loading && detail && (
            <>
              {/* Resident + Location cards */}
              <div className="grid grid-cols-2 gap-3 px-6 pt-5">
                {/* Resident */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                  <Avatar name={detail.tenantName} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Khách thuê
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {detail.tenantName ?? "—"}
                    </p>
                    {detail.tenantPhone && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {detail.tenantPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Địa điểm
                    </p>
                    {detail.houseUnit && (
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {detail.houseUnit}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {houseName ?? detail.houseName ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resident's Inquiry */}
              <div className="px-6 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-teal-500" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Nội dung thắc mắc
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {detail.description ? `"${detail.description}"` : "—"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
                    </span>
                    {detail.houseUnit && (
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {detail.houseUnit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Response */}
              {response && (
                <div className="px-6 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        Ban quản lý đã trả lời:
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {response.content}
                    </p>
                    {response.createdAt && (
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">
                            Ban Quản Lý
                          </p>
                          <p className="text-[11px] text-teal-500">
                            {dayjs(response.createdAt).format(
                              "DD/MM/YYYY · HH:mm",
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="h-6" />
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
