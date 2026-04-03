import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Wrench,
  CheckCircle,
  MapPin,
  AlertTriangle,
  ChevronRight,
  PackageSearch,
  Home,
  X,
  Info,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import {
  getAllIssues,
  getIssueById,
  getQuotesByTicket,
  updateQuoteStatus,
} from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";

dayjs.extend(relativeTime);
dayjs.locale("vi");

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount ?? 0);
}

function StaffAvatar({ name }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

function QuoteDetail({
  quote,
  ticketDetail,
  houseName,
  onApproved,
  onRejected,
}) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const isApproved = quote.status === "APPROVED";
  const isRejected = quote.status === "REJECTED";

  const handleApprove = async () => {
    setConfirming(true);
    try {
      await updateQuoteStatus(quote.id, "APPROVED");
      toast.success("Đã duyệt báo giá thành công");
      onApproved();
    } catch (e) {
      toast.error(e.message ?? "Duyệt thất bại.");
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await updateQuoteStatus(quote.id, "REJECTED");
      toast.success("Đã từ chối báo giá");
      onRejected();
    } catch (e) {
      toast.error(e.message ?? "Từ chối thất bại.");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top two-column cards */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Ticket info card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-teal-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Mã yêu cầu
              </p>
              <p className="text-2xl font-black text-gray-900">
                #{String(ticketDetail.id).slice(0, 8).toUpperCase()}
              </p>
            </div>
            {(() => {
              const s =
                ISSUE_STATUS_CONFIG[ticketDetail.status] ??
                ISSUE_STATUS_CONFIG.CREATED;
              return (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${s.pill}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              );
            })()}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Địa chỉ bảo trì
                </p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {houseName ?? "Đang tải..."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Mô tả sự cố
                </p>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                  {ticketDetail.description ?? "Không có mô tả."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technician card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Kỹ thuật viên
          </p>
          {ticketDetail.assignedStaffId ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <StaffAvatar name={ticketDetail.staffName} />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {ticketDetail.staffName ?? "Nhân viên"}
                  </p>
                  {ticketDetail.staffPhone && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ticketDetail.staffPhone}
                    </p>
                  )}
                </div>
              </div>
              {quote.isTenantFault && (
                <div className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-600">
                    Lỗi do khách thuê
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 text-gray-400">
              <Wrench className="w-8 h-8 text-gray-200" />
              <p className="text-sm">Chưa phân công</p>
            </div>
          )}
        </div>
      </div>

      {/* Quote table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <p className="text-base font-bold text-gray-900">
            Báo giá từ kỹ thuật viên
          </p>
          <p className="text-xs text-gray-400">
            Cập nhật: {dayjs(quote.createdAt).format("HH:mm · DD/MM/YYYY")}
          </p>
        </div>

        {/* Table head */}
        <div className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {["Hạng mục chi tiết", "Số lượng", "Đơn giá", "Thành tiền"].map(
            (h) => (
              <p
                key={h}
                className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {h}
              </p>
            ),
          )}
        </div>

        {/* Rows */}
        {(quote.items ?? []).length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">
            Không có hạng mục nào
          </div>
        )}
        {(quote.items ?? []).map((item, idx) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-6 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-500 text-xs font-bold">
                  {idx + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.itemName}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">01</p>
            <p className="text-sm text-gray-700">
              {formatCurrency(item.price)}
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(item.price)}
            </p>
          </div>
        ))}
      </div>

      {/* Total + actions bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-5">
        <div className="flex-1 min-w-0 bg-teal-50 border border-teal-100 rounded-xl px-5 py-4">
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1">
            Tổng chi phí dự kiến
          </p>
          <p className="text-3xl font-black text-teal-700">
            {formatCurrency(quote.totalPrice)}
          </p>
          <p className="text-xs text-teal-500 mt-1">
            Giá đã bao gồm thuế VAT và phí dịch vụ kỹ thuật.
          </p>
        </div>

        {!isApproved && !isRejected ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleReject}
              disabled={rejecting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              {rejecting ? "Đang từ chối..." : "Từ chối"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={confirming}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {confirming ? "Đang duyệt..." : "Duyệt báo giá"}
            </button>
          </div>
        ) : isApproved ? (
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 border border-green-200 flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm font-bold text-green-700">Đã duyệt</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 border border-red-200 flex-shrink-0">
            <X className="w-5 h-5 text-red-500" />
            <p className="text-sm font-bold text-red-600">Đã từ chối</p>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-blue-700 mb-0.5">
            Lưu ý quan trọng
          </p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Sau khi bạn nhấn "Duyệt báo giá", kỹ thuật viên sẽ nhận được thông
            báo và bắt đầu công việc ngay lập tức. Mọi thay đổi sau khi duyệt
            cần liên hệ trực tiếp với bộ phận hỗ trợ ISUMS.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IssueQuoteApprovalPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [houseNames, setHouseNames] = useState({});
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({
        type: "REPAIR",
        status: "WAITING_MANAGER_APPROVAL_QUOTE",
      });
      const list = Array.isArray(data) ? data : [];
      setTickets(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id)
            .then((h) => [id, h?.name ?? h?.houseName ?? "—"])
            .catch(() => [id, "—"]),
        ),
      );
      setHouseNames(Object.fromEntries(entries));
    } catch (e) {
      setError(e?.message ?? "Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(
    async (ticket) => {
      setDetail(null);
      setQuotes([]);
      setActiveQuoteIdx(0);
      setQuotesLoading(true);
      try {
        const [ticketDetail, quotesData] = await Promise.all([
          getIssueById(ticket.id),
          getQuotesByTicket(ticket.id),
        ]);
        setDetail(ticketDetail ?? ticket);
        setQuotes(Array.isArray(quotesData) ? quotesData : []);
        if (ticketDetail?.houseId && !houseNames[ticketDetail.houseId]) {
          getHouseById(ticketDetail.houseId)
            .then((h) =>
              setHouseNames((prev) => ({
                ...prev,
                [ticketDetail.houseId]: h?.name ?? h?.houseName ?? "—",
              })),
            )
            .catch(() => {});
        }
      } catch {
        setDetail(ticket);
      } finally {
        setQuotesLoading(false);
      }
    },
    [houseNames],
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  useEffect(() => {
    if (selected) fetchDetail(selected);
  }, [selected]);

  const handleApproved = () => {
    setSelected(null);
    setDetail(null);
    setQuotes([]);
    fetchTickets();
  };

  const currentDetail = detail ?? selected;
  const currentQuote = quotes[activeQuoteIdx] ?? null;

  return (
    <div className="flex gap-5 items-start">
      {/* LEFT — ticket list */}
      <div className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">Chờ duyệt</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
              {tickets.length}
            </span>
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {loading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-gray-50 animate-pulse space-y-2"
              >
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          {!loading && tickets.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-xs">
              Không có yêu cầu nào
            </div>
          )}
          {!loading &&
            tickets.map((ticket) => {
              const isActive = selected?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition hover:bg-gray-50 ${isActive ? "bg-amber-50 border-l-4 border-l-amber-400" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold ${isActive ? "text-amber-600" : "text-gray-400"}`}
                    >
                      #{String(ticket.id).slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {dayjs(ticket.createdAt).fromNow()}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-semibold leading-snug truncate ${isActive ? "text-amber-700" : "text-gray-800"}`}
                  >
                    {ticket.title}
                  </p>
                </button>
              );
            })}
        </div>
      </div>

      {/* RIGHT — main content */}
      <div className="flex-1 min-w-0">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchTickets}
              className="text-xs text-red-600 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Page title */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Xác nhận báo giá</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Đang tải..."
              : `${tickets.length} yêu cầu đang chờ duyệt`}
          </p>
        </div>

        {/* Quotes tab switcher (nếu có nhiều quote) */}
        {!quotesLoading && quotes.length > 1 && (
          <div className="flex items-center gap-2 mb-4">
            {quotes.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuoteIdx(idx)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  activeQuoteIdx === idx
                    ? "border-teal-400 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Báo giá #{idx + 1}
                {q.status === "APPROVED" && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {quotesLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_280px] gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" />
              <div className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 h-48 animate-pulse" />
          </div>
        )}

        {!quotesLoading && currentDetail && currentQuote && (
          <QuoteDetail
            quote={currentQuote}
            ticketDetail={currentDetail}
            houseName={houseNames[currentDetail.houseId]}
            onApproved={handleApproved}
            onRejected={handleApproved}
          />
        )}

        {!quotesLoading && currentDetail && quotes.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 flex flex-col items-center gap-3 text-gray-400">
            <PackageSearch className="w-12 h-12 text-gray-200" />
            <p className="text-sm font-semibold">Chưa có báo giá nào</p>
            <p className="text-xs">
              Nhân viên chưa gửi báo giá cho yêu cầu này
            </p>
          </div>
        )}

        {!loading && !currentDetail && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center py-32">
            <div className="text-center text-gray-400">
              <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Chọn một yêu cầu để xem báo giá</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
