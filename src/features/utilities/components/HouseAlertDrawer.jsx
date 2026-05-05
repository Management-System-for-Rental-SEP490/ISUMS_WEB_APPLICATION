import { useEffect, useState } from "react";
import { Drawer, Spin, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Phone, ClipboardList, Settings2 } from "lucide-react";
import { getHouseAlerts } from "../api/utilities.api";

/**
 * Drawer that opens when a landlord/manager taps a house tile on the
 * alerts dashboard. Three sections:
 *
 *   1. Header summary — house name, status pill, current vs. limit.
 *   2. Active alerts — pulls paginated /api/assets/houses/:id/iot/alerts
 *      (filtered to unresolved today) so the landlord sees what the
 *      IoT pipeline has flagged per-sensor.
 *   3. Action strip — Contact tenant / Create inspection / Manage limit
 *      (all stubbed here; next phase wires each to the corresponding
 *      existing workflow — tenant contact uses user-service phone,
 *      inspection deep-links to /maintenance/inspections?house=<id>,
 *      limit deep-links to the threshold config page).
 *
 * Why a drawer, not a modal: the landlord typically triages several
 * houses in succession — a right-edge drawer lets them click tile →
 * read → close → next tile without losing the dashboard context.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.house  — the UtilityAlertItem selected
 * @param {"electricity"|"water"} props.metric
 */
export default function HouseAlertDrawer({ open, onClose, house, metric }) {
  const { t } = useTranslation("common");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !house?.houseId) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHouseAlerts(house.houseId, { limit: 20 })
      .then((res) => {
        if (cancelled) return;
        // Endpoint returns PagedResponse<AlertDto>. Unwrap defensively.
        setAlerts(
          Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [],
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, house?.houseId]);

  const title = house
    ? t("utilitiesPage.drawer.title", { house: house.houseName || "—" })
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width={Math.min(
        560,
        typeof window !== "undefined" ? window.innerWidth - 32 : 560,
      )}
      size={Math.min(
        560,
        typeof window !== "undefined" ? window.innerWidth - 32 : 560,
      )}
      destroyOnClose
    >
      {!house ? null : (
        <div className="space-y-5">
          {/* Top summary */}
          <SummaryBlock house={house} metric={metric} t={t} />

          {/* Active alerts */}
          <section>
            <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t("utilitiesPage.drawer.activeAlerts")}
            </h4>
            {loading ? (
              <div className="py-6 flex justify-center">
                <Spin />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            ) : alerts.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("utilitiesPage.drawer.noAlerts")}
              />
            ) : (
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li
                    key={a.alertId ?? `${a.metric}-${a.ts}`}
                    className="rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {a.title ?? a.metric ?? "—"}
                        </p>
                        {a.detail && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.detail}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.level === "CRITICAL"
                            ? "bg-red-100 text-red-700"
                            : a.level === "WARNING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.level ?? "INFO"}
                      </span>
                    </div>
                    {a.ts && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(Number(a.ts)).toLocaleString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Action strip */}
          <section className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            <ActionButton
              icon={Phone}
              label={t("utilitiesPage.drawer.contactTenant")}
            />
            <ActionButton
              icon={ClipboardList}
              label={t("utilitiesPage.drawer.createInspection")}
            />
            <ActionButton
              icon={Settings2}
              label={t("utilitiesPage.drawer.manageLimit")}
            />
          </section>
        </div>
      )}
    </Drawer>
  );
}

function SummaryBlock({ house, metric, t }) {
  const unit = metric === "water" ? "m³" : "kWh";
  return (
    <section className="rounded-xl border border-slate-200 p-4 bg-slate-50">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-500">
            {t(`utilitiesPage.tabs.${metric}`)}
          </p>
          <p className="text-lg font-bold text-slate-800">
            {fmt(house.currentUsage)}{" "}
            <span className="text-sm font-medium text-slate-500">
              / {fmt(house.monthlyLimit)} {unit}
            </span>
          </p>
        </div>
        {house.usagePercent != null && (
          <span className="text-xl font-bold text-teal-600">
            {house.usagePercent.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <Stat
          label={t("utilitiesPage.consumption.forecast")}
          value={
            house.forecastTotal != null
              ? `${fmt(house.forecastTotal)} ${unit}`
              : "—"
          }
        />
        <Stat
          label={t("utilitiesPage.summary.alerts")}
          value={house.activeAlertCount ?? 0}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return Number(v).toLocaleString("vi-VN");
}
