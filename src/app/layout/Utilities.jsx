import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Zap, Droplet, TrendingUp, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Settings2, ChevronRight, Gauge,
} from "lucide-react";
import { useUtilityAlerts } from "../../features/utilities/hooks/useUtilityAlerts";
import HouseAlertDrawer from "../../features/utilities/components/HouseAlertDrawer";

/**
 * Utility alerts dashboard — production wired.
 *
 * Flow: component mounts → useUtilityAlerts fires GET /api/assets/utility-alerts
 * → BE composes EIF forecast + iot_thresholds + live alerts → we render
 * one tile per house, summary KPIs at the bottom, drawer on click.
 *
 * Gas was dropped per product decision — ISUMS pipeline doesn't ingest
 * gas today. If it ever does, add to UtilityMetric enum on BE + here.
 *
 * What the landlord/manager uses this page for:
 *  - spot houses approaching or past their monthly consumption cap
 *  - contact the tenant or schedule an on-site inspection
 *  - set/adjust the monthly limit per house
 */

const TABS = [
  { id: "electricity", metric: "electricity", icon: Zap,     color: "amber" },
  { id: "water",       metric: "water",       icon: Droplet, color: "blue"  },
];

// Tailwind safelisted status colour tokens — keeping them in a map lets
// the tile use the same set and keeps string interpolation out of the
// Tailwind JIT scanner's way (it won't see `bg-red-100` otherwise).
const STATUS_STYLE = {
  CRITICAL: { bar: "bg-red-500",    text: "text-red-600",    chip: "bg-red-50 text-red-600 border-red-200" },
  WARNING:  { bar: "bg-amber-500",  text: "text-amber-600",  chip: "bg-amber-50 text-amber-600 border-amber-200" },
  GOOD:     { bar: "bg-teal-500",   text: "text-teal-600",   chip: "bg-teal-50 text-teal-600 border-teal-200" },
  NO_DATA:  { bar: "bg-slate-300",  text: "text-slate-500",  chip: "bg-slate-50 text-slate-500 border-slate-200" },
};

function formatNumber(v) {
  if (v === null || v === undefined) return "—";
  return Number(v).toLocaleString("vi-VN");
}

export default function Utilities() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState("electricity");
  const activeMetric = TABS.find((x) => x.id === activeTab)?.metric ?? "electricity";
  const { data, loading, error, refresh } = useUtilityAlerts(activeMetric);
  const [selectedHouseId, setSelectedHouseId] = useState(null);

  const items = data?.items ?? [];
  const summary = data?.summary ?? null;
  const unit = data?.unit ?? "";
  const selectedHouse = useMemo(
    () => items.find((h) => h.houseId === selectedHouseId) ?? null,
    [items, selectedHouseId],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("utilitiesPage.title")}</h2>
          <p className="text-gray-600">{t("utilitiesPage.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("issuePriceList.refresh")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition"
          >
            <Settings2 className="w-4 h-4" />
            {t("utilitiesPage.addConfig")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="flex gap-2">
          {TABS.map((type) => {
            const Icon = type.icon;
            const active = activeTab === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
                  active
                    ? `bg-${type.color}-100 text-${type.color}-700 font-semibold`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t(`utilitiesPage.tabs.${type.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {t("utilitiesPage.consumption.heading", { type: t(`utilitiesPage.tabs.${activeTab}`) })}
            </h3>
            <p className="text-sm text-gray-500">
              {data?.month ? `${t("utilitiesPage.consumption.currentMonth")} — ${data.month}` : t("utilitiesPage.consumption.currentMonth")}
            </p>
          </div>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>

        {/* Error banner */}
        {error && !loading && (
          <div className="mb-4 rounded-xl px-4 py-3 flex items-center justify-between border border-red-200 bg-red-50">
            <div>
              <p className="text-sm font-semibold text-red-700">{t("utilitiesPage.states.errorTitle")}</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <button onClick={refresh} className="text-xs font-semibold underline text-red-700">
              {t("utilitiesPage.states.errorRetry")}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-slate-100 rounded mb-3" />
                <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100">
              <Gauge className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 max-w-md">{t("utilitiesPage.states.empty")}</p>
          </div>
        )}

        {/* Tiles */}
        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => <HouseTile key={item.houseId} item={item} unit={unit} t={t} onClick={() => setSelectedHouseId(item.houseId)} />)}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && summary && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            label={t("utilitiesPage.summary.total")}
            value={`${formatNumber(summary.totalUsage)} ${unit}`}
            caption={t("utilitiesPage.summary.thisMonth")}
            icon={TrendingUp}
            iconColor="text-teal-500"
          />
          <SummaryCard
            label={t("utilitiesPage.summary.average")}
            value={`${formatNumber(summary.avgPerHouse)} ${unit}`}
            caption={t("utilitiesPage.summary.perProperty")}
            icon={Clock}
            iconColor="text-blue-500"
          />
          <SummaryCard
            label={t("utilitiesPage.summary.alerts")}
            value={summary.housesOverThreshold}
            caption={t("utilitiesPage.summary.properties")}
            icon={AlertTriangle}
            iconColor="text-amber-500"
            emphasise={summary.housesOverThreshold > 0}
          />
        </div>
      )}

      <HouseAlertDrawer
        open={!!selectedHouse}
        onClose={() => setSelectedHouseId(null)}
        house={selectedHouse}
        metric={activeMetric}
      />
    </div>
  );
}

function HouseTile({ item, unit, t, onClick }) {
  const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.NO_DATA;
  const hasLimit = item.monthlyLimit != null;
  const pct = item.usagePercent ?? (hasLimit && item.currentUsage != null ? (item.currentUsage / item.monthlyLimit) * 100 : null);
  const clampedPct = pct != null ? Math.min(pct, 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-teal-200 transition"
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate mb-1">{item.houseName}</h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>{t("utilitiesPage.consumption.used")}: <b>{formatNumber(item.currentUsage)} {unit}</b></span>
            {hasLimit ? (
              <span>{t("utilitiesPage.consumption.limit")}: {formatNumber(item.monthlyLimit)} {unit}</span>
            ) : (
              <span className="text-slate-400 italic">{t("utilitiesPage.consumption.noLimit")}</span>
            )}
            {item.forecastTotal != null && (
              <span>{t("utilitiesPage.consumption.forecast")}: {formatNumber(item.forecastTotal)} {unit}</span>
            )}
            {item.daysLeft != null && (
              <span>{t("utilitiesPage.consumption.daysLeft", { days: item.daysLeft, count: item.daysLeft })}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.activeAlertCount > 0 && (
            <span className={`text-[11px] px-2 py-1 rounded-full border ${style.chip} font-medium`}>
              {t("utilitiesPage.consumption.activeAlerts", { count: item.activeAlertCount })}
            </span>
          )}
          {item.status === "GOOD" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : item.status === "NO_DATA" ? (
            <Gauge className="w-5 h-5 text-slate-400" />
          ) : (
            <AlertTriangle className={`w-5 h-5 ${style.text}`} />
          )}
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{t("utilitiesPage.consumption.usageRate")}</span>
          {pct != null ? (
            <span className={`font-semibold ${style.text}`}>{pct.toFixed(1)}%</span>
          ) : (
            <span className="text-slate-400">{t(`utilitiesPage.status.${statusKey(item.status)}`)}</span>
          )}
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${clampedPct}%` }} />
        </div>
      </div>
    </button>
  );
}

function SummaryCard({ label, value, caption, icon: Icon, iconColor, emphasise }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${emphasise ? "text-amber-600" : "text-gray-900"}`}>{value}</p>
      {caption && <p className="text-sm text-gray-500 mt-1">{caption}</p>}
    </div>
  );
}

// Status enum arrives from BE as UPPER_SNAKE (NO_DATA); i18n keys are
// camelCase per the rest of the app. Kept local to avoid drift.
function statusKey(status) {
  switch (status) {
    case "CRITICAL": return "critical";
    case "WARNING":  return "warning";
    case "GOOD":     return "good";
    case "NO_DATA":
    default:         return "noData";
  }
}
