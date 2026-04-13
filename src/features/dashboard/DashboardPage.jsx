import {
  Building2, Users, FileText, Clock,
  AlertCircle, ArrowUpRight, TrendingUp, TrendingDown, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardMap from "./components/DashboardMap";
import HouseStatusDonut from "./components/HouseStatusDonut";
import ContractsByMonthLine from "./components/ContractsByMonthLine";
import ContractStatusBar from "./components/ContractStatusBar";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { STATUS_LABEL, STATUS_BADGE } from "../contracts/utils/contract.constants";

// ── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND_GREEN    = "#3bb582";
const BRAND_BLUE     = "#2096d8";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const COLOR_MAP = {
  teal:  { iconBg: "rgba(59,181,130,0.12)",  iconColor: BRAND_GREEN, border: "#C4DED5",               accentColor: BRAND_GREEN },
  blue:  { iconBg: "rgba(32,150,216,0.12)",  iconColor: BRAND_BLUE,  border: "rgba(32,150,216,0.30)", accentColor: BRAND_BLUE },
  amber: { iconBg: "rgba(245,158,11,0.10)",  iconColor: "#f59e0b",   border: "rgba(245,158,11,0.28)", accentColor: "#f59e0b" },
  red:   { iconBg: "rgba(217,95,75,0.10)",   iconColor: "#D95F4B",   border: "rgba(217,95,75,0.22)",  accentColor: "#D95F4B" },
};

const TREND_CONFIG = {
  properties: { value: 8,  positive: true  },
  users:      { value: 12, positive: true  },
  contracts:  { value: 5,  positive: true  },
  expiring:   { value: 2,  positive: false },
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, color, error, loading, trendKey }) {
  const c     = COLOR_MAP[color] ?? COLOR_MAP.teal;
  const trend = TREND_CONFIG[trendKey];

  const isExpiring = trendKey === "expiring";
  const isEmpty    = isExpiring && !loading && !error && value === 0;

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group relative"
      style={{
        background: "#FAFFFE",
        border: `1px solid ${c.border}`,
        boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08), 0px 1px 2px 0px rgba(16,24,40,0.04)",
      }}
    >
      {/* Top accent bar — brand gradient */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: BRAND_GRADIENT }}
      />

      <div className="p-5 flex items-start gap-4 flex-1">
        {/* Decorative circle */}
        <div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: c.accentColor }}
        />

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: c.iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: c.iconColor }} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate mb-1" style={{ color: "#5A7A6E" }}>
            {title}
          </p>

          {loading ? (
            <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
          ) : error ? (
            <span title={error} className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Lỗi</span>
            </span>
          ) : isEmpty ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: BRAND_GREEN }} />
              <p className="text-xs font-semibold leading-snug" style={{ color: BRAND_GREEN }}>
                Tất cả đang trong hạn ✓
              </p>
            </div>
          ) : (
            <p className="text-2xl font-bold leading-tight" style={{ color: "#1E2D28" }}>
              {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
            </p>
          )}

          {!loading && !error && !isEmpty && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#8ab5a3" }}>{subtitle}</p>
          )}

          {/* Trend badge — below subtitle */}
          {trend && !loading && !error && !isEmpty && (
            <div className="mt-2">
              <span
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: trend.positive ? "rgba(59,181,130,0.10)" : "rgba(217,95,75,0.10)",
                  color: trend.positive ? BRAND_GREEN : "#D95F4B",
                }}
              >
                {trend.positive
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {trend.positive ? "+" : "-"}{trend.value}% tháng này
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recent Contract Row ───────────────────────────────────────────────────────
function ContractRow({ contract }) {
  const navigate    = useNavigate();
  const statusLabel = STATUS_LABEL[contract.status] ?? contract.status ?? "—";
  const statusCls   = STATUS_BADGE[contract.status] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  const endLabel    = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const initials = (contract.tenant ?? contract.name ?? "?")
    .split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();

  return (
    <li
      className="px-4 py-3 transition-colors duration-150 group"
      style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FAF6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: "rgba(59,181,130,0.12)", color: BRAND_GREEN }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate" style={{ color: "#1E2D28" }}>
            {contract.tenant ?? contract.name ?? "—"}
          </p>
          {(contract.property ?? contract.houseName) && (
            <p className="text-[11px] truncate" style={{ color: "#5A7A6E" }}>
              {contract.property ?? contract.houseName}
            </p>
          )}
        </div>

        {/* Date */}
        <p className="text-[10px] hidden sm:flex items-center gap-1 flex-shrink-0" style={{ color: "#8ab5a3" }}>
          <Clock className="w-2.5 h-2.5" />
          {endLabel}
        </p>

        {/* Status + action */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusCls}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/contracts/${contract.id}`)}
            className="p-1 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,181,130,0.1)"; e.currentTarget.style.color = BRAND_GREEN; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
          >
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { stats, houses, recentContracts, loading, errors } = useDashboardStats();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const kpiCards = [
    {
      key: "properties", trendKey: "properties",
      title: "Bất động sản",
      value: stats.properties.total,
      subtitle: "Tổng trong hệ thống",
      icon: Building2, color: "teal",
      error: errors.properties,
    },
    {
      key: "users", trendKey: "users",
      title: "Người dùng",
      value: stats.users.total,
      subtitle: "Tổng tài khoản",
      icon: Users, color: "blue",
      error: errors.users,
    },
    {
      key: "contracts", trendKey: "contracts",
      title: "Hợp đồng",
      value: stats.contracts.total,
      subtitle: "Tổng số hợp đồng",
      icon: FileText, color: "amber",
      error: errors.contracts,
    },
    {
      key: "expiring", trendKey: "expiring",
      title: "Sắp hết hạn",
      value: stats.contracts.expiring ?? 0,
      subtitle: "Trong 30 ngày tới",
      icon: Clock, color: "red",
      error: null,
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">

      {/* ── Header ── */}
      <div style={{ paddingTop: 4 }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND_GREEN }}>
          Tổng quan
        </p>
        {/* Gradient page title */}
        <h2
          className="font-heading text-3xl font-bold"
          style={{
            background: BRAND_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Chào mừng trở lại 👋
        </h2>
        <p className="text-sm mt-0.5 capitalize" style={{ color: "#5A7A6E" }}>{today}</p>
      </div>

      {/* ── Row 1: 4 KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiCards.map((s) => (
          <KpiCard key={s.key} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Row 2: Line Chart (60%) + Donut (40%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3" style={{ minHeight: 300 }}>
          <ContractsByMonthLine />
        </div>
        <div className="lg:col-span-2" style={{ minHeight: 300 }}>
          <HouseStatusDonut />
        </div>
      </div>

      {/* ── Row 3: Bar Chart + Recent Contracts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div style={{ minHeight: 260 }}>
          <ContractStatusBar />
        </div>

        {/* Recent contracts */}
        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: "#FAFFFE",
            border: "1px solid #C4DED5",
            boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08), 0px 1px 2px 0px rgba(16,24,40,0.04)",
            minHeight: 260,
          }}
        >
          {/* Card top accent */}
          <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />

          <div
            className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: BRAND_GREEN }} />
              <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Hợp đồng gần đây</h3>
            </div>
            <div className="flex items-center gap-2">
              {(stats.contracts.expiring ?? 0) > 0 && (
                <span
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(217,95,75,0.10)", color: "#D95F4B" }}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {stats.contracts.expiring} sắp hết hạn
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate("/contracts")}
                className="text-[11px] font-semibold flex items-center gap-0.5 transition"
                style={{ color: BRAND_GREEN }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Tất cả <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {loading ? (
            <ul className="flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-4 py-3 space-y-1.5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                  <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                    <div className="h-2.5 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : errors.contracts ? (
            <p className="px-4 py-5 text-sm" style={{ color: "#D95F4B" }}>{errors.contracts}</p>
          ) : recentContracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <FileText className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              </div>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>Chưa có hợp đồng nào.</p>
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1">
              {recentContracts.slice(0, 5).map((c) => (
                <ContractRow key={c.id} contract={c} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Row 4: Map ── */}
      <DashboardMap houses={houses} />
    </div>
  );
}
