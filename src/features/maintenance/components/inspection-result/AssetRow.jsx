import { useState } from "react";
import { createPortal } from "react-dom";
import { Package, X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import ConditionBar from "./ConditionBar";
import { EVENT_TYPE_CONFIG, formatDateTime, conditionColor } from "../../constants/inspection.constants";

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  if (!images?.length) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.92)" }}
      onClick={onClose}>
      <button type="button" onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl text-white transition"
        style={{ background: "rgba(255,255,255,0.15)" }}>
        <X className="w-5 h-5" />
      </button>
      {images.length > 1 && <>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
          className="absolute left-4 p-2 rounded-xl text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
          className="absolute right-4 p-2 rounded-xl text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </>}
      <img src={images[idx].url} alt="" onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
      <p className="absolute bottom-5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
        {idx + 1} / {images.length}
      </p>
    </div>,
    document.body,
  );
}

// ── ImagePanel — 1 bên (trước hoặc sau) ─────────────────────────────────────
function ImagePanel({ images, label, accentColor, accentBg }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const hasImages = images?.length > 0;
  // Lấy timestamp từ ảnh đầu tiên (tất cả ảnh cùng batch upload nên thời gian giống nhau)
  const uploadedAt = hasImages ? images[0].createdAt : null;

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: accentBg, color: accentColor }}>
          {label}
        </span>
        {uploadedAt && (
          <span className="text-[10px] font-medium" style={{ color: "#9CA3AF" }}>
            {formatDateTime(uploadedAt)}
          </span>
        )}
      </div>

      {hasImages ? (
        <>
          {/* Main image */}
          <div className="relative rounded-xl overflow-hidden cursor-zoom-in group"
            style={{ aspectRatio: "4/3", background: "#EAF4F0" }}
            onClick={() => setLightboxIdx(0)}>
            <img src={images[0].url} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              style={{ background: "rgba(30,45,40,0.35)" }}>
              <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.4)" }}>Xem ảnh</span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-1.5">
              {images.slice(1, 4).map((img, i) => {
                const isLast = i === 2 && images.length > 4;
                return (
                  <div key={img.id}
                    className="relative rounded-lg overflow-hidden cursor-zoom-in flex-1"
                    style={{ aspectRatio: "1/1", background: "#EAF4F0" }}
                    onClick={() => setLightboxIdx(i + 1)}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {isLast && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "rgba(30,45,40,0.55)" }}>
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl flex flex-col items-center justify-center gap-1.5 py-8"
          style={{ background: "#F7FDFB", border: "1px dashed #C4DED5", aspectRatio: "4/3" }}>
          <ImageOff className="w-5 h-5" style={{ color: "#C4DED5" }} />
          <p className="text-[11px]" style={{ color: "#9CA3AF" }}>Không có ảnh</p>
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
}

// ── CompareModal ─────────────────────────────────────────────────────────────
function CompareModal({ event, onClose }) {
  const evCfg = EVENT_TYPE_CONFIG[event.eventType] ?? { label: event.eventType, color: "#5A7A6E", bg: "#EAF4F0" };
  const diff = (event.currentCondition ?? 0) - (event.previousCondition ?? 0);
  const currColor = conditionColor(event.currentCondition ?? 0);
  const prevColor = conditionColor(event.previousCondition ?? 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 720, maxHeight: "90vh", background: "#FAFFFE" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #C4DED5", background: "#ffffff" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#EAF4F0" }}>
              <Package className="w-4 h-4" style={{ color: "#3bb582" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "#1E2D28" }}>{event.assetName}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: evCfg.bg, color: evCfg.color }}>{evCfg.label}</span>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 rounded-xl transition flex-shrink-0"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EAF4F0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Before / After images */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#5A7A6E" }}>
              So sánh ảnh tình trạng
            </p>
            <div className="flex gap-4">
              <ImagePanel
                images={event.oldImages}
                label="Ảnh trước"
                accentColor="#5A7A6E"
                accentBg="rgba(90,122,110,0.10)"
              />
              <div className="w-px flex-shrink-0 self-stretch" style={{ background: "#C4DED5" }} />
              <ImagePanel
                images={event.images}
                label="Ảnh hiện tại"
                accentColor="#2096d8"
                accentBg="rgba(32,150,216,0.10)"
              />
            </div>
          </div>

          {/* Condition comparison */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5A7A6E" }}>Tình trạng kỹ thuật</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] mb-1.5" style={{ color: "#9CA3AF" }}>Trước</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
                    <div className="h-full rounded-full" style={{ width: `${event.previousCondition ?? 0}%`, background: prevColor }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right" style={{ color: prevColor }}>
                    {event.previousCondition ?? 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] mb-1.5" style={{ color: "#9CA3AF" }}>Hiện tại</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
                    <div className="h-full rounded-full" style={{ width: `${event.currentCondition ?? 0}%`, background: currColor }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right" style={{ color: currColor }}>
                    {event.currentCondition ?? 0}%
                  </span>
                </div>
              </div>
            </div>
            {diff !== 0 && (
              <p className="text-xs font-semibold" style={{ color: diff > 0 ? "#3bb582" : "#D95F4B" }}>
                {diff > 0 ? `▲ Tăng +${diff}%` : `▼ Giảm ${diff}%`} so với lần trước
              </p>
            )}
          </div>

          {/* Note */}
          {event.note && (
            <div className="rounded-2xl px-4 py-3" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#5A7A6E" }}>Ghi chú</p>
              <p className="text-sm leading-relaxed" style={{ color: "#1E2D28" }}>{event.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── AssetRow (table row) ─────────────────────────────────────────────────────
export default function AssetRow({ event }) {
  const [modalOpen, setModalOpen] = useState(false);
  const evCfg = EVENT_TYPE_CONFIG[event.eventType] ?? { label: event.eventType, color: "#5A7A6E", bg: "#EAF4F0" };
  const hasImages = (event.oldImages?.length ?? 0) + (event.images?.length ?? 0) > 0;

  return (
    <>
      <tr
        className="transition-colors group"
        style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FFFE")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <td className="pl-5 pr-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAF4F0" }}>
              <Package className="w-4 h-4" style={{ color: "#3bb582" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{event.assetName}</p>
              {event.assetCode && (
                <p className="text-[11px] font-mono" style={{ color: "#9CA3AF" }}>{event.assetCode}</p>
              )}
            </div>
          </div>
        </td>

        <td className="pr-4 py-4 w-28">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
            style={{ background: evCfg.bg, color: evCfg.color }}>
            {evCfg.label}
          </span>
        </td>

        <td className="pr-4 py-4 w-48">
          <ConditionBar prev={event.previousCondition} curr={event.currentCondition} />
        </td>

        <td className="pr-4 py-4">
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5A7A6E", maxWidth: 200 }}>
            {event.note || "—"}
          </p>
        </td>

        <td className="pr-4 py-4 w-36">
          <p className="text-xs" style={{ color: "#5A7A6E" }}>{formatDateTime(event.createdAt)}</p>
        </td>

        <td className="pr-5 py-4 w-28">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition"
            style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,181,130,0.18)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,181,130,0.10)"}
          >
            Xem chi tiết
          </button>
        </td>
      </tr>

      {modalOpen && <CompareModal event={event} onClose={() => setModalOpen(false)} />}
    </>
  );
}
