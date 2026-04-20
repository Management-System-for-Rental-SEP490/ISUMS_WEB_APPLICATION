import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Wrench, CheckCircle, AlertTriangle, Home, X, Info, ImageIcon,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { updateQuoteStatus } from "../api/issues.api";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import ImageLightbox from "./assignment/ImageLightbox";

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount ?? 0);
}

function StaffAvatar({ name }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div
      className="w-14 h-14 rounded-full text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm"
      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
    >
      {initials}
    </div>
  );
}

export default function QuoteDetail({ quote, ticket, houseName, onApproved, onRejected }) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = Array.isArray(ticket.images) ? ticket.images : [];
  const isApproved = quote.status === "APPROVED";
  const isRejected = quote.status === "REJECTED";
  const s = ISSUE_STATUS_CONFIG[ticket.status] ?? ISSUE_STATUS_CONFIG.CREATED;

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
    <>
      <div className="space-y-5">
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Ticket info */}
          <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", borderLeft: "4px solid #3bb582", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#5A7A6E" }}>Mã yêu cầu</p>
                <p className="text-2xl font-black" style={{ color: "#1E2D28" }}>#{String(ticket.id).slice(0, 8).toUpperCase()}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                {s.label}
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Địa chỉ bảo trì</p>
                  <p className="text-sm mt-0.5" style={{ color: "#1E2D28" }}>{houseName ?? "Đang tải..."}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>Mô tả sự cố</p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#1E2D28" }}>{ticket.description ?? "Không có mô tả."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician */}
          <div className="rounded-2xl p-5 flex flex-col" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#5A7A6E" }}>Kỹ thuật viên</p>
            {ticket.assignedStaffId ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <StaffAvatar name={ticket.staffName} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>{ticket.staffName ?? "Nhân viên"}</p>
                    {ticket.staffPhone && <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>{ticket.staffPhone}</p>}
                  </div>
                </div>
                {quote.isTenantFault && (
                  <div className="mt-auto flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.2)" }}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D95F4B" }} />
                    <p className="text-xs font-semibold" style={{ color: "#D95F4B" }}>Lỗi do khách thuê</p>
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
          <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4" style={{ color: "#3bb582" }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#5A7A6E" }}>Ảnh đính kèm</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#EAF4F0", color: "#5A7A6E" }}>{images.length}</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {images.map((img, idx) => (
                <button key={img.id} onClick={() => setLightboxIndex(idx)} className="block aspect-square rounded-xl overflow-hidden transition hover:scale-[1.03]" style={{ border: "1px solid #C4DED5" }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quote table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
            <p className="text-base font-bold" style={{ color: "#1E2D28" }}>Báo giá từ kỹ thuật viên</p>
            <p className="text-xs" style={{ color: "#5A7A6E" }}>Cập nhật: {dayjs(quote.createdAt).format("HH:mm · DD/MM/YYYY")}</p>
          </div>
          <div className="grid grid-cols-[1fr_100px_120px_120px] gap-4 px-6 py-3" style={{ background: "#EAF4F0", borderBottom: "1px solid #C4DED5" }}>
            {["Hạng mục chi tiết", "Số lượng", "Đơn giá", "Thành tiền"].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{h}</p>
            ))}
          </div>
          {(quote.items ?? []).length === 0 && (
            <div className="py-10 text-center text-sm" style={{ color: "#5A7A6E" }}>Không có hạng mục nào</div>
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
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}>
                  <span className="text-xs font-bold" style={{ color: "#3bb582" }}>{idx + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{item.itemName}</p>
                  {item.description && <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>{item.description}</p>}
                </div>
              </div>
              <p className="text-sm" style={{ color: "#5A7A6E" }}>01</p>
              <p className="text-sm" style={{ color: "#1E2D28" }}>{formatCurrency(item.price)}</p>
              <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{formatCurrency(item.price)}</p>
            </div>
          ))}
        </div>

        {/* Total + actions */}
        <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          <div className="flex-1 min-w-0 rounded-xl px-5 py-4" style={{ background: "rgba(59,181,130,0.08)", border: "1px solid #C4DED5" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#3bb582" }}>Tổng chi phí dự kiến</p>
            <p className="font-heading text-3xl font-black" style={{ color: "#1E2D28" }}>{formatCurrency(quote.totalPrice)}</p>
            <p className="text-xs mt-1" style={{ color: "#5A7A6E" }}>Giá đã bao gồm thuế VAT và phí dịch vụ kỹ thuật.</p>
          </div>
          {!isApproved && !isRejected ? (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button" onClick={handleReject} disabled={rejecting}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: "1px solid rgba(217,95,75,0.4)", color: "#D95F4B", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,95,75,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <X className="w-4 h-4" />
                {rejecting ? "Đang từ chối..." : "Từ chối"}
              </button>
              <button
                type="button" onClick={handleApprove} disabled={confirming}
                className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
              >
                <CheckCircle className="w-4 h-4" />
                {confirming ? "Đang duyệt..." : "Duyệt báo giá"}
              </button>
            </div>
          ) : isApproved ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl flex-shrink-0" style={{ background: "rgba(59,181,130,0.10)", border: "1px solid #C4DED5" }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#3bb582" }} />
              <p className="text-sm font-bold" style={{ color: "#3bb582" }}>Đã duyệt</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl flex-shrink-0" style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.3)" }}>
              <X className="w-5 h-5" style={{ color: "#D95F4B" }} />
              <p className="text-sm font-bold" style={{ color: "#D95F4B" }}>Đã từ chối</p>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: "rgba(32,150,216,0.06)", border: "1px solid rgba(32,150,216,0.2)" }}>
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#2096d8" }} />
          <div>
            <p className="text-xs font-bold mb-0.5" style={{ color: "#2096d8" }}>Lưu ý quan trọng</p>
            <p className="text-xs leading-relaxed" style={{ color: "#1a6fa8" }}>
              Sau khi bạn nhấn "Duyệt báo giá", kỹ thuật viên sẽ nhận được thông báo và bắt đầu công việc ngay lập tức. Mọi thay đổi sau khi duyệt cần liên hệ trực tiếp với bộ phận hỗ trợ ISUMS.
            </p>
          </div>
        </div>
      </div>

      {createPortal(
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
        />,
        document.body,
      )}
    </>
  );
}
