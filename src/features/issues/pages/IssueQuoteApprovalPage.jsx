import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  Wrench,
  CheckCircle,
  AlertTriangle,
  PackageSearch,
  Home,
  X,
  Info,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
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
    <div
      className="w-14 h-14 rounded-full text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm"
      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
    >
      {initials}
    </div>
  );
}

function QuoteDetail({ quote, ticketDetail, houseName, onApproved, onRejected }) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const images = Array.isArray(ticketDetail.images) ? ticketDetail.images : [];
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

  const s = ISSUE_STATUS_CONFIG[ticketDetail.status] ?? ISSUE_STATUS_CONFIG.CREATED;

  return (
    <>
    <div className="space-y-5">
      {/* Top two-column cards */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Ticket info card */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#FAFFFE",
            border: "1px solid #C4DED5",
            borderLeft: "4px solid #3bb582",
            boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#5A7A6E" }}>
                Mã yêu cầu
              </p>
              <p className="text-2xl font-black" style={{ color: "#1E2D28" }}>
                #{String(ticketDetail.id).slice(0, 8).toUpperCase()}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: s.bg, color: s.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>
                  Địa chỉ bảo trì
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#1E2D28" }}>
                  {houseName ?? "Đang tải..."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>
                  Mô tả sự cố
                </p>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#1E2D28" }}>
                  {ticketDetail.description ?? "Không có mô tả."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technician card */}
        <div
          className="rounded-2xl p-5 flex flex-col"
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#5A7A6E" }}>
            Kỹ thuật viên
          </p>
          {ticketDetail.assignedStaffId ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <StaffAvatar name={ticketDetail.staffName} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>
                    {ticketDetail.staffName ?? "Nhân viên"}
                  </p>
                  {ticketDetail.staffPhone && (
                    <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>
                      {ticketDetail.staffPhone}
                    </p>
                  )}
                </div>
              </div>
              {quote.isTenantFault && (
                <div
                  className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.2)" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D95F4B" }} />
                  <p className="text-xs font-semibold" style={{ color: "#D95F4B" }}>
                    Lỗi do khách thuê
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3" style={{ color: "#5A7A6E" }}>
              <Wrench className="w-8 h-8" style={{ color: "#C4DED5" }} />
              <p className="text-sm">Chưa phân công</p>
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4" style={{ color: "#3bb582" }} />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#5A7A6E" }}>
              Ảnh đính kèm
            </p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#EAF4F0", color: "#5A7A6E" }}>
              {images.length}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(idx)}
                className="block aspect-square rounded-xl overflow-hidden transition hover:scale-[1.03]"
                style={{ border: "1px solid #C4DED5" }}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quote table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
          <p className="text-base font-bold" style={{ color: "#1E2D28" }}>
            Báo giá từ kỹ thuật viên
          </p>
          <p className="text-xs" style={{ color: "#5A7A6E" }}>
            Cập nhật: {dayjs(quote.createdAt).format("HH:mm · DD/MM/YYYY")}
          </p>
        </div>

        {/* Table head */}
        <div
          className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-6 py-3"
          style={{ background: "#EAF4F0", borderBottom: "1px solid #C4DED5" }}
        >
          {["Hạng mục chi tiết", "Số lượng", "Đơn giá", "Thành tiền"].map((h) => (
            <p key={h} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {(quote.items ?? []).length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: "#5A7A6E" }}>
            Không có hạng mục nào
          </div>
        )}
        {(quote.items ?? []).map((item, idx) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-6 py-4 transition items-center"
            style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F0FAF6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
              >
                <span className="text-xs font-bold" style={{ color: "#3bb582" }}>{idx + 1}</span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{item.itemName}</p>
                {item.description && (
                  <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>{item.description}</p>
                )}
              </div>
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>01</p>
            <p className="text-sm" style={{ color: "#1E2D28" }}>{formatCurrency(item.price)}</p>
            <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{formatCurrency(item.price)}</p>
          </div>
        ))}
      </div>

      {/* Total + actions bar */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div
          className="flex-1 min-w-0 rounded-xl px-5 py-4"
          style={{ background: "rgba(59,181,130,0.08)", border: "1px solid #C4DED5" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#3bb582" }}>
            Tổng chi phí dự kiến
          </p>
          <p className="font-heading text-3xl font-black" style={{ color: "#1E2D28" }}>
            {formatCurrency(quote.totalPrice)}
          </p>
          <p className="text-xs mt-1" style={{ color: "#5A7A6E" }}>
            Giá đã bao gồm thuế VAT và phí dịch vụ kỹ thuật.
          </p>
        </div>

        {!isApproved && !isRejected ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleReject}
              disabled={rejecting}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: "1px solid rgba(217,95,75,0.4)", color: "#D95F4B", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,95,75,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <X className="w-4 h-4" />
              {rejecting ? "Đang từ chối..." : "Từ chối"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={confirming}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            >
              <CheckCircle className="w-4 h-4" />
              {confirming ? "Đang duyệt..." : "Duyệt báo giá"}
            </button>
          </div>
        ) : isApproved ? (
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl flex-shrink-0"
            style={{ background: "rgba(59,181,130,0.10)", border: "1px solid #C4DED5" }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: "#3bb582" }} />
            <p className="text-sm font-bold" style={{ color: "#3bb582" }}>Đã duyệt</p>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl flex-shrink-0"
            style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.3)" }}
          >
            <X className="w-5 h-5" style={{ color: "#D95F4B" }} />
            <p className="text-sm font-bold" style={{ color: "#D95F4B" }}>Đã từ chối</p>
          </div>
        )}
      </div>

      {/* Note */}
      <div
        className="rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{ background: "rgba(32,150,216,0.06)", border: "1px solid rgba(32,150,216,0.2)" }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#2096d8" }} />
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: "#2096d8" }}>
            Lưu ý quan trọng
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#1a6fa8" }}>
            Sau khi bạn nhấn "Duyệt báo giá", kỹ thuật viên sẽ nhận được thông
            báo và bắt đầu công việc ngay lập tức. Mọi thay đổi sau khi duyệt
            cần liên hệ trực tiếp với bộ phận hỗ trợ ISUMS.
          </p>
        </div>
      </div>
    </div>
    {lightboxIndex !== null && createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
        style={{ background: "rgba(30,45,40,0.85)", zIndex: 1200 }}
        onClick={() => setLightboxIndex(null)}
      >
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-4 p-3 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <img
          src={images[lightboxIndex]?.url}
          alt="Ảnh đính kèm"
          className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          onClick={(e) => e.stopPropagation()}
        />
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % images.length); }}
            className="absolute right-4 p-3 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={() => setLightboxIndex(null)}
          className="absolute top-4 right-4 p-2.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <X className="w-5 h-5" />
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)" }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        )}
      </div>,
      document.body
    )}
    </>
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
    <div className="space-y-5">
      {/* Header */}
      <div>
<h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Xác nhận báo giá</h2>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm" style={{ color: "#D95F4B" }}>{error}</p>
          <button onClick={fetchTickets} className="text-xs underline" style={{ color: "#D95F4B" }}>
            Thử lại
          </button>
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* LEFT — ticket list */}
        <div
          className="w-64 flex-shrink-0 rounded-2xl overflow-hidden sticky top-0"
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
            <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>Chờ duyệt</p>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.12)", color: "#b45309" }}
              >
                {tickets.length}
              </span>
              <button
                onClick={fetchTickets}
                disabled={loading}
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
            {loading &&
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-4 py-3 animate-pulse space-y-2"
                  style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                >
                  <div className="h-3 rounded w-1/3" style={{ background: "#EAF4F0" }} />
                  <div className="h-4 rounded w-3/4" style={{ background: "#EAF4F0" }} />
                </div>
              ))}
            {!loading && tickets.length === 0 && (
              <div className="py-10 text-center text-xs" style={{ color: "#5A7A6E" }}>
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
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: isActive ? "#3bb582" : "#5A7A6E" }}
                      >
                        #{String(ticket.id).slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px]" style={{ color: "#5A7A6E" }}>
                        {dayjs(ticket.createdAt).fromNow()}
                      </span>
                    </div>
                    <p
                      className="text-sm font-semibold leading-snug truncate"
                      style={{ color: isActive ? "#1E2D28" : "#5A7A6E" }}
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
          {/* Quotes tab switcher */}
          {!quotesLoading && quotes.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              {quotes.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuoteIdx(idx)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition"
                  style={{
                    border: activeQuoteIdx === idx ? "1px solid #3bb582" : "1px solid #C4DED5",
                    background: activeQuoteIdx === idx ? "rgba(59,181,130,0.10)" : "transparent",
                    color: activeQuoteIdx === idx ? "#3bb582" : "#5A7A6E",
                  }}
                >
                  Báo giá #{idx + 1}
                  {q.status === "APPROVED" && (
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {quotesLoading && (
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_280px] gap-4">
                <div className="rounded-2xl h-40 animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="rounded-2xl h-40 animate-pulse" style={{ background: "#EAF4F0" }} />
              </div>
              <div className="rounded-2xl h-48 animate-pulse" style={{ background: "#EAF4F0" }} />
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
            <div
              className="rounded-2xl py-20 flex flex-col items-center gap-3"
              style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <PackageSearch className="w-7 h-7" style={{ color: "#3bb582" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Chưa có báo giá nào</p>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>
                Nhân viên chưa gửi báo giá cho yêu cầu này
              </p>
            </div>
          )}

          {!loading && !currentDetail && (
            <div
              className="rounded-2xl flex items-center justify-center py-32"
              style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4F0" }}>
                  <Wrench className="w-7 h-7" style={{ color: "#3bb582" }} />
                </div>
                <p className="text-sm" style={{ color: "#5A7A6E" }}>Chọn một yêu cầu để xem báo giá</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
