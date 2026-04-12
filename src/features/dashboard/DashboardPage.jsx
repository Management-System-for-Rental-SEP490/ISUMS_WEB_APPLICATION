import { Building2, Users, FileText, Clock, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardMap from "./components/DashboardMap";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { STATUS_LABEL, STATUS_BADGE } from "../contracts/utils/contract.constants";

const EXPIRING_DAYS = 30;

// Brand-aligned icon container colors
const COLOR_MAP = {
  teal:  {
    iconBg:   "rgba(59, 181, 130, 0.12)",
    iconColor: "#3bb582",
    border:   "#C4DED5",
    gradient:  "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)",
  },
  blue:  {
    iconBg:   "rgba(32, 150, 216, 0.12)",
    iconColor: "#2096d8",
    border:   "rgba(32, 150, 216, 0.35)",
    gradient:  "linear-gradient(135deg, #2096d8 0%, rgba(59,181,130,0.7) 100%)",
  },
  amber: {
    iconBg:   "rgba(59, 181, 130, 0.08)",
    iconColor: "#3bb582",
    border:   "#C4DED5",
    gradient:  "linear-gradient(135deg, rgba(59,181,130,0.7) 0%, #2096d8 100%)",
  },
};

function StatCard({ title, value, subtitle, icon: Icon, color, error, loading }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-float group relative overflow-hidden"
      style={{
        background: "#FAFFFE",
        border: `1px solid ${c.border}`,
        boxShadow: "0 4px 20px -2px rgba(59, 181, 130, 0.10)",
      }}
    >
      {/* Subtle gradient top-right decoration */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: c.gradient }}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: c.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: c.iconColor }} />
        </div>
        {error && (
          <span title={error}>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </span>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7A6E" }}>
        {title}
      </p>

      {loading ? (
        <div className="h-10 w-20 rounded-xl animate-pulse mb-2" style={{ background: "#EAF4F0" }} />
      ) : (
        <p className="text-4xl font-heading font-bold mb-1 tracking-tight" style={{ color: "#1E2D28" }}>
          {value}
        </p>
      )}

      <p className="text-xs" style={{ color: "#5A7A6E" }}>{subtitle}</p>
    </div>
  );
}

function ContractRow({ contract }) {
  const navigate = useNavigate();
  const statusLabel = STATUS_LABEL[contract.status] ?? contract.status ?? "—";
  const statusCls   = STATUS_BADGE[contract.status] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  const endLabel    = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString("vi-VN")
    : "—";

  return (
    <li
      className="px-5 py-3.5 transition-colors duration-200 group cursor-default"
      style={{ borderBottom: "1px solid rgba(196, 222, 213, 0.4)" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>
            {contract.tenant ?? contract.name ?? "—"}
          </p>
          {(contract.property ?? contract.houseName) && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#5A7A6E" }}>
              {contract.property ?? contract.houseName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${statusCls}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/contracts/${contract.id}`)}
            className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,181,130,0.1)"; e.currentTarget.style.color = "#3bb582"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
            title="Xem chi tiết"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs mt-1" style={{ color: "#5A7A6E" }}>Hết hạn: {endLabel}</p>
    </li>
  );
}

export default function DashboardPage() {
  const { stats, houses, recentContracts, loading, errors } = useDashboardStats();

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      key: "properties",
      title: "Bất động sản cho thuê",
      value: stats.properties.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số trong hệ thống",
      icon: Building2,
      color: "teal",
      error: errors.properties,
    },
    {
      key: "users",
      title: "Người dùng hệ thống",
      value: stats.users.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số người dùng",
      icon: Users,
      color: "blue",
      error: errors.users,
    },
    {
      key: "contracts",
      title: "Hợp đồng",
      value: stats.contracts.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số hợp đồng",
      icon: FileText,
      color: "amber",
      error: errors.contracts,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59,181,130,0.12)" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>
              Tổng quan
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            Chào mừng trở lại 👋
          </h2>
          <p className="text-sm mt-1 capitalize" style={{ color: "#5A7A6E" }}>{today}</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((s) => (
          <StatCard
            key={s.key}
            title={s.title}
            value={s.value}
            subtitle={s.subtitle}
            icon={s.icon}
            color={s.color}
            error={s.error}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Map + Recent Contracts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardMap houses={houses} />
        </div>

        {/* Recent contracts panel */}
        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: "#FAFFFE",
            border: "1px solid #C4DED5",
            boxShadow: "0 4px 20px -2px rgba(59, 181, 130, 0.10)",
            minHeight: 560,
          }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(196, 222, 213, 0.6)" }}
          >
            <h3 className="font-heading font-semibold text-sm" style={{ color: "#1E2D28" }}>
              Hợp đồng gần đây
            </h3>
            {stats.contracts.expiring > 0 && (
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(217, 95, 75, 0.10)",
                  color: "#D95F4B",
                }}
              >
                <Clock className="w-3 h-3" />
                {stats.contracts.expiring} sắp hết hạn
              </span>
            )}
          </div>

          {/* Panel body */}
          {loading ? (
            <ul className="flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-5 py-4 space-y-2" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                  <div className="h-3.5 w-2/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-3 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                </li>
              ))}
            </ul>
          ) : errors.contracts ? (
            <p className="px-5 py-6 text-sm" style={{ color: "#D95F4B" }}>{errors.contracts}</p>
          ) : recentContracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <FileText className="w-6 h-6" style={{ color: "#3bb582" }} />
              </div>
              <p className="text-sm" style={{ color: "#5A7A6E" }}>Chưa có hợp đồng nào.</p>
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1">
              {recentContracts.map((c) => (
                <ContractRow key={c.id} contract={c} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
