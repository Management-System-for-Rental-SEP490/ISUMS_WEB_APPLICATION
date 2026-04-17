import { Bath, Bed, Heart, MapPin, Maximize2, Pencil } from "lucide-react";
import { AREA_TYPE_CONFIG } from "./HouseDetailModal";
import ImageCarousel from "@/components/shared/ImageCarousel";

const STATUS_CONFIG = {
  AVAILABLE: { label: "CHƯA CÓ KHÁCH THUÊ", bg: "bg-emerald-500" },
  RENTED: { label: "ĐÃ THUÊ", bg: "bg-orange-500" },
  MAINTENANCE: { label: "BẢO TRÌ", bg: "bg-slate-500" },
  default: { label: "—", bg: "bg-gray-400" },
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

export default function HouseCard({ house, onView, onEdit }) {
  const cfg = STATUS_CONFIG[house?.status] ?? STATUS_CONFIG.default;
  const name = house?.name ?? house?.title ?? "Chưa đặt tên";
  const address = house?.address ?? "";
  const priceStr = formatPrice(house?.rentPrice ?? house?.rent);
  const bedrooms = house?.bedrooms ?? house?.bedroom ?? null;
  const bathrooms = house?.bathrooms ?? house?.bathroom ?? null;
  const area = house?.area ?? house?.acreage ?? null;
  const hasSpecs = bedrooms != null || bathrooms != null || area != null;

  // functional areas chips
  const areas = Array.isArray(house?.functionalAreas)
    ? house.functionalAreas
    : [];
  const typeCounts = areas.reduce((acc, a) => {
    const k = a.areaType ?? "default";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(typeCounts);
  const visibleChips = typeEntries.slice(0, 3);
  const extraCount = typeEntries.length - visibleChips.length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 border border-slate-100 group flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <ImageCarousel images={house?.images ?? []} alt={name} height="h-52" showThumbnails={false} />

        {/* Status badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 text-[11px] font-bold rounded-full text-white ${cfg.bg}`}
        >
          {cfg.label}
        </span>

        {/* Heart */}
        <button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition"
        >
          <Heart className="w-4 h-4 text-slate-400 hover:text-rose-500 transition" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
            {name}
          </h3>
          {priceStr && (
            <p className="shrink-0 text-right whitespace-nowrap">
              <span className="text-base font-bold text-teal-600">
                {priceStr}
              </span>
              <span className="text-xs text-slate-400">/th</span>
            </p>
          )}
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}

        {/* Specs row */}
        {hasSpecs && (
          <div className="flex items-center gap-4 text-xs text-slate-600 py-3 border-t border-slate-100 mb-3">
            {bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">
                  {String(bedrooms).padStart(2, "0")}
                </span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">
                  {String(bathrooms).padStart(2, "0")}
                </span>
              </div>
            )}
            {area != null && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{area}m²</span>
              </div>
            )}
          </div>
        )}

        {/* Area chips */}
        {visibleChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-3 border-t border-slate-100">
            {visibleChips.map(([type, count]) => {
              const cfg = AREA_TYPE_CONFIG[type] ?? AREA_TYPE_CONFIG.default;
              const { Icon } = cfg;
              return (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                >
                  <Icon className="w-3 h-3" />
                  {count > 1 ? `${count} ` : ""}
                  {cfg.label}
                </span>
              );
            })}
            {extraCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className={`flex items-center gap-2 mt-auto pt-3 ${visibleChips.length === 0 ? "border-t border-slate-100" : ""}`}
        >
          <button
            type="button"
            onClick={() => onView?.(house)}
            className="flex-1 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Xem chi tiết
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(house)}
            className="w-9 h-9 flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition shrink-0"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
