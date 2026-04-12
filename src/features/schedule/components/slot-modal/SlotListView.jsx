import { Clock, Briefcase, Plus, User, ChevronRight, X } from "lucide-react";

function initials(str) {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : str.slice(0, 2).toUpperCase();
}

function Skeleton({ className }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />;
}

const SLOT_STATUS_CFG = {
  booked: { dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border border-teal-200", label: "Đã đặt" },
  cancelled: { dot: "bg-red-400", badge: "bg-red-50 text-red-400 border border-red-200", label: "Đã hủy" },
  inprogress: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border border-blue-200", label: "Đang thực hiện" },
};

function slotCfg(status) {
  return SLOT_STATUS_CFG[status?.toLowerCase().replace(/_/g, "")] ?? SLOT_STATUS_CFG.booked;
}

const JOB_TYPE_LABELS = { MAINTENANCE: "Bảo trì", ISSUE: "Sửa chữa", INSPECTION: "Kiểm duyệt" };
function jobTypeLabel(t) { return JOB_TYPE_LABELS[t?.toUpperCase()] ?? t ?? "—"; }

export default function SlotListView({ slots, jobDetails, houseDetails, staffDetails, onSelectSlot, onClose, dateFmt, timeSlot }) {
  return (
    <>
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-[18px] h-[18px] text-teal-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 leading-tight">Danh sách ca làm việc</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-bold text-teal-600">{timeSlot.start} - {timeSlot.end}</span>
                <span className="text-slate-300 text-xs">·</span>
                <span className="text-xs text-slate-400">{dateFmt}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Có {slots.length} ca làm việc trong khung giờ này</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />Đã đặt</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Đang thực hiện</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
        {slots.map((slot) => {
          const cfg = slotCfg(slot.status);
          const staff = slot.staffId ? staffDetails[slot.staffId] : undefined;
          const job = slot.jobId ? jobDetails[slot.jobId] : undefined;
          const house = job?.houseId ? houseDetails[job.houseId] : undefined;
          const staffName = staff?.fullName ?? staff?.name ?? null;
          const displayName = staffName ? staffName : staff === undefined && slot.staffId ? null : "Nhân viên";
          const avatarText = staffName ? initials(staffName) : null;
          return (
            <button key={slot.id} type="button" onClick={() => onSelectSlot(slot)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-teal-50/40 transition text-left group">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                  {avatarText ? <span className="text-sm font-bold text-teal-600">{avatarText}</span> : <User className="w-5 h-5 text-teal-400" />}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                {displayName === null ? <Skeleton className="h-3.5 w-28 mb-1" /> : (
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700 transition">{displayName}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">{jobTypeLabel(slot.jobType)}</span>
                  {house === undefined && job?.houseId ? <Skeleton className="h-3 w-20 inline-block" /> : house?.name ? <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{house.name}</span> : null}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="text-right">
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  <p className="text-[10px] text-slate-400 mt-1">{slot.status === "booked" ? `Cập nhật lúc ${slot.startTimeStr}` : `Bắt đầu lúc ${slot.startTimeStr}`}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">ISUMS System</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition">Đóng</button>
          <button type="button" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition shadow-sm">
            <Plus className="w-3.5 h-3.5" />Tạo thêm ca mới
          </button>
        </div>
      </div>
    </>
  );
}
