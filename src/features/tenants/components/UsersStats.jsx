function StatCard({ label, value, iconPath, iconBg, iconColor }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: iconColor }}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{label}</p>
        <p className="text-2xl font-heading font-bold leading-tight" style={{ color: "#1E2D28" }}>{value}</p>
      </div>
    </div>
  );
}

export default function UsersStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Tổng người dùng"
        value={stats.total}
        iconBg="rgba(59,181,130,0.12)"
        iconColor="#3bb582"
        iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <StatCard
        label="Kết quả tìm kiếm"
        value={stats.filtered}
        iconBg="rgba(32,150,216,0.12)"
        iconColor="#2096d8"
        iconPath="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </div>
  );
}
