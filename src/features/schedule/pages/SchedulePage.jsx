import { useState } from "react";
import { Download, Plus, RefreshCw } from "lucide-react";
import { AVATARS } from "../constants";
import { getWeekDays, localDateStr } from "../utils/dateHelpers";
import { useWorkSchedule, useMonthSchedule } from "../hooks/useSchedule";
import StatCard from "../components/StatCard";
import AvatarCircle from "../components/AvatarCircle";
import WeekView from "../components/WeekView";
import MonthView from "../components/MonthView";
import CreateShiftModal from "../components/CreateShiftModal";

export default function SchedulePage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState("week");
  const [createShiftOpen, setCreateShiftOpen] = useState(false);
  const [weekBase, setWeekBase] = useState(new Date(today));
  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  /* ── Week data ── */
  const weekDays = getWeekDays(weekBase);
  const startStr = localDateStr(weekDays[0]);
  const endStr = localDateStr(weekDays[6]);
  const {
    slotGrid,
    template,
    loading: weekLoading,
    refetch: refetchWeek,
  } = useWorkSchedule(startStr, endStr);

  /* ── Month data ── */
  const {
    slotGrid: monthSlotGrid,
    loading: monthLoading,
    refetch: refetchMonth,
  } = useMonthSchedule(monthYear.year, monthYear.month);

  /* ── Stats (derived from current week slotGrid) ── */
  const allSlots = Object.values(slotGrid).flatMap((byTime) =>
    Object.values(byTime).flat(),
  );
  const totalJobs = allSlots.length;
  const pendingJobs = allSlots.filter((s) => s.status === "booked").length;

  /* ── Navigation ── */
  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };
  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };
  const prevMonth = () =>
    setMonthYear(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  const nextMonth = () =>
    setMonthYear(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Lịch làm việc chi tiết
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Theo dõi và quản lý lịch sửa chữa, bảo trì hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng slot trong tuần"
          value={weekLoading ? "—" : String(totalJobs).padStart(2, "0")}
          sub={
            <>
              <span className="text-green-500">↗</span> Tổng slot đã ghi nhận
            </>
          }
          subColor="text-green-600"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Slot đã đặt (Booked)"
          value={weekLoading ? "—" : String(pendingJobs).padStart(2, "0")}
          sub={
            <>
              <span className="text-teal-500">●</span> Đang được phân công
            </>
          }
          subColor="text-teal-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Thợ đang rảnh"
          value="05"
          sub={
            <>
              <span className="text-emerald-500">●</span> Sẵn sàng điều phối
            </>
          }
          subColor="text-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {["week", "month"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                viewMode === mode
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode === "week" ? "Theo tuần" : "Theo tháng"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {AVATARS.map((a, i) => (
              <AvatarCircle key={i} initials={a} index={i} />
            ))}
            <div
              className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0"
              style={{ marginLeft: "-8px" }}
            >
              +12
            </div>
          </div>
          <button
            type="button"
            onClick={viewMode === "week" ? refetchWeek : refetchMonth}
            disabled={viewMode === "week" ? weekLoading : monthLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "w-4 h-4",
                (viewMode === "week" ? weekLoading : monthLoading)
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />
            Làm mới
          </button>
          <button
            type="button"
            onClick={() => setCreateShiftOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo ca làm việc mới
          </button>
        </div>
      </div>

      {/* Calendar */}
      {viewMode === "week" ? (
        <WeekView
          weekBase={weekBase}
          onPrev={prevWeek}
          onNext={nextWeek}
          slotGrid={slotGrid}
          template={template}
          loading={weekLoading}
        />
      ) : (
        <MonthView
          year={monthYear.year}
          month={monthYear.month}
          onPrev={prevMonth}
          onNext={nextMonth}
          slotGrid={monthSlotGrid}
          loading={monthLoading}
        />
      )}

      <CreateShiftModal
        open={createShiftOpen}
        onClose={() => setCreateShiftOpen(false)}
      />

      {/* Legend + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="font-semibold text-slate-600">
            Chú thích trạng thái:
          </span>
          {[
            { dot: "bg-teal-500",   label: "Bảo trì" },
            { dot: "bg-orange-500", label: "Sửa chữa" },
            { dot: "bg-blue-500",   label: "Kiểm tra" },
            { dot: "bg-purple-500", label: "Vệ sinh" },
          ].map(({ dot, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5" />
          {viewMode === "week"
            ? "Xuất báo cáo tuần (.pdf)"
            : "Xuất báo cáo tháng (.pdf)"}
        </button>
      </div>
    </div>
  );
}
