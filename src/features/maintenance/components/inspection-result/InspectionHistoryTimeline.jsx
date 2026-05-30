import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleDot, ExternalLink, MapPin } from "lucide-react";

export default function InspectionHistoryTimeline({ history = [], inspection }) {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* History */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "#ffffff",
          border: "1px solid #C4DED5",
          boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>
            {t("inspection.timeline.title")}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold transition"
            style={{ color: "#3bb582" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t("inspection.timeline.viewReport")}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: item.type === "done"
                      ? "rgba(59,181,130,0.12)"
                      : "rgba(245,158,11,0.12)",
                  }}
                >
                  {item.type === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
                  ) : (
                    <CircleDot className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                  )}
                </div>
                {idx < history.length - 1 && (
                  <div className="w-px flex-1 mt-1.5" style={{ background: "#E5E7EB", minHeight: 20 }} />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-semibold leading-snug" style={{ color: "#1E2D28" }}>
                  {item.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {item.actor} • {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
      >
        <div className="relative h-44 overflow-hidden">
          {inspection?.houseThumbnail ? (
            <img
              src={inspection.houseThumbnail}
              alt={t("inspection.timeline.assetLocation")}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <MapPin className="w-8 h-8" style={{ color: "#C4DED5" }} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(30,45,40,0.55) 0%, transparent 60%)" }}
          />
          <p className="absolute bottom-3 left-4 text-xs font-bold text-white">
            {t("inspection.timeline.assetLocation")}
          </p>
        </div>
        <div className="px-5 py-4" style={{ background: "#ffffff" }}>
          <div className="flex items-start gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "#EAF4F0" }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium mb-0.5" style={{ color: "#5A7A6E" }}>
                {t("inspection.timeline.addressLabel")}
              </p>
              <p className="text-xs font-semibold" style={{ color: "#1E2D28" }}>
                {inspection?.houseAddress ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
