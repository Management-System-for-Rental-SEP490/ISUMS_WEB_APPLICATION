import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  Building2, Home, CalendarClock, AlertCircle,
  CheckCircle2, FileText, Clock, ArrowUpRight, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HouseStatusDonut from "./components/HouseStatusDonut";
import ContractsByMonthLine from "./components/ContractsByMonthLine";
import ContractStatusBar from "./components/ContractStatusBar";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { STATUS_LABEL, STATUS_BADGE } from "../contracts/utils/contract.constants";

const BRAND_GREEN    = "#3bb582";
const BRAND_BLUE     = "#2096d8";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const COLOR_MAP = {
  teal:  { iconBg: "rgba(59,181,130,0.12)",  iconColor: BRAND_GREEN, border: "#C4DED5",               accentColor: BRAND_GREEN },
  blue:  { iconBg: "rgba(32,150,216,0.12)",  iconColor: BRAND_BLUE,  border: "rgba(32,150,216,0.30)", accentColor: BRAND_BLUE  },
  amber: { iconBg: "rgba(245,158,11,0.10)",  iconColor: "#f59e0b",   border: "rgba(245,158,11,0.28)", accentColor: "#f59e0b"   },
  red:   { iconBg: "rgba(217,95,75,0.10)",   iconColor: "#D95F4B",   border: "rgba(217,95,75,0.22)",  accentColor: "#D95F4B"   },
};

function KpiCard({ title, value, subtitle, icon: Icon, color, loading, isGood, allOnTimeLabel }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  const isEmpty = isGood && !loading && value === 0;

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group relative"
      style={{ background: "#FFFFFF", border: `1px solid ${c.border}`, boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
      <div className="p-5 flex items-start gap-4 flex-1">
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.05] pointer-events-none" style={{ background: c.accentColor }} />
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
          style={{ background: c.iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: c.iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate mb-1" style={{ color: "#5A7A6E" }}>{title}</p>
          {loading ? (
            <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
          ) : isEmpty ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: BRAND_GREEN }} />
              <p className="text-xs font-semibold" style={{ color: BRAND_GREEN }}>{allOnTimeLabel}</p>
            </div>
          ) : (
            <p className="text-2xl font-bold leading-tight" style={{ color: "#1E2D28" }}>
              {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
            </p>
          )}
          {!loading && !isEmpty && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#8ab5a3" }}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractRow({ contract }) {
  const navigate    = useNavigate();
  const { t }       = useTranslation("common");
  const statusLabel = t(`contracts.status.${contract.status}`, { defaultValue: STATUS_LABEL[contract.status] ?? contract.status ?? "—" });
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
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: "rgba(59,181,130,0.12)", color: BRAND_GREEN }}
        >
          {initials}
        </div>
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
        <p className="text-[10px] hidden sm:flex items-center gap-1 flex-shrink-0" style={{ color: "#8ab5a3" }}>
          <Clock className="w-2.5 h-2.5" />
          {endLabel}
        </p>
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

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const [period, setPeriod] = useState("6M");
  const { propertyStats, contractTimeSeries, contractStatusBreakdown, recentContracts, totalContracts, totalUsers, loading, error } = useDashboardStats(period);
  const navigate = useNavigate();

  const today = dayjs().format("dddd, D MMMM YYYY");

  const kpiCards = [
    { key: "totalContracts", title: t("dashboard.stats.totalContracts"), value: totalContracts,       subtitle: t("dashboard.stats.inSystem"),    icon: FileText,  color: "teal"  },
    { key: "totalHouses",    title: t("dashboard.stats.totalHouses"),    value: propertyStats.total,  subtitle: t("dashboard.stats.realEstate"),  icon: Building2, color: "blue"  },
    { key: "totalUsers",     title: t("dashboard.stats.totalUsers"),     value: totalUsers,           subtitle: t("dashboard.stats.registered"),  icon: Users,     color: "amber" },
    { key: "rented",         title: t("dashboard.stats.rentedHouses"),   value: propertyStats.rented, subtitle: t("dashboard.stats.hasContract"), icon: Home,      color: "red", isGood: true },
  ];

  return (
    <div className="space-y-5 md:space-y-6">

      <div style={{ paddingTop: 4 }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND_GREEN }}>
          {t("dashboard.overview")}
        </p>
        <h2
          className="font-heading text-3xl font-bold"
          style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          {t("dashboard.welcome")}
        </h2>
        <p className="text-sm mt-0.5 capitalize" style={{ color: "#5A7A6E" }}>{today}</p>
      </div>

      {error && !loading && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.25)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D95F4B" }} />
          <p className="text-sm" style={{ color: "#D95F4B" }}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {kpiCards.map(({ key, ...s }) => (
          <KpiCard key={key} {...s} loading={loading} allOnTimeLabel={t("dashboard.stats.allOnTime")} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5" style={{ height: 380 }}>
        <div className="lg:col-span-2 flex flex-col">
          <HouseStatusDonut propertyStats={propertyStats} loading={loading} />
        </div>
        <div className="lg:col-span-3 flex flex-col">
          <ContractsByMonthLine
            timeSeries={contractTimeSeries}
            period={period}
            onPeriodChange={setPeriod}
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div className="flex flex-col" style={{ height: 380 }}>
          <ContractStatusBar breakdown={contractStatusBreakdown} loading={loading} />
        </div>

        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)", height: 380 }}
        >
          <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
          <div
            className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: BRAND_GREEN }} />
              <h3 className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
                {t("dashboard.recentContracts.title")}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {(propertyStats.expiringSoon ?? 0) > 0 && (
                <span
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(217,95,75,0.10)", color: "#D95F4B" }}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {propertyStats.expiringSoon} {t("dashboard.recentContracts.expiringSoon")}
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
                {t("dashboard.recentContracts.viewAll")} <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {loading ? (
            <ul className="flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.3)" }}>
                  <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                    <div className="h-2.5 w-1/2 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : recentContracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
                <FileText className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              </div>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>{t("dashboard.recentContracts.empty")}</p>
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

    </div>
  );
}
