export default function StatCard({ title, value, sub, subColor, iconBg, iconColor, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 leading-none">{value}</p>
          <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${subColor}`}>{sub}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
