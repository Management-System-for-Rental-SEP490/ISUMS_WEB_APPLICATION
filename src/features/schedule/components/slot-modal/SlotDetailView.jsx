import { ArrowLeft, X, Clock, Briefcase, MapPin, Phone, Hash, CalendarDays, User } from "lucide-react";
import { DAY_NAMES_LONG, MONTH_NAMES } from "../../constants";

function formatDateVN(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayIdx = (d.getDay() + 6) % 7;
  const day = String(d.getDate()).padStart(2, "0");
  return `${DAY_NAMES_LONG[dayIdx]}, ${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatISODate(iso) {
  if (!iso) return "—";
  return iso.substring(0, 10);
}

function initials(str) {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : str.slice(0, 2).toUpperCase();
}

function Skeleton({ className }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />;
}

function InfoRow({ icon: Icon, label, value, loading }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        {loading ? <Skeleton className="h-3.5 w-32" /> : <p className="text-[13px] font-semibold text-slate-700 break-words">{value || "—"}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconBg, children }) {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 ${iconBg ?? "bg-slate-50"} border-b border-slate-100`}>
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 divide-y divide-slate-100">{children}</div>
    </div>
  );
}

const SLOT_STATUS_CFG = {
  booked: { dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border border-teal-200", label: "Đã đặt" },
  cancelled: { dot: "bg-red-400", badge: "bg-red-50 text-red-400 border border-red-200", label: "Đã hủy" },
  inprogress: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border border-blue-200", label: "Đang thực hiện" },
};
function slotCfg(status) { return SLOT_STATUS_CFG[status?.toLowerCase().replace(/_/g, "")] ?? SLOT_STATUS_CFG.booked; }

const ISSUE_STATUS_CFG = {
  WAITING_PAYMENT: { badge: "bg-amber-50 text-amber-700 border border-amber-200", label: "Chờ thanh toán" },
  PAID: { badge: "bg-green-50 text-green-700 border border-green-200", label: "Đã thanh toán" },
  PENDING: { badge: "bg-slate-100 text-slate-600 border border-slate-200", label: "Chờ xử lý" },
  IN_PROGRESS: { badge: "bg-blue-50 text-blue-700 border border-blue-200", label: "Đang xử lý" },
  DONE: { badge: "bg-green-50 text-green-700 border border-green-200", label: "Hoàn thành" },
  CANCELLED: { badge: "bg-red-50 text-red-400 border border-red-200", label: "Đã hủy" },
};
function issueStatusCfg(status) { return ISSUE_STATUS_CFG[status?.toUpperCase()] ?? { badge: "bg-slate-100 text-slate-500 border border-slate-200", label: status ?? "—" }; }

const JOB_TYPE_LABELS = { MAINTENANCE: "Bảo trì", ISSUE: "Sửa chữa", INSPECTION: "Kiểm duyệt" };
function jobTypeLabel(t) { return JOB_TYPE_LABELS[t?.toUpperCase()] ?? t ?? "—"; }

const STATUS_LABELS = { booked: "ĐÃ ĐẶT", cancelled: "ĐÃ HỦY", inprogress: "ĐANG XỬ LÝ" };

export default function SlotDetailView({ slot, jobDetails, houseDetails, staffDetails, onBack, onClose }) {
  const cfg = slotCfg(slot.status);
  const isIssue = slot.jobType?.toUpperCase() === "ISSUE";
  const isInspection = slot.jobType?.toUpperCase() === "INSPECTION";
  const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
  const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
  const house = job?.houseId ? houseDetails[job.houseId] : undefined;

  const staffLoading = slot.staffId && staff === undefined;
  const houseLoading = job?.houseId && house === undefined;

  const staffName = isIssue ? (job?.staffName ?? null) : (staff?.fullName ?? staff?.name ?? null);
  const avatarText = staffName ? initials(staffName) : null;
  const houseAddress = house ? [house.address, house.ward, house.commune, house.city].filter(Boolean).join(", ") : null;
  const issueStatusBadge = isIssue ? issueStatusCfg(job?.status) : null;
  const statusKey = slot.status?.toLowerCase().replace(/_/g, "") ?? "booked";
  const statusLabel = STATUS_LABELS[statusKey] ?? slot.status?.toUpperCase() ?? "ĐÃ ĐẶT";

  return (
    <div className="flex flex-col max-h-[90vh] overflow-y-auto bg-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <button type="button" onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="px-6 pt-2 pb-5 text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto overflow-hidden">
            {avatarText ? <span className="text-2xl font-bold text-slate-600">{avatarText}</span> : <User className="w-10 h-10 text-slate-400" />}
          </div>
          <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot}`} />
        </div>
        {staffLoading ? <Skeleton className="h-5 w-36 mx-auto mt-3 mb-1" /> : (
          <h3 className="text-lg font-bold text-slate-800 mt-3 leading-tight">{staffName ?? "Nhân viên"}</h3>
        )}
        <p className="text-sm text-slate-400 mt-0.5">ID: {slot.staffId ? slot.staffId.slice(-8).toUpperCase() : "—"}</p>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">{jobTypeLabel(slot.jobType)}</span>
          {isIssue && issueStatusBadge ? (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${issueStatusBadge.badge}`}>{issueStatusBadge.label}</span>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>{cfg.label}</span>
          )}
        </div>
      </div>

      <div className="px-5 space-y-3 pb-4">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian làm việc</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{slot.startTimeStr} - {slot.endTimeStr}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateVN(slot.date ?? "")}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cơ sở vận hành</p>
              {houseLoading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{house?.name ?? "—"}</p>}
            </div>
          </div>
          {(houseLoading || houseAddress) && (
            <div className="flex items-start gap-2 mt-3 pl-14">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              {houseLoading ? <Skeleton className="h-3 w-48" /> : <p className="text-xs text-slate-400 leading-relaxed">{houseAddress}</p>}
            </div>
          )}
        </div>

        {isIssue && (
          <SectionCard title="Thông tin sự cố" icon={Hash} iconBg="bg-orange-50">
            <InfoRow icon={Hash} label="Tiêu đề" value={job?.title} loading={!job} />
            <InfoRow icon={Briefcase} label="Mô tả" value={job?.description} loading={!job} />
            <InfoRow icon={Phone} label="SĐT khách thuê" value={job?.tenantPhone} loading={!job} />
            <InfoRow icon={User} label="Nhân viên phụ trách" value={job?.staffName} loading={!job} />
            <InfoRow icon={Phone} label="SĐT nhân viên" value={job?.staffPhone} loading={!job} />
          </SectionCard>
        )}

        {isInspection && (
          <SectionCard title="Thông tin kiểm duyệt" icon={Hash} iconBg="bg-purple-50">
            <InfoRow icon={Hash} label="Ghi chú" value={job?.note} loading={!job} />
            <InfoRow icon={CalendarDays} label="Ngày tạo" value={job?.createdAt ? formatISODate(job.createdAt) : undefined} loading={!job} />
          </SectionCard>
        )}

        {!isIssue && !isInspection && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400">Hoàn thành tháng</p>
              <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-sm font-semibold text-slate-400">ca</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400">Đánh giá</p>
              <p className="text-xl font-bold text-slate-800 mt-1">— <span className="text-amber-400 text-base">★</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 space-y-2.5">
        <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition shadow-sm">
          <Phone className="w-4 h-4" />Liên hệ
        </button>
        <button type="button" onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition">
          <Clock className="w-4 h-4" />Lịch sử ca làm việc
        </button>
      </div>

      <div className="pb-5 text-center">
        <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
          Powered by <span className="text-slate-600">ISUMS Property Management</span>
        </p>
      </div>
    </div>
  );
}
