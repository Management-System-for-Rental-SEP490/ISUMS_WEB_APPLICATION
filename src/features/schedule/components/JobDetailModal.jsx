import { AlertTriangle, Clock, MapPin, User, Wrench, X } from "lucide-react";
import { STATUS_CONFIG } from "../constants";

export default function JobDetailModal({ job, slotTime, onClose }) {
  if (!job) return null;
  const cfg = STATUS_CONFIG[job.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b border-slate-100 border-l-4 ${cfg.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.badge} mb-2`}>
                {cfg.label}
              </span>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {[
            { icon: <Clock className="w-4 h-4" />,  label: "Giờ thực hiện", value: slotTime ?? "—"               },
            { icon: <MapPin className="w-4 h-4" />, label: "Khu nhà",        value: job.property                  },
            { icon: <Wrench className="w-4 h-4" />, label: "Vị trí cụ thể", value: job.room                      },
            { icon: <User className="w-4 h-4" />,   label: "Kỹ thuật viên", value: job.assignee ?? "Chưa phân công" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
              </div>
            </div>
          ))}

          {job.priority === "high" && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-amber-700">Ưu tiên xử lý cao</span>
            </div>
          )}

          {job.note && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 mb-1">Ghi chú</p>
              <p className="text-xs text-slate-600 leading-relaxed">{job.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
