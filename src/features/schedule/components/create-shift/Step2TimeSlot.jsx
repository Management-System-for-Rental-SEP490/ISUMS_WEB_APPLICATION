import { DatePicker } from "antd";
import { CalendarDays, Users } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

function formatDateVN(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const SLOT_LABELS = ["Ca Sáng 1","Ca Sáng 2","Ca Sáng 3","Ca Chiều 1","Ca Chiều 2","Ca Chiều 3","Ca Tối 1","Ca Tối 2","Ca Tối 3"];

export default function Step2TimeSlot({ selectedDate, setSelectedDate, timeSlots, slotsLoading, selectedSlot, setSelectedSlot }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Chọn ngày thực hiện</p>
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          size="large"
          value={selectedDate ? dayjs(selectedDate) : null}
          disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
          onChange={(d) => {
            if (d && d.day() === 0) {
              toast.warning("Không thể sắp xếp lịch vào ngày nghỉ (Chủ Nhật)");
              return;
            }
            setSelectedDate(d ? d.format("YYYY-MM-DD") : "");
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Khung giờ làm việc</p>
          {selectedSlot && (
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              Đã chọn: {selectedSlot.start} – {selectedSlot.end}
            </span>
          )}
        </div>

        {!selectedDate ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <CalendarDays className="w-8 h-8" />
            <p className="text-sm">Vui lòng chọn ngày để xem các khung giờ khả dụng</p>
          </div>
        ) : slotsLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : timeSlots.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Không có khung giờ khả dụng cho ngày này.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot, idx) => {
              const active = selectedSlot?.start === slot.start;
              const unavailable = slot.status !== "AVAILABLE";
              return (
                <button
                  key={slot.start}
                  type="button"
                  disabled={unavailable}
                  onClick={() => setSelectedSlot(slot)}
                  className={[
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                    unavailable ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : active ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50",
                  ].join(" ")}
                >
                  <span className={`text-[10px] font-semibold mb-1 ${active ? "text-teal-100" : unavailable ? "text-slate-300" : "text-slate-400"}`}>
                    {SLOT_LABELS[idx] ?? `Ca ${idx + 1}`}
                  </span>
                  <span className="text-xs font-bold">{slot.start} – {slot.end}</span>
                  {!unavailable && (
                    <span className={`flex items-center gap-1 text-[10px] mt-1 ${active ? "text-teal-100" : "text-slate-400"}`}>
                      <Users className="w-3 h-3" />{slot.availableStaffCount} rảnh
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
            Đã chọn <strong>{selectedSlot.start} – {selectedSlot.end}</strong> ngày{" "}
            <strong>{formatDateVN(selectedDate)}</strong>. Có{" "}
            <strong>{selectedSlot.availableStaffCount} nhân viên</strong> sẵn sàng trong khung giờ này.
          </p>
        </div>
      )}
    </div>
  );
}
