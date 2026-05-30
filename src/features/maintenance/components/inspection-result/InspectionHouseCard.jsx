import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Bath, Bed, ChevronRight, MapPin, Maximize2 } from "lucide-react";
import ImageCarousel from "../../../../components/shared/ImageCarousel";

const STATUS_BADGE = {
  AVAILABLE:   { bg: "rgba(59,181,130,0.92)" },
  RENTED:      { bg: "rgba(32,150,216,0.92)" },
  MAINTENANCE: { bg: "rgba(90,122,110,0.85)" },
};

function getLocalized(translations, fallback) {
  const lang = localStorage.getItem("app_language") ?? "vi";
  return translations?.[lang] || translations?.["vi"] || fallback || "";
}

function normalizeImages(house) {
  const list = Array.isArray(house?.images) ? house.images : [];
  if (list.length) {
    return list
      .map((img, i) => {
        const url = typeof img === "string" ? img : img?.url;
        if (!url) return null;
        return { id: img?.id ?? `house-img-${i}`, url };
      })
      .filter(Boolean);
  }
  const single = house?.thumbnail ?? house?.thumbnailUrl;
  return single ? [{ id: "house-thumb", url: single }] : [];
}

function Spec({ icon, value }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs font-semibold" style={{ color: "#1E2D28" }}>{value}</span>
    </div>
  );
}

const SPEC_ICON_CLASS = "w-3.5 h-3.5";
const SPEC_ICON_STYLE = { color: "#5A7A6E" };

export default function InspectionHouseCard({ house }) {
  const { t } = useTranslation("common");

  if (!house) return null;

  const name =
    getLocalized(house.nameTranslations, house.name ?? house.title) ||
    t("houses.noName");

  const address = [
    getLocalized(house.addressTranslations, house.address),
    getLocalized(house.wardTranslations, house.ward),
    getLocalized(house.cityTranslations, house.city),
  ]
    .filter(Boolean)
    .join(", ");

  const images = normalizeImages(house);
  const badge = STATUS_BADGE[house.status] ?? null;
  const bedrooms = house.bedrooms ?? house.bedroom ?? null;
  const bathrooms = house.bathrooms ?? house.bathroom ?? null;
  const area = house.area ?? house.acreage ?? null;
  const hasSpecs = bedrooms != null || bathrooms != null || area != null;

  return (
    <section
      aria-label={t("inspection.houseInfo")}
      className="rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-200"
      style={{
        background: "#ffffff",
        border: "1px solid #C4DED5",
        boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)",
      }}
    >
      <div className="relative md:w-72 flex-shrink-0">
        <ImageCarousel
          images={images}
          alt={name}
          height="h-44 md:h-full"
          showThumbnails={false}
        />
        {badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-full text-white z-10"
            style={{ background: badge.bg, backdropFilter: "blur(4px)" }}
          >
            {t(`houses.statusCard.${house.status}`, { defaultValue: house.status })}
          </span>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-2 min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "#5A7A6E" }}
          >
            {t("inspection.houseInfo")}
          </p>

          <h3
            className="text-lg font-bold leading-snug line-clamp-2"
            style={{ color: "#1E2D28" }}
          >
            {name}
          </h3>

          {address && (
            <div className="flex items-start gap-2 text-xs" style={{ color: "#5A7A6E" }}>
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#3bb582" }} />
              <span className="line-clamp-2 leading-relaxed">{address}</span>
            </div>
          )}

          {hasSpecs && (
            <div
              className="flex items-center gap-4 pt-2"
              style={{ borderTop: "1px dashed #C4DED5" }}
            >
              {bedrooms != null && (
                <Spec
                  icon={<Bed className={SPEC_ICON_CLASS} style={SPEC_ICON_STYLE} />}
                  value={String(bedrooms).padStart(2, "0")}
                />
              )}
              {bathrooms != null && (
                <Spec
                  icon={<Bath className={SPEC_ICON_CLASS} style={SPEC_ICON_STYLE} />}
                  value={String(bathrooms).padStart(2, "0")}
                />
              )}
              {area != null && (
                <Spec
                  icon={<Maximize2 className={SPEC_ICON_CLASS} style={SPEC_ICON_STYLE} />}
                  value={`${area}m²`}
                />
              )}
            </div>
          )}
        </div>

        {house.id && (
          <Link
            to={`/houses/${house.id}`}
            className="inline-flex items-center gap-1 self-start text-xs font-semibold transition"
            style={{ color: "#3bb582" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t("houses.viewDetail")}
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </section>
  );
}
