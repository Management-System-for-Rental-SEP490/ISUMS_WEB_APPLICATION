import { Building2, Users, FileText, Clock, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardMap from "./components/DashboardMap";
import HouseStatusDonut from "./components/HouseStatusDonut";
import ContractsByMonthLine from "./components/ContractsByMonthLine";
import ContractStatusBar from "./components/ContractStatusBar";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { STATUS_LABEL, STATUS_BADGE } from "../contracts/utils/contract.constants";

const COLOR_MAP = {
  teal:  { iconBg: "rgba(59,181,130,0.12)",  iconColor: "#3bb582", border: "#C4DED5",               gradient: "linear-gradient(135deg,#3bb582 0%,rgba(32,150,216,0.7) 100%)" },
  blue:  { iconBg: "rgba(32,150,216,0.12)",  iconColor: "#2096d8", border: "rgba(32,150,216,0.30)", gradient: "linear-gradient(135deg,#2096d8 0%,rgba(59,181,130,0.7) 100%)" },
  amber: { iconBg: "rgba(245,158,11,0.10)",  iconColor: "#f59e0b", border: "rgba(245,158,11,0.28)", gradient: "linear-gradient(135deg,#f59e0b 0%,rgba(59,181,130,0.5) 100%)" },
  red:   { iconBg: "rgba(217,95,75,0.10)",   iconColor: "#D95F4B", border: "rgba(217,95,75,0.22)",  gradient: "linear-gradient(135deg,#D95F4B 0%,rgba(245,158,11,0.5) 100%)" },
};

function KpiCard({ title, value, subtitle, icon: Icon, color, error, loading }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden"
      style={{ background: "#FAFFFE", border: `1px solid ${c.border}`, boxShadow: "0 2px 12px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-[0.07] pointer-events-none" style={{ background: c.gradient }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: c.iconBg }}>
        <Icon className="w-5 h-5" style={{ color: c.iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider truncate" style={{ color: "#5A7A6E" }}>{title}</p>
        {loading
          ? <div className="h-7 w-14 rounded-lg animate-pulse mt-1" style={{ background: "#EAF4F0" }} />
          : <p className="text-2xl font-heading font-bold leading-tight" style={{ color: "#1E2D28" }}>{value}</p>
        }
        <p className="text-[11px] truncate" style={{ color: "#8ab5a3" }}>{subtitle}</p>
      </div>
      {error && <span title={error}><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" /></span>}
    </div>
  );
}

function ContractRow({ contract }) {
  const navigate = useNavigate();
  const statusLabel = STATUS_LABEL[contract.status] ?? contract.status ?? "—";
  const statusCls   = STATUS_BADGE[contract.status] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  const endLabel    = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <li
      className="px-4 py-3 transition-colors duration-150 group"
      style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate" style={{ color: "#1E2D28" }}>
            {contract.tenant ?? contract.name ?? "—"}
          </p>
          {(contract.property ?? contract.houseName) && (
            <p className="text-[11px] truncate mt-0.5" style={{ color: "#5A7A6E" }}>
              {contract.property ?? contract.houseName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusCls}`}>{statusLabel}</span>
          <button
            type="button"
            onClick={() => navigate(`/contracts/${contract.id}`)}
            className="p-1 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,181,130,0.1)"; e.currentTarget.style.color = "#3bb582"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
          >
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#8ab5a3" }}>
        <Clock className="w-2.5 h-2.5" />
        Hết hạn: {endLabel}
      </p>
    </li>
  );
}

export default function DashboardPage() {
  const { stats, houses, recentContracts, loading, errors } = useDashboardStats();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const kpiCards = [
    { key: "properties", title: "Bất động sản",  value: stats.properties.total.toLocaleString("vi-VN"), subtitle: "Tổng trong hệ thống", icon: Building2, color: "teal",  error: errors.properties },
    { key: "users",      title: "Người dùng",     value: stats.users.total.toLocaleString("vi-VN"),      subtitle: "Tổng tài khoản",      icon: Users,    color: "blue",  error: errors.users },
    { key: "contracts",  title: "Hợp đồng",       value: stats.contracts.total.toLocaleString("vi-VN"),  subtitle: "Tổng số hợp đồng",    icon: FileText, color: "amber", error: errors.contracts },
    { key: "expiring",   title: "Sắp hết hạn",    value: (stats.contracts.expiring ?? 0).toLocaleString("vi-VN"), subtitle: "Trong 30 ngày tới", icon: Clock, color: "red", error: null },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Tổng quan</span>
        </div>
        <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Chào mừng trở lại 👋</h2>
        <p className="text-sm mt-0.5 capitalize" style={{ color: "#5A7A6E" }}>{today}</p>
      </div>

      {/* ── Row 1: 4 KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((s) => <KpiCard key={s.key} {...s} loading={loading} />)}
      </div>

      {/* ── Row 2: Line Chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2" style={{ minHeight: 280 }}>
          <ContractsByMonthLine />
        </div>
        <div style={{ minHeight: 280 }}>
          <HouseStatusDonut />
        </div>
      </div>

      {/* ── Row 3: Bar Chart + Recent Contracts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar chart */}
        <div style={{ minHeight: 260 }}>
          <ContractStatusBar />
        </div>

        {/* Recent contracts panel */}
        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 2px 12px -2px rgba(59,181,130,0.08)", minHeight: 260 }}
        >
          <div className="px-4 py-3.5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}>
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
              <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Hợp đồng gần đây</h3>
            </div>
            <div className="flex items-center gap-2">
              {stats.contracts.expiring > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(217,95,75,0.10)", color: "#D95F4B" }}>
                  <Clock className="w-2.5 h-2.5" />
                  {stats.contracts.expiring} sắp hết hạn
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate("/contracts")}
                className="text-[11px] font-semibold flex items-center gap-0.5 transition"
                style={{ color: "#3bb582" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Tất cả <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {loading ? (
            <ul className="flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-4 py-3 space-y-1.5" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                  <div className="h-3 w-2/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-2.5 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                </li>
              ))}
            </ul>
          ) : errors.contracts ? (
            <p className="px-4 py-5 text-sm" style={{ color: "#D95F4B" }}>{errors.contracts}</p>
          ) : recentContracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <FileText className="w-5 h-5" style={{ color: "#3bb582" }} />
              </div>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>Chưa có hợp đồng nào.</p>
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1">
              {recentContracts.map((c) => <ContractRow key={c.id} contract={c} />)}
            </ul>
          )}
        </div>
      </div>

      {/* ── Row 4: Map ── */}
      <DashboardMap houses={houses} />
    </div>
  );
}
