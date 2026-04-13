import { Phone, Mail, Check, Bot, Sparkles, CalendarClock } from "lucide-react";

function Avatar({ name }) {
  const initials = (name ?? "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
      {initials}
    </div>
  );
}

export default function Step3Staff({ staffMode, setStaffMode, availableStaff, staffLoading, selectedStaffId, setSelectedStaffId, error }) {
  return (
    <div className="space-y-5">
      {/* Mode toggle — same for all job types */}
      <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 bg-white">
        <div>
          <p className="text-sm font-semibold text-slate-700">Chế độ phân công</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {staffMode === "auto" ? "Hệ thống sẽ tự động chọn nhân sự tối ưu nhất" : "Bạn tự chọn nhân viên thực hiện"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setStaffMode((m) => (m === "auto" ? "manual" : "auto")); setSelectedStaffId(null); }}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${staffMode === "auto" ? "bg-teal-600" : "bg-slate-300"}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${staffMode === "auto" ? "left-7" : "left-1"}`} />
        </button>
      </div>

      {/* Auto info banner */}
      {staffMode === "auto" && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-teal-200 bg-teal-50">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-700">Tự động sắp xếp nhân sự</p>
            <p className="text-xs text-teal-600 mt-1 leading-relaxed">
              Hệ thống sẽ tự động chọn nhân viên phù hợp nhất dựa trên lịch làm việc. Thông báo sẽ được gửi ngay khi ca được tạo thành công.
            </p>
          </div>
        </div>
      )}

      {/* Staff list — shown in manual mode */}
      {staffMode === "manual" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Nhân viên khả dụng</p>
            {!staffLoading && availableStaff.length > 0 && (
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                {availableStaff.length} đang rảnh
              </span>
            )}
          </div>

          {staffLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : availableStaff.length === 0 ? (
            <div className="flex items-center gap-2.5 px-4 py-4 rounded-xl border border-slate-200 bg-slate-50">
              <Bot className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-500">Không có nhân viên nào rảnh trong khung giờ này.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {availableStaff.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(isSelected ? null : staff.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-200"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={staff.name} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{staff.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {staff.phone && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />{staff.phone}
                          </span>
                        )}
                        {staff.email && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <Mail className="w-3 h-3" />{staff.email}
                          </span>
                        )}
                        <span className="text-[11px] text-green-600 font-medium">• Đang rảnh</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 text-slate-400"}`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedStaffId && (
            <div className="flex items-start gap-2.5 px-4 py-3 mt-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">i</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đã chọn 1 nhân sự. Hệ thống sẽ gửi thông báo ngay khi ca làm việc được khởi tạo thành công.
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
