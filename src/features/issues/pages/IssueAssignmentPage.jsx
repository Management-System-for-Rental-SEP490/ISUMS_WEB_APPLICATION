import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Clock, UserCheck, RefreshCw, Wrench, Phone,
  Check, Hash, Tag, CalendarDays, CalendarClock, ArrowRight,
  ImageIcon, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { getAllIssues, getIssueById, getTicketImages } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import { confirmManagerWorkSlot } from "../../maintenance/api/maintenance.api";
import { toast } from "react-toastify";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// ── Brand tokens ──────────────────────────────────────────────
const B = {
  green:     "#3bb582",
  blue:      "#2096d8",
  bg:        "#F7FDFB",
  card:      "#FAFFFE",
  muted:     "#EAF4F0",
  border:    "#C4DED5",
  fg:        "#1E2D28",
  mutedFg:   "#5A7A6E",
  gradient:  "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)",
  blueMuted: "rgba(32, 150, 216, 0.12)",
  blueBorder:"rgba(32, 150, 216, 0.35)",
};

// ── Sub-components ─────────────────────────────────────────────

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const cls = size === "lg" ? "w-12 h-12 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: B.muted, color: B.green }}
    >
      {initials}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: B.mutedFg }}>
      {children}
    </p>
  );
}

function InfoRow({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 last:border-0"
      style={{ borderBottom: `1px solid rgba(196, 222, 213, 0.5)` }}
    >
      <span className="flex items-center gap-2 text-xs" style={{ color: B.mutedFg }}>
        <Icon className="w-3.5 h-3.5" style={{ color: B.green }} />
        {label}
      </span>
      <span className={`text-xs font-semibold ${valueClass}`} style={{ color: B.fg }}>
        {value}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function IssueAssignmentPage() {
  const [issues,        setIssues]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [selectedDetail,setSelectedDetail]= useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming,    setConfirming]    = useState(false);
  const [houseNames,    setHouseNames]    = useState({});
  const [staffDetail,   setStaffDetail]   = useState(null);
  const [images,        setImages]        = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({ type: "REPAIR", status: "WAITING_MANAGER_CONFIRM" });
      const list = Array.isArray(data) ? data : [];
      setIssues(list);
      if (list.length > 0) setSelected(list[0]);

      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id)
            .then((h) => [id, h?.name ?? h?.houseName ?? "—"])
            .catch(() => [id, "—"]),
        ),
      );
      setHouseNames(Object.fromEntries(entries));
    } catch (err) {
      setError(err?.message ?? "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleSelectIssue = async (issue) => {
    setSelected(issue);
    setSelectedDetail(null);
    setStaffDetail(null);
    setImages([]);
    setDetailLoading(true);
    setImagesLoading(true);
    try {
      const [detail, imgs] = await Promise.all([
        getIssueById(issue.id),
        getTicketImages(issue.id).catch(() => []),
      ]);
      setSelectedDetail(detail);
      setImages(Array.isArray(imgs) ? imgs : []);
      if (detail?.houseId && !houseNames[detail.houseId]) {
        getHouseById(detail.houseId)
          .then((h) => setHouseNames((prev) => ({ ...prev, [detail.houseId]: h?.name ?? h?.houseName ?? "—" })))
          .catch(() => {});
      }
      if (detail?.assignedStaffId) {
        getUserById(detail.assignedStaffId)
          .then((s) => setStaffDetail(s))
          .catch(() => {});
      }
    } catch {
      // fallback to list data
    } finally {
      setDetailLoading(false);
      setImagesLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      await confirmManagerWorkSlot(selected.id);
      toast.success(`Đã xác nhận ca làm việc: ${selected.title}`);
      setSelected(null);
      setSelectedDetail(null);
      setStaffDetail(null);
      setImages([]);
      fetchIssues();
    } catch (e) {
      toast.error(e.message ?? "Xác nhận thất bại, vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  const detail = selectedDetail ?? selected;
  const status = detail
    ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED)
    : null;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: B.muted }}>
              <UserCheck className="w-3.5 h-3.5" style={{ color: B.green }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: B.green }}>
              Sửa chữa
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: B.fg }}>
            Phân công xử lý
          </h2>
          <p className="text-sm mt-1" style={{ color: B.mutedFg }}>
            {loading ? "Đang tải..." : `${issues.length} yêu cầu sửa chữa chờ xử lý`}
          </p>
        </div>

        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: B.muted,
            color: B.green,
            border: `1px solid ${B.border}`,
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
          style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.25)" }}
        >
          <p className="text-sm font-medium" style={{ color: "#D95F4B" }}>{error}</p>
          <button
            onClick={fetchIssues}
            className="text-xs font-semibold underline"
            style={{ color: "#D95F4B" }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="flex gap-6 items-start">

        {/* LEFT — issue list */}
        <div
          className="w-72 flex-shrink-0 rounded-2xl overflow-hidden"
          style={{
            background: B.card,
            border: `1px solid ${B.border}`,
            boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)",
          }}
        >
          {/* List header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ borderBottom: `1px solid rgba(196,222,213,0.6)` }}
          >
            <p className="text-sm font-bold font-heading" style={{ color: B.fg }}>
              Yêu cầu sửa chữa
            </p>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: B.muted, color: B.green }}
            >
              {issues.length}
            </span>
          </div>

          {/* List items */}
          <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
            {loading &&
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="px-4 py-3.5 space-y-2 animate-pulse" style={{ borderBottom: `1px solid rgba(196,222,213,0.3)` }}>
                  <div className="h-3 rounded-lg w-1/3" style={{ background: B.muted }} />
                  <div className="h-4 rounded-lg w-3/4" style={{ background: "#EAF4F0" }} />
                  <div className="h-3 rounded-lg w-1/2" style={{ background: "#EAF4F0" }} />
                </div>
              ))}

            {!loading && issues.length === 0 && (
              <div className="py-12 text-center text-sm" style={{ color: B.mutedFg }}>
                Không có yêu cầu nào
              </div>
            )}

            {!loading && issues.map((issue) => {
              const isActive = selected?.id === issue.id;
              return (
                <button
                  key={issue.id}
                  onClick={() => handleSelectIssue(issue)}
                  className="w-full text-left px-4 py-3.5 transition-all duration-200"
                  style={{
                    borderBottom: `1px solid rgba(196,222,213,0.3)`,
                    background: isActive ? "rgba(59,181,130,0.08)" : "transparent",
                    borderLeft: isActive ? "3px solid #3bb582" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = B.muted; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg"
                      style={{ background: B.blueMuted, color: B.blue }}
                    >
                      #{String(issue.id).slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px]" style={{ color: B.mutedFg }}>
                      {dayjs(issue.createdAt).fromNow()}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold leading-snug truncate"
                    style={{ color: B.fg }}
                  >
                    {issue.title}
                  </p>
                  <p className="text-[11px] mt-1 flex items-center gap-1">
                    {issue.assignedStaffId ? (
                      <span
                        className="font-medium flex items-center gap-1"
                        style={{ color: B.blue }}
                      >
                        <UserCheck className="w-3 h-3" />
                        {issue.staffName ?? "Đã phân công"}
                      </span>
                    ) : (
                      <span className="font-medium" style={{ color: "#D95F4B" }}>
                        ● Chưa phân công
                      </span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — detail panel */}
        {!loading && selected ? (
          <div
            className="flex-1 min-w-0 rounded-2xl overflow-hidden"
            style={{
              background: B.card,
              border: `1px solid ${B.border}`,
              boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)",
            }}
          >
            {/* Detail header */}
            <div
              className="px-6 py-5 flex items-start justify-between gap-4"
              style={{ borderBottom: `1px solid rgba(196,222,213,0.6)` }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full"
                    style={{ background: B.blueMuted, color: B.blue, border: `1px solid ${B.blueBorder}` }}
                  >
                    Issue #{String(detail.id).slice(0, 8).toUpperCase()}
                  </span>
                  {status && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                      {status.label}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl font-bold leading-snug" style={{ color: B.fg }}>
                  {detail.title}
                </h3>
                {detail.houseId && (
                  <p className="flex items-center gap-1.5 text-sm mt-1.5" style={{ color: B.mutedFg }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: B.green }} />
                    {houseNames[detail.houseId] ?? "Đang tải..."}
                  </p>
                )}
              </div>

              {/* CTA confirm button */}
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-float disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: B.gradient }}
              >
                <Check className="w-4 h-4" />
                {confirming ? "Đang xác nhận..." : "Xác nhận ca làm việc"}
              </button>
            </div>

            {/* Detail body */}
            <div className="px-6 py-6 grid grid-cols-2 gap-6">

              {/* LEFT column */}
              <div className="space-y-5">

                {/* Mô tả */}
                <div>
                  <SectionLabel>Mô tả</SectionLabel>
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${B.border}`,
                      borderLeft: `3px solid ${B.green}`,
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.fg }}>
                      {detail.description ?? "Không có mô tả."}
                    </p>
                    <div
                      className="flex items-center gap-1.5 mt-3 pt-3 text-[11px]"
                      style={{ borderTop: `1px solid ${B.border}`, color: B.mutedFg }}
                    >
                      <Clock className="w-3.5 h-3.5" style={{ color: B.green }} />
                      {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
                    </div>
                  </div>
                </div>

                {/* Ảnh đính kèm */}
                {(imagesLoading || images.length > 0) && (
                  <div>
                    <SectionLabel>
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Ảnh đính kèm
                        {images.length > 0 && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: B.muted, color: B.mutedFg }}
                          >
                            {images.length}
                          </span>
                        )}
                      </span>
                    </SectionLabel>
                    {imagesLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: B.muted }} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((img, idx) => (
                          <button
                            key={img.id}
                            onClick={() => setLightboxIndex(idx)}
                            className="block aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-soft"
                            style={{ border: `1px solid ${B.border}` }}
                          >
                            <img src={img.url} alt="Ảnh đính kèm" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ca làm việc */}
                {detail.startTime && (
                  <div>
                    <SectionLabel>Ca làm việc</SectionLabel>
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        background: "#ffffff",
                        border: `1px solid ${B.border}`,
                        borderLeft: `3px solid ${B.blue}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                            <CalendarClock className="w-4 h-4" style={{ color: B.green }} />
                          </div>
                          <div className="w-px flex-1 min-h-[24px]" style={{ background: B.border }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: B.green }} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: B.green }}>Bắt đầu</p>
                            <p className="text-sm font-bold" style={{ color: B.fg }}>
                              {dayjs(detail.startTime).format("HH:mm")}
                              <span className="font-normal ml-1.5 text-xs" style={{ color: B.mutedFg }}>
                                {dayjs(detail.startTime).format("DD/MM/YYYY")}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2" style={{ color: B.border }}>
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span className="text-[11px]" style={{ color: B.mutedFg }}>
                              {detail.endTime
                                ? `${dayjs(detail.endTime).diff(dayjs(detail.startTime), "minute")} phút`
                                : ""}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: B.green }}>Kết thúc</p>
                            <p className="text-sm font-bold" style={{ color: B.fg }}>
                              {detail.endTime ? dayjs(detail.endTime).format("HH:mm") : "—"}
                              {detail.endTime && (
                                <span className="font-normal ml-1.5 text-xs" style={{ color: B.mutedFg }}>
                                  {dayjs(detail.endTime).format("DD/MM/YYYY")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT column */}
              <div className="space-y-5">

                {/* Nhân viên xử lý */}
                <div>
                  <SectionLabel>Nhân viên xử lý</SectionLabel>
                  {detail.assignedStaffId ? (
                    detailLoading || (!staffDetail && detail.assignedStaffId) ? (
                      <div
                        className="rounded-2xl p-4 flex items-center gap-3 animate-pulse"
                        style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
                      >
                        <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: B.muted }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 rounded-lg w-2/3" style={{ background: B.muted }} />
                          <div className="h-3 rounded-lg w-1/2" style={{ background: B.muted }} />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
                      >
                        <Avatar name={staffDetail?.name ?? detail.staffName} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: B.fg }}>
                            {staffDetail?.name ?? detail.staffName ?? "Nhân viên"}
                          </p>
                          {staffDetail?.phoneNumber && (
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: B.mutedFg }}>
                              <Phone className="w-3 h-3" />
                              {staffDetail.phoneNumber}
                            </p>
                          )}
                          {staffDetail?.email && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: B.mutedFg }}>
                              {staffDetail.email}
                            </p>
                          )}
                          {staffDetail?.roles?.[0] && (
                            <span
                              className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full mt-1"
                              style={{ background: B.blueMuted, color: B.blue }}
                            >
                              Nhân viên kỹ thuật
                            </span>
                          )}
                        </div>
                        {(staffDetail?.phoneNumber ?? detail.staffPhone) && (
                          <a
                            href={`tel:${staffDetail?.phoneNumber ?? detail.staffPhone}`}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:shadow-soft"
                            style={{ background: B.gradient }}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Gọi
                          </a>
                        )}
                      </div>
                    )
                  ) : (
                    <div
                      className="rounded-2xl p-4 flex items-center gap-3"
                      style={{
                        background: "rgba(217,95,75,0.06)",
                        border: "1px solid rgba(217,95,75,0.2)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(217,95,75,0.10)" }}
                      >
                        <Wrench className="w-5 h-5" style={{ color: "#D95F4B" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>Chưa phân công</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(217,95,75,0.7)" }}>
                          Nhấn "Gán nhân viên" để phân công
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div>
                  <SectionLabel>Thông tin</SectionLabel>
                  <div
                    className="rounded-2xl px-4 py-1"
                    style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
                  >
                    <InfoRow icon={Hash}        label="Mã yêu cầu" value={String(detail.id).slice(0, 8).toUpperCase()} valueClass="font-mono" />
                    <InfoRow icon={Tag}         label="Loại"        value="Sửa chữa" />
                    <InfoRow icon={CalendarDays} label="Ngày tạo"   value={dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm")} />
                    <InfoRow icon={Phone}       label="SĐT khách"   value={detail.tenantPhone ?? "—"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div
              className="flex-1 rounded-2xl flex items-center justify-center py-24"
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
              }}
            >
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: B.muted }}
                >
                  <Wrench className="w-7 h-7" style={{ color: B.green }} />
                </div>
                <p className="text-sm font-medium" style={{ color: B.mutedFg }}>
                  Chọn một yêu cầu để xem chi tiết
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(30,45,40,0.85)" }}
          onClick={() => setLightboxIndex(null)}
        >
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
              className="absolute left-4 p-3 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <img
            src={images[lightboxIndex].url}
            alt="Ảnh đính kèm"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
              className="absolute right-4 p-3 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)" }}
            >
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
