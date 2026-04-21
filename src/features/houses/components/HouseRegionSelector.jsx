import { useTranslation } from "react-i18next";
import { Loader2, MapPin } from "lucide-react";

export default function HouseRegionSelector({ regions, loading, value, onChange, error }) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        {t("houses.region.title")} <span className="text-red-500">*</span>
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("houses.region.loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-left transition ${
                value === r.id
                  ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                  : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
              }`}
            >
              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${value === r.id ? "text-teal-500" : "text-slate-400"}`} />
              <div>
                <p className={`text-sm font-semibold ${value === r.id ? "text-teal-700" : "text-slate-700"}`}>
                  {r.name}
                </p>
                {r.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.description}</p>
                )}
              </div>
            </button>
          ))}
          {regions.length === 0 && (
            <p className="text-sm text-slate-400 col-span-2">{t("houses.region.empty")}</p>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
