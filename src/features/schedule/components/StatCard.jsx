export default function StatCard({ title, value, sub, iconBg, iconColor, icon }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{title}</p>
          <p className="font-heading text-3xl font-bold mt-2 leading-none" style={{ color: "#1E2D28" }}>{value}</p>
          <p className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: "#5A7A6E" }}>{sub}</p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg ?? "rgba(59,181,130,0.12)", color: iconColor ?? "#3bb582" }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
