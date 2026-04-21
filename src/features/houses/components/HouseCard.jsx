import { Bath, Bed, Heart, MapPin, Maximize2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AREA_TYPE_CONFIG } from "./HouseDetailModal";
import ImageCarousel from "../../../components/shared/ImageCarousel";

const STATUS_CONFIG = {
  AVAILABLE:   { label: "CHƯA CÓ KHÁCH THUÊ", bg: "rgba(59,181,130,0.85)",  color: "#ffffff" },
  RENTED:      { label: "ĐÃ THUÊ",             bg: "rgba(32,150,216,0.85)",  color: "#ffffff" },
  MAINTENANCE: { label: "BẢO TRÌ",             bg: "rgba(90,122,110,0.80)",  color: "#ffffff" },
  default:     { label: "—",                   bg: "rgba(90,122,110,0.60)",  color: "#ffffff" },
};

function formatPrice(price) {
  if (!price || price === 0) return null;
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return m % 1 === 0 ? `${m}tr` : `${m.toFixed(1)}tr`;
  }
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return price.toLocaleString("vi-VN");
}

function getLocalized(translations, fallback) {
  const lang = localStorage.getItem("app_language") ?? "vi";
  return translations?.[lang] || translations?.["vi"] || fallback || "";
}

export default function HouseCard({ house, onView, onEdit }) {
  const { t } = useTranslation("common");
  const cfg = STATUS_CONFIG[house?.status] ?? STATUS_CONFIG.default;
  const name = getLocalized(house?.nameTranslations, house?.name ?? house?.title) || t("houses.noName");
  const address = getLocalized(house?.addressTranslations, house?.address);
  const priceStr = formatPrice(house?.rentPrice ?? house?.rent);
  const bedrooms = house?.bedrooms ?? house?.bedroom ?? null;
  const bathrooms = house?.bathrooms ?? house?.bathroom ?? null;
  const area = house?.area ?? house?.acreage ?? null;
  const hasSpecs = bedrooms != null || bathrooms != null || area != null;

  const areas = Array.isArray(house?.functionalAreas) ? house.functionalAreas : [];
  const typeCounts = areas.reduce((acc, a) => {
    const k = a.areaType ?? "default";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(typeCounts);
  const visibleChips = typeEntries.slice(0, 3);
  const extraCount = typeEntries.length - visibleChips.length;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 flex flex-col group"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px -4px rgba(59,181,130,0.18)"; e.currentTarget.style.borderColor = "#3bb582"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(59,181,130,0.08)"; e.currentTarget.style.borderColor = "#C4DED5"; }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <ImageCarousel images={house?.images ?? []} alt={name} height="h-52" showThumbnails={false} />

        {/* Status badge */}
        <span
          className="absolute top-3 left-3 px-3 py-1 text-[11px] font-bold rounded-full z-10"
          style={{ background: cfg.bg, color: cfg.color, backdropFilter: "blur(4px)" }}
        >
          {t(`houses.statusCard.${house?.status}`, { defaultValue: cfg.label })}
        </span>

        {/* Heart */}
        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition z-10"
          style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(4px)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.90)"; }}
        >
          <Heart className="w-4 h-4 transition" style={{ color: "#5A7A6E" }} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1" style={{ color: "#1E2D28" }}>
            {name}
          </h3>
          {priceStr && (
            <p className="shrink-0 text-right whitespace-nowrap">
              <span className="text-base font-bold" style={{ color: "#3bb582" }}>{priceStr}</span>
              <span className="text-xs" style={{ color: "#5A7A6E" }}>{t("houses.perMonth")}</span>
            </p>
          )}
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-1.5 text-xs mb-3" style={{ color: "#5A7A6E" }}>
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#5A7A6E" }} />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}

        {/* Specs row */}
        {hasSpecs && (
          <div
            className="flex items-center gap-4 text-xs py-3 mb-3"
            style={{ borderTop: "1px solid #C4DED5", color: "#5A7A6E" }}
          >
            {bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />
                <span className="font-semibold" style={{ color: "#1E2D28" }}>{String(bedrooms).padStart(2, "0")}</span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />
                <span className="font-semibold" style={{ color: "#1E2D28" }}>{String(bathrooms).padStart(2, "0")}</span>
              </div>
            )}
            {area != null && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />
                <span className="font-semibold" style={{ color: "#1E2D28" }}>{area}m²</span>
              </div>
            )}
          </div>
        )}

        {/* Area chips */}
        {visibleChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-3" style={{ borderTop: "1px solid #C4DED5" }}>
            {visibleChips.map(([type, count]) => {
              const areaCfg = AREA_TYPE_CONFIG[type] ?? AREA_TYPE_CONFIG.default;
              const { Icon } = areaCfg;
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full"
                  style={{ background: "#EAF4F0", color: "#5A7A6E", border: "1px solid #C4DED5" }}
                >
                  <Icon className="w-3 h-3" />
                  {count > 1 ? `${count} ` : ""}
                  {t(`houses.areaType.${type}`, { defaultValue: areaCfg.label })}
                </span>
              );
            })}
            {extraCount > 0 && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full"
                style={{ background: "#EAF4F0", color: "#5A7A6E", border: "1px solid #C4DED5" }}
              >
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className={`flex items-center gap-2 mt-auto pt-3 ${visibleChips.length === 0 ? "" : ""}`}
          style={{ borderTop: "1px solid #C4DED5" }}
        >
          <button
            type="button"
            onClick={() => onView?.(house)}
            className="flex-1 py-2 text-sm font-medium rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#1E2D28"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; }}
          >
            {t("houses.viewDetail")}
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(house)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition shrink-0"
            style={{ background: "#EAF4F0", color: "#3bb582" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,181,130,0.20)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#EAF4F0"; }}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
