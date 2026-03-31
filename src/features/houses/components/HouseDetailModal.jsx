import { useState } from "react";
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  Car,
  Flame,
  Info,
  MapPin,
  Tv,
  Utensils,
  Wind,
  X,
} from "lucide-react";

// ── Configs ───────────────────────────────────────────────────────────────────
export const AREA_TYPE_CONFIG = {
  BEDROOM:    { label: "Phòng ngủ",   Icon: Bed,       bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200",   activeBg: "bg-blue-100"   },
  BATHROOM:   { label: "Phòng tắm",   Icon: Bath,      bg: "bg-cyan-50",   text: "text-cyan-600",   border: "border-cyan-200",   activeBg: "bg-cyan-100"   },
  KITCHEN:    { label: "Nhà bếp",     Icon: Flame,     bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", activeBg: "bg-orange-100" },
  LIVINGROOM: { label: "Phòng khách", Icon: Tv,        bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", activeBg: "bg-purple-100" },
  HALLWAY:    { label: "Hành lang",   Icon: ArrowRight,bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-300",  activeBg: "bg-slate-100"  },
  GARAGE:     { label: "Gara xe",     Icon: Car,       bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", activeBg: "bg-yellow-100" },
  BALCONY:    { label: "Ban công",    Icon: Wind,      bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  activeBg: "bg-green-100"  },
  DINING:     { label: "Phòng ăn",    Icon: Utensils,  bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200",  activeBg: "bg-amber-100"  },
  default:    { label: "Khu vực",     Icon: Building2, bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",   activeBg: "bg-gray-100"   },
};

const STATUS_AREA = {
  NORMAL:      { dot: "bg-emerald-500", label: "Bình thường", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MAINTENANCE: { dot: "bg-amber-400",   label: "Bảo trì",     badge: "bg-amber-50 text-amber-700 border-amber-200"     },
  DAMAGED:     { dot: "bg-red-500",     label: "Hỏng",        badge: "bg-red-50 text-red-700 border-red-200"           },
  default:     { dot: "bg-gray-300",    label: "—",           badge: "bg-gray-50 text-gray-500 border-gray-200"        },
};

const HOUSE_STATUS = {
  AVAILABLE:   { label: "Còn trống", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  RENTED:      { label: "Đã thuê",   cls: "bg-orange-100 text-orange-700 border-orange-200"   },
  MAINTENANCE: { label: "Bảo trì",   cls: "bg-slate-100  text-slate-600  border-slate-200"    },
  default:     { label: "—",         cls: "bg-gray-100   text-gray-500   border-gray-200"     },
};

// ── Room card (in floor plan) ─────────────────────────────────────────────────
function RoomCard({ area, isSelected, onClick }) {
  const cfg    = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status]        ?? STATUS_AREA.default;
  const { Icon } = cfg;

  return (
    <button
      type="button"
      onClick={onClick}
      title={area.name}
      className={[
        "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer",
        "hover:shadow-md hover:-translate-y-0.5 w-[90px] shrink-0",
        isSelected
          ? `${cfg.activeBg} ${cfg.border} shadow-md -translate-y-0.5`
          : "bg-white border-slate-200 hover:border-slate-300",
      ].join(" ")}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.text}`} />
      </div>
      {/* Name */}
      <span className="text-[10px] font-semibold text-slate-700 leading-tight text-center line-clamp-2 w-full">
        {area.name}
      </span>
      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
    </button>
  );
}

// ── Building cross-section ────────────────────────────────────────────────────
function BuildingPlan({ grouped, sortedFloors, selectedArea, onSelectArea }) {
  // Render floors from top (highest) to bottom
  const floorsDesc = [...sortedFloors].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner">
      {/* Roof bar */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 px-4 py-2 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-white/60" />
        <span className="text-white/80 text-xs font-semibold tracking-wide">
          Mặt cắt tòa nhà
        </span>
        <span className="ml-auto text-white/40 text-xs">
          {sortedFloors.length} tầng
        </span>
      </div>

      {/* Floors */}
      <div className="bg-white divide-y-2 divide-slate-200">
        {floorsDesc.map((floor) => {
          const floorAreas = grouped[floor];
          const isGround   = floor === "0" || floor === "1";
          const label      = floor === "0" ? "Trệt" : `T.${floor}`;

          return (
            <div key={floor} className="flex items-stretch min-h-[96px]">
              {/* Floor label column */}
              <div
                className={[
                  "w-12 shrink-0 flex flex-col items-center justify-center gap-1 border-r-2 border-slate-200",
                  isGround ? "bg-slate-100" : "bg-slate-50",
                ].join(" ")}
              >
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
                <div className="w-px h-4 bg-slate-300" />
                <span className="text-[9px] text-slate-400 font-medium">FL</span>
              </div>

              {/* Rooms row */}
              <div className="flex flex-wrap gap-2 p-3 flex-1 items-center content-center">
                {floorAreas.map((area) => (
                  <RoomCard
                    key={area.id}
                    area={area}
                    isSelected={selectedArea?.id === area.id}
                    onClick={() => onSelectArea(selectedArea?.id === area.id ? null : area)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Foundation */}
      <div className="h-3 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />
    </div>
  );
}

// ── Selected area detail panel ────────────────────────────────────────────────
function AreaDetailPanel({ area }) {
  const cfg    = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status]        ?? STATUS_AREA.default;
  const { Icon } = cfg;
  const floorLabel = area.floorNo === "0" ? "Trệt" : `Tầng ${area.floorNo}`;

  return (
    <div className={`rounded-xl border-2 p-4 ${cfg.bg} ${cfg.border} transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border ${cfg.border}`}>
          <Icon className={`w-5 h-5 ${cfg.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${cfg.text}`}>{area.name}</p>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${status.badge}`}>
              {status.label}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border bg-white text-slate-500 border-slate-200 ml-auto">
              {floorLabel}
            </span>
          </div>
          {area.description ? (
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{area.description}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1.5 italic">Không có mô tả</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function HouseDetailModal({ house, onClose }) {
  const [selectedArea, setSelectedArea] = useState(null);

  if (!house) return null;

  const name    = house.name ?? house.title ?? "Chưa đặt tên";
  const address = house.address ?? "";
  const areas   = Array.isArray(house.functionalAreas) ? house.functionalAreas : [];
  const hsBadge = HOUSE_STATUS[house.status] ?? HOUSE_STATUS.default;

  // Group by floorNo
  const grouped = areas.reduce((acc, area) => {
    const key = area.floorNo ?? "0";
    if (!acc[key]) acc[key] = [];
    acc[key].push(area);
    return acc;
  }, {});
  const sortedFloors = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  // Summary chips
  const typeCounts = areas.reduce((acc, a) => {
    const k = a.areaType ?? "default";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-base font-bold text-slate-800">{name}</h2>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${hsBadge.cls}`}>
                  {hsBadge.label}
                </span>
              </div>
              {address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                  <span className="line-clamp-1">{address}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type chips */}
          {Object.keys(typeCounts).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(typeCounts).map(([type, count]) => {
                const cfg = AREA_TYPE_CONFIG[type] ?? AREA_TYPE_CONFIG.default;
                const { Icon } = cfg;
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    <Icon className="w-3 h-3" />
                    {count > 1 ? `${count} ` : ""}{cfg.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Description */}
          {house.description && (
            <div className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 leading-relaxed">
              {house.description}
            </div>
          )}

          {areas.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Chưa có khu vực chức năng nào</p>
              <p className="text-xs text-slate-400 mt-1">Thêm phòng/khu vực để hiển thị mô hình tòa nhà</p>
            </div>
          ) : (
            <>
              {/* Building cross-section */}
              <BuildingPlan
                grouped={grouped}
                sortedFloors={sortedFloors}
                selectedArea={selectedArea}
                onSelectArea={setSelectedArea}
              />

              {/* Hint */}
              {!selectedArea && (
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                  <Info className="w-3.5 h-3.5" />
                  <span>Nhấn vào phòng để xem chi tiết</span>
                </div>
              )}

              {/* Selected area details */}
              {selectedArea && (
                <AreaDetailPanel area={selectedArea} />
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
