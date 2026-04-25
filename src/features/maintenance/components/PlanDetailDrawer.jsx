import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "antd";
import { Calendar, Clock, Building2, MapPin, Plus } from "lucide-react";
import { getMaintenancePlanById } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";
import AddHousesModal from "./AddHousesModal";

const DATE_LOCALE = { vi: "vi-VN", en: "en-GB", ja: "ja-JP" };

function formatDate(value, locale) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PlanDetailDrawer({ open, planId, onClose }) {
  const { t, i18n } = useTranslation("common");
  const dateLocale = DATE_LOCALE[i18n.language] ?? "vi-VN";
  const [detail, setDetail] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddHouses, setShowAddHouses] = useState(false);

  useEffect(() => {
    if (!open || !planId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setHouses([]);

    getMaintenancePlanById(planId)
      .then(async (data) => {
        setDetail(data);
        if (Array.isArray(data.houseIds) && data.houseIds.length > 0) {
          const results = await Promise.allSettled(
            data.houseIds.map((id) => getHouseById(id)),
          );
          setHouses(
            results.filter((r) => r.status === "fulfilled").map((r) => r.value),
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, planId, refreshKey]);

  const cycleValue = detail
    ? `${t(`maintenance.cycle.${detail.frequencyType}`, { defaultValue: detail.frequencyType })}${
        detail.frequencyValue > 1
          ? ` · ${t("maintenance.planDetail.cycleEvery", { value: detail.frequencyValue })}`
          : ""
      }`
    : "";

  return (
    <>
      <AddHousesModal
        open={showAddHouses}
        planId={planId}
        existingHouseIds={detail?.houseIds ?? []}
        onClose={() => setShowAddHouses(false)}
        onAdded={() => setRefreshKey((k) => k + 1)}
      />
      <Drawer
        open={open}
        onClose={onClose}
        width={420}
        destroyOnClose
        title={
          <div>
            <p className="text-xs text-teal-600 font-semibold mb-0.5">{t("maintenance.planDetail.kicker")}</p>
            <h3 className="text-base font-bold text-slate-900 truncate">
              {loading ? t("maintenance.planDetail.loading") : (detail?.name ?? "—")}
            </h3>
          </div>
        }
      >
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />)}
          </div>
        )}
        {!loading && error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {!loading && !error && detail && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
              {[
                { Icon: Clock,    color: "text-teal-500",  label: t("maintenance.planDetail.cycle"),          value: cycleValue },
                { Icon: Calendar, color: "text-teal-500",  label: t("maintenance.planDetail.effectiveRange"), value: `${formatDate(detail.effectiveFrom, dateLocale)} – ${formatDate(detail.effectiveTo, dateLocale)}` },
                { Icon: Calendar, color: "text-amber-400", label: t("maintenance.planDetail.nextRun"),        value: formatDate(detail.nextRunAt, dateLocale) },
              ].map((row) => {
                const RowIcon = row.Icon;
                return (
                <div key={row.label} className="flex items-start gap-3">
                  <RowIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${row.color}`} />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{row.label}</p>
                    <p className="text-sm font-semibold text-slate-700">{row.value}</p>
                  </div>
                </div>
                );
              })}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">{t("maintenance.planDetail.housesTitle")}</p>
                <span className="ml-1 text-xs text-slate-400">
                  {t("maintenance.planDetail.housesCount", { count: (detail.houseIds ?? []).length })}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddHouses(true)}
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Plus className="w-3 h-3" /> {t("maintenance.planDetail.addHouse")}
                </button>
              </div>
              {houses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">{t("maintenance.planDetail.noHouses")}</p>
              ) : (
                <div className="space-y-2">
                  {houses.map((house) => (
                    <div key={house.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{house.name ?? house.title ?? "—"}</p>
                      {(house.address || house.city) && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {[house.address, house.ward, house.city].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
