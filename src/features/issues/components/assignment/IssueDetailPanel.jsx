import { Steps } from "antd";
import { MapPin, Clock, Phone, Wrench, Check, ImageIcon } from "lucide-react";
import dayjs from "dayjs";
import { ISSUE_STATUS_CONFIG } from "../../constants/issue.constants";
import IssueTimeline from "../IssueTimeline";

const B = {
  green: "#3bb582", blue: "#2096d8", card: "#FAFFFE",
  muted: "#EAF4F0", border: "#C4DED5", fg: "#1E2D28", mutedFg: "#5A7A6E",
  gradient: "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)",
  blueMuted: "rgba(32, 150, 216, 0.12)", blueBorder: "rgba(32, 150, 216, 0.35)",
};

function Avatar({ name }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-12 h-12 text-sm rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: B.muted, color: B.green }}>
      {initials}
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: B.mutedFg }}>{children}</p>;
}

export default function IssueDetailPanel({ detail, houseNames, staffDetail, images, imagesLoading, onConfirm, confirming, onOpenLightbox }) {
  const status = detail ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED) : null;

  return (
    <div className="flex-1 min-w-0 rounded-2xl overflow-hidden" style={{ background: B.card, border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid rgba(196,222,213,0.6)` }}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full" style={{ background: B.blueMuted, color: B.blue, border: `1px solid ${B.blueBorder}` }}>
              Issue #{String(detail.id).slice(0, 8).toUpperCase()}
            </span>
            {status && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                {status.label}
              </span>
            )}
          </div>
          <h3 className="font-heading text-xl font-bold leading-snug" style={{ color: B.fg }}>{detail.title}</h3>
          {detail.houseId && (
            <p className="flex items-center gap-1.5 text-sm mt-1.5" style={{ color: B.mutedFg }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: B.green }} />
              {houseNames[detail.houseId] ?? "Đang tải..."}
            </p>
          )}
        </div>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: B.gradient }}
        >
          <Check className="w-4 h-4" />
          {confirming ? "Đang xác nhận..." : "Xác nhận ca làm việc"}
        </button>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 space-y-5">
        {/* Description + meta */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: B.mutedFg }}>Chi tiết</p>
            <p className="text-sm leading-relaxed" style={{ color: B.fg }}>{detail.description ?? "Không có mô tả."}</p>
            <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: B.mutedFg }}>
              <Clock className="w-3 h-3" style={{ color: B.green }} />
              {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
            </p>
          </div>
          <div className="px-4 py-3 grid grid-cols-4 gap-4" style={{ borderTop: `1px solid ${B.border}`, background: "#FAFFFE" }}>
            {[
              { label: "Mã yêu cầu", value: String(detail.id).slice(0, 8).toUpperCase(), mono: true },
              { label: "Loại", value: "Sửa chữa" },
              { label: "Ngày tạo", value: dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm") },
              { label: "SĐT khách", value: detail.tenantPhone ?? "—" },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: B.mutedFg }}>{label}</p>
                <p className={`text-xs font-semibold ${mono ? "font-mono" : ""}`} style={{ color: B.fg }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff + Schedule */}
        <div className="grid grid-cols-2 gap-5">
          {/* Staff */}
          <div>
            <SectionLabel>Kỹ thuật viên phụ trách</SectionLabel>
            {detail.assignedStaffId ? (
              !staffDetail ? (
                <div className="rounded-xl p-4 flex items-center gap-3 animate-pulse" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
                  <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: B.muted }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded w-2/3" style={{ background: B.muted }} />
                    <div className="h-3 rounded w-1/2" style={{ background: B.muted }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
                  <Avatar name={staffDetail?.name ?? detail.staffName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: B.fg }}>{staffDetail?.name ?? detail.staffName ?? "Nhân viên"}</p>
                    {staffDetail?.phoneNumber && (
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: B.mutedFg }}>
                        <Phone className="w-3 h-3" />{staffDetail.phoneNumber}
                      </p>
                    )}
                    {staffDetail?.email && <p className="text-xs mt-0.5 truncate" style={{ color: B.mutedFg }}>{staffDetail.email}</p>}
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5" style={{ background: B.blueMuted, color: B.blue }}>Nhân viên kỹ thuật</span>
                  </div>
                  {(staffDetail?.phoneNumber ?? detail.staffPhone) && (
                    <a
                      href={`tel:${staffDetail?.phoneNumber ?? detail.staffPhone}`}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
                      style={{ background: B.gradient }}
                    >
                      <Phone className="w-3.5 h-3.5" />Gọi
                    </a>
                  )}
                </div>
              )
            ) : (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.2)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(217,95,75,0.10)" }}>
                  <Wrench className="w-4 h-4" style={{ color: "#D95F4B" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>Chưa phân công</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(217,95,75,0.7)" }}>Cần gán nhân viên trước khi xác nhận</p>
                </div>
              </div>
            )}

            {/* Images */}
            {(imagesLoading || images.length > 0) && (
              <div className="mt-4">
                <SectionLabel>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" />Ảnh đính kèm
                    {images.length > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: B.muted, color: B.mutedFg }}>{images.length}</span>
                    )}
                  </span>
                </SectionLabel>
                {imagesLoading ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: B.muted }} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button key={img.id} onClick={() => onOpenLightbox(idx)} className="block aspect-square rounded-xl overflow-hidden transition hover:scale-[1.03]" style={{ border: `1px solid ${B.border}` }}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <SectionLabel>Lịch trình thực hiện</SectionLabel>
            <div className="rounded-xl p-4" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
              <Steps
                direction="vertical"
                size="small"
                current={detail.endTime ? 1 : detail.startTime ? 0 : -1}
                items={[
                  {
                    title: <span className="text-xs font-semibold" style={{ color: B.fg }}>Bắt đầu</span>,
                    description: <span className="text-xs" style={{ color: B.mutedFg }}>{detail.startTime ? dayjs(detail.startTime).format("HH:mm · DD/MM/YYYY") : "Chưa xác định"}</span>,
                  },
                  {
                    title: <span className="text-xs font-semibold" style={{ color: B.fg }}>Kết thúc dự kiến</span>,
                    description: (
                      <div>
                        <span className="text-xs" style={{ color: B.mutedFg }}>{detail.endTime ? dayjs(detail.endTime).format("HH:mm · DD/MM/YYYY") : "Chưa xác định"}</span>
                        {detail.startTime && detail.endTime && (
                          <p className="text-[11px] mt-1" style={{ color: B.green }}>
                            ≈ {(dayjs(detail.endTime).diff(dayjs(detail.startTime), "minute") / 60).toFixed(1)} giờ
                          </p>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <SectionLabel>Lịch sử xử lý</SectionLabel>
          <div className="rounded-xl px-5 py-5" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
            <IssueTimeline status={detail.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
