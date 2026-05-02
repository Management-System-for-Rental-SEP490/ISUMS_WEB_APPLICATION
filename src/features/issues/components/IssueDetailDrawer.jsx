import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { Drawer } from "antd";
import { MapPin, Clock, MessageSquare, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getIssueById, getResponseByTicket } from "../api/issues.api";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${cls} rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function ImageLightbox({ images, index, onClose, onNext, onPrev }) {
  if (index === null || !images[index]) return null;
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
      style={{ background: "rgba(30,45,40,0.85)", zIndex: 1200 }}
      onClick={onClose}
    >
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-3 rounded-full"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <img
        src={images[index].url}
        alt=""
        className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 p-3 rounded-full"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
      >
        <X className="w-5 h-5" />
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)" }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body
  );
}

export default function IssueDetailDrawer({ open, ticketId, onClose }) {
  const { t } = useTranslation("common");
  const [detail, setDetail]   = useState(null);
  const [reply, setReply]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!open || !ticketId) return;
    setDetail(null); setReply(null); setError(null); setLightboxIndex(null);
    setLoading(true);
    getIssueById(ticketId)
      .then((ticketDetail) => {
        setDetail(ticketDetail);
        if (ticketDetail?.status === "DONE") {
          getResponseByTicket(ticketId)
            .then((resp) => setReply(resp?.localizedContent ?? resp?.content ?? null))
            .catch(() => null);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, ticketId]);

  const status = detail ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED) : null;

  return (
    <>
    <Drawer
      open={open}
      onClose={onClose}
      size={520}
      destroyOnClose
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg tracking-wide uppercase">
            {t("issues.drawerIdLabel")}: #{String(ticketId ?? "").slice(0, 8).toUpperCase()}
          </span>
          {detail?.createdAt && (
            <span className="text-[11px] text-gray-400">
              {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: status.bg, color: status.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
              {t(status.i18nKey, { defaultValue: status.i18nKey })}
            </span>
          )}
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
          {loading ? t("issues.loading") : (detail?.title ?? "—")}
        </h2>
      </div>

      {/* Body */}
      <div className="overflow-y-auto">
        {loading && (
          <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-7 h-7 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <p className="text-sm">{t("issues.drawerLoadingInfo")}</p>
          </div>
        )}
        {error && <div className="py-10 text-center text-red-500 text-sm px-6">{error}</div>}

        {!loading && detail && (
          <>
            {/* Resident + Location */}
            <div className="grid grid-cols-2 gap-3 px-6 pt-5">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                <Avatar name={detail.tenant?.name ?? detail.tenantName} />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("issues.drawerTenant")}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{detail.tenant?.name ?? detail.tenantName ?? "—"}</p>
                  {(detail.tenant?.phoneNumber ?? detail.tenantPhone) && (
                    <p className="text-xs text-gray-500 mt-0.5">{detail.tenant?.phoneNumber ?? detail.tenantPhone}</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t("issues.drawerLocation")}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{detail.house?.name ?? "—"}</p>
                  {detail.house?.address && <p className="text-xs text-gray-500 mt-0.5 truncate">{detail.house.address}</p>}
                </div>
              </div>
            </div>

            {/* Inquiry */}
            <div className="px-6 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t("issues.drawerInquiry")}</p>
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
                      <MapPin className="w-3.5 h-3.5" /> {detail.houseUnit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reply */}
            {detail.status === "DONE" && (
              <div className="px-6 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-teal-500" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t("issues.replyLabel")}</p>
                </div>
                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                  {reply === null ? (
                    <p className="text-sm text-gray-400 italic">{t("issues.replyLoadingReply")}</p>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reply}</p>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {detail.images?.length > 0 && (
              <div className="px-6 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-teal-500" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {t("issues.drawerImages")}
                    <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-600">
                      {detail.images.length}
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {detail.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setLightboxIndex(idx)}
                      className="block aspect-square rounded-xl overflow-hidden border border-gray-100 transition hover:scale-[1.03]"
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-6" />
          </>
        )}
      </div>
    </Drawer>
    <ImageLightbox
      images={detail?.images ?? []}
      index={lightboxIndex}
      onClose={() => setLightboxIndex(null)}
      onNext={() => setLightboxIndex((i) => (i + 1) % (detail?.images?.length ?? 1))}
      onPrev={() => setLightboxIndex((i) => (i - 1 + (detail?.images?.length ?? 1)) % (detail?.images?.length ?? 1))}
    />
    </>
  );
}
