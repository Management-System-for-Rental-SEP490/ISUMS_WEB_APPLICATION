import { useState } from "react";
import { Download, Plus, RefreshCw, Sparkles } from "lucide-react";
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
    timeSlots,
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
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Lịch làm việc</span>
        </div>
        <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
          Lịch làm việc chi tiết
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng slot trong tuần"
          value={weekLoading ? "—" : String(totalJobs).padStart(2, "0")}
          sub={<><span style={{ color: "#3bb582" }}>↗</span> Tổng slot đã ghi nhận</>}
          iconBg="rgba(59,181,130,0.12)"
          iconColor="#3bb582"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Slot đã đặt (Booked)"
          value={weekLoading ? "—" : String(pendingJobs).padStart(2, "0")}
          sub={<><span style={{ color: "#f59e0b" }}>●</span> Đang được phân công</>}
          iconBg="rgba(245,158,11,0.12)"
          iconColor="#b45309"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Thợ đang rảnh"
          value="05"
          sub={<><span style={{ color: "#2096d8" }}>●</span> Sẵn sàng điều phối</>}
          iconBg="rgba(32,150,216,0.12)"
          iconColor="#2096d8"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-full overflow-hidden" style={{ border: "1px solid #C4DED5" }}>
          {["week", "month"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className="px-4 py-2 text-sm font-semibold transition"
              style={
                viewMode === mode
                  ? { background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)", color: "#ffffff" }
                  : { background: "#FAFFFE", color: "#5A7A6E" }
              }
              onMouseEnter={e => { if (viewMode !== mode) e.currentTarget.style.background = "#EAF4F0"; }}
              onMouseLeave={e => { if (viewMode !== mode) e.currentTarget.style.background = "#FAFFFE"; }}
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
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ marginLeft: "-8px", background: "#EAF4F0", border: "2px solid #ffffff", color: "#5A7A6E" }}
            >
              +12
            </div>
          </div>
          <button
            type="button"
            onClick={viewMode === "week" ? refetchWeek : refetchMonth}
            disabled={viewMode === "week" ? weekLoading : monthLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", background: "#FAFFFE", color: "#5A7A6E" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FAFFFE"; }}
          >
            <RefreshCw
              className={["w-4 h-4", (viewMode === "week" ? weekLoading : monthLoading) ? "animate-spin" : ""].join(" ")}
            />
            Làm mới
          </button>
          <button
            type="button"
            onClick={() => setCreateShiftOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full transition shadow-sm"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            <Plus className="w-4 h-4" />
            Xác nhận các ca làm việc mới
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
          timeSlots={timeSlots}
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
        onCreated={refetchWeek}
      />

      {/* Legend + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "#5A7A6E" }}>
          <span className="font-semibold" style={{ color: "#1E2D28" }}>Chú thích trạng thái:</span>
          {[
            { dot: "#3bb582", label: "Đã đặt (Booked)" },
            { dot: "#D95F4B", label: "Đã hủy (Cancelled)" },
          ].map(({ dot, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition"
          style={{ color: "#3bb582" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#2096d8"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#3bb582"; }}
        >
          <Download className="w-3.5 h-3.5" />
          {viewMode === "week" ? "Xuất báo cáo tuần (.pdf)" : "Xuất báo cáo tháng (.pdf)"}
        </button>
      </div>
    </div>
  );
}
