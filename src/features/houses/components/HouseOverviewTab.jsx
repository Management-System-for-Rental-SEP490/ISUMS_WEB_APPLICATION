import { useState } from "react";
import {
  Bath, Bed, Building2, Flame, Package, Trees, Wind, ArrowRight, Tv,
} from "lucide-react";
import AssetDetailDrawer from "./AssetDetailDrawer";

// ── Exported configs (used by HouseAssetsTab) ─────────────────────────────────

export const AREA_TYPE_CONFIG = {
  BEDROOM:    { label: "Phòng ngủ",   Icon: Bed,        bg: "bg-blue-50",   text: "text-blue-600",   accent: "#3b82f6" },
  BATHROOM:   { label: "Phòng tắm",   Icon: Bath,       bg: "bg-cyan-50",   text: "text-cyan-600",   accent: "#06b6d4" },
  KITCHEN:    { label: "Nhà bếp",     Icon: Flame,      bg: "bg-orange-50", text: "text-orange-600", accent: "#f97316" },
  LIVINGROOM: { label: "Phòng khách", Icon: Tv,         bg: "bg-purple-50", text: "text-purple-600", accent: "#a855f7" },
  HALLWAY:    { label: "Hành lang",   Icon: ArrowRight, bg: "bg-slate-50",  text: "text-slate-600",  accent: "#64748b" },
  GARDEN:     { label: "Sân vườn",    Icon: Trees,      bg: "bg-green-50",  text: "text-green-600",  accent: "#22c55e" },
  ALL:        { label: "Toàn bộ",     Icon: Wind,       bg: "bg-teal-50",   text: "text-teal-600",   accent: "#14b8a6" },
  OTHER:      { label: "Khác",        Icon: Package,    bg: "bg-gray-50",   text: "text-gray-500",   accent: "#6b7280" },
  default:    { label: "Khu vực",     Icon: Building2,  bg: "bg-gray-50",   text: "text-gray-500",   accent: "#6b7280" },
};

export const STATUS_AREA = {
  NORMAL:      { dot: "bg-emerald-500", label: "Bình thường" },
  MAINTENANCE: { dot: "bg-amber-400",   label: "Bảo trì"     },
  DAMAGED:     { dot: "bg-red-500",     label: "Hỏng"        },
  default:     { dot: "bg-gray-300",    label: "—"           },
};

export const ASSET_STATUS = {
  IN_USE:       { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
  DISPOSED:     { label: "Thanh lý",  cls: "bg-red-50 text-red-600"         },
  BROKEN:       { label: "Hỏng",      cls: "bg-red-50 text-red-600"         },
  UNDER_REPAIR: { label: "Đang sửa",  cls: "bg-amber-50 text-amber-700"     },
  default:      { label: "Không rõ",  cls: "bg-gray-100 text-gray-500"      },
};

export function conditionColor(pct) {
  if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-400",   text: "text-amber-600"   };
  return           { bar: "bg-red-500",     text: "text-red-600"     };
}

const B = {
  green: "#3bb582", dark: "#1E2D28", border: "#C4DED5",
  muted: "#EAF4F0", fg: "#1E2D28",  mutedFg: "#5A7A6E",
};

// ── FloorSelector ─────────────────────────────────────────────────────────────

function FloorSelector({ floors, selected, onSelect, grouped }) {
  return (
    <div
      className="w-40 flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ background: "#FAFFFE", border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${B.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: B.mutedFg }}>Tầng</p>
      </div>
      <div className="p-2 space-y-1">
        {floors.map((floor) => {
          const isActive = floor === selected;
          const label    = floor === "0" ? "Trệt" : `T.${floor}`;
          const count    = (grouped[floor] ?? []).length;
          return (
            <button
              key={floor}
              onClick={() => onSelect(floor)}
              className="w-full text-left px-3 py-3 rounded-xl transition-all duration-150"
              style={isActive ? { background: B.dark } : {}}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = B.muted; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <p className="text-sm font-bold" style={{ color: isActive ? "#ffffff" : B.fg }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isActive ? "rgba(255,255,255,0.6)" : B.mutedFg }}>
                {count} khu vực
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── RoomCard ──────────────────────────────────────────────────────────────────

function RoomCard({ area, isSelected, assetCount, onClick }) {
  const cfg    = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status] ?? STATUS_AREA.default;
  const { Icon } = cfg;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-2xl transition-all duration-150 flex flex-col gap-3"
      style={{
        background: isSelected ? B.muted : "#ffffff",
        border: `2px solid ${isSelected ? B.green : B.border}`,
        boxShadow: isSelected ? "0 0 0 3px rgba(59,181,130,0.12)" : "none",
      }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        {assetCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: B.muted, color: B.green }}>
            {assetCount}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold leading-tight" style={{ color: B.fg }}>{area.name}</p>
        <p className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: B.mutedFg }}>
          {cfg.label}
          {area.areaSize ? ` · ${area.areaSize}m²` : ""}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-[10px]" style={{ color: B.mutedFg }}>{status.label}</span>
        </div>
      </div>
    </button>
  );
}

// ── ZoneSummary ───────────────────────────────────────────────────────────────

function ZoneSummary({ area, areaAssets, floorLabel, onSelectAsset }) {
  const avgCondition = areaAssets.length > 0
    ? Math.round(areaAssets.reduce((s, a) => s + (a.conditionPercent ?? 0), 0) / areaAssets.length)
    : null;
  const condColor = avgCondition != null ? conditionColor(avgCondition) : null;

  return (
    <div
      className="w-72 flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ background: "#FAFFFE", border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <p className="text-sm font-bold font-heading" style={{ color: B.fg }}>Tổng quan khu vực</p>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: B.muted, color: B.green }}>
          {floorLabel.toUpperCase()}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {area ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: B.mutedFg }}>Tổng tài sản</p>
                <p className="text-2xl font-bold" style={{ color: B.fg }}>{areaAssets.length}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#ffffff", border: `1px solid ${B.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: B.mutedFg }}>Tình trạng TB</p>
                <p className={`text-2xl font-bold ${condColor?.text ?? "text-gray-400"}`}>
                  {avgCondition != null ? `${avgCondition}%` : "—"}
                </p>
              </div>
            </div>

            {/* Asset list */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: B.mutedFg }}>
                {area.name} — Tài sản
              </p>
              {areaAssets.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="w-8 h-8 mx-auto mb-2" style={{ color: B.border }} />
                  <p className="text-xs" style={{ color: B.mutedFg }}>Chưa có tài sản</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {areaAssets.slice(0, 3).map((asset) => {
                    const st  = ASSET_STATUS[asset.status] ?? ASSET_STATUS.default;
                    const pct = asset.conditionPercent ?? 0;
                    const cc  = conditionColor(pct);
                    return (
                      <button
                        key={asset.id}
                        onClick={() => onSelectAsset(asset.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                        style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = B.green; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: B.muted }}>
                          <Package className="w-4 h-4" style={{ color: B.green }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: B.fg }}>{asset.displayName}</p>
                          <p className="text-[10px] font-mono truncate" style={{ color: B.mutedFg }}>{asset.serialNumber ?? "—"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: B.muted }}>
                              <div className={`h-full rounded-full ${cc.bar}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {areaAssets.length > 0 && (
                <button
                  className="w-full mt-3 py-2 text-xs font-semibold rounded-xl transition-all"
                  style={{ border: `1px dashed ${B.border}`, color: B.mutedFg }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = B.green; e.currentTarget.style.color = B.green; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.color = B.mutedFg; }}
                >
                  Xem tất cả tài sản →
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: B.muted }}>
              <Building2 className="w-6 h-6" style={{ color: B.green }} />
            </div>
            <p className="text-xs font-medium" style={{ color: B.mutedFg }}>Chọn một khu vực để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HouseOverviewTab({ house, assets = [] }) {
  const [selectedFloor,   setSelectedFloor]   = useState(null);
  const [selectedArea,    setSelectedArea]     = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const areas = Array.isArray(house?.functionalAreas) ? house.functionalAreas : [];

  const grouped = areas.reduce((acc, area) => {
    const key = String(area.floorNo ?? "0");
    (acc[key] = acc[key] ?? []).push(area);
    return acc;
  }, {});

  const sortedFloors = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const activeFloor  = selectedFloor ?? sortedFloors[0] ?? "0";
  const floorAreas   = grouped[activeFloor] ?? [];
  const floorLabel   = activeFloor === "0" ? "Trệt" : `T.${activeFloor}`;

  const assetCountByArea = assets.reduce((acc, a) => {
    if (a.functionAreaId) acc[a.functionAreaId] = (acc[a.functionAreaId] ?? 0) + 1;
    return acc;
  }, {});

  const areaAssets = selectedArea
    ? assets.filter((a) => a.functionAreaId === selectedArea.id)
    : [];

  if (areas.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl"
        style={{ background: "#FAFFFE", border: `1px solid ${B.border}` }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: B.muted }}>
          <Building2 className="w-7 h-7" style={{ color: B.green }} />
        </div>
        <p className="text-sm font-medium" style={{ color: B.mutedFg }}>Chưa có khu vực chức năng nào</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      {/* Left: Floor selector */}
      <FloorSelector
        floors={sortedFloors}
        selected={activeFloor}
        onSelect={(f) => { setSelectedFloor(f); setSelectedArea(null); }}
        grouped={grouped}
      />

      {/* Center: Room grid + zone chips */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="rounded-2xl p-5" style={{ background: "#FAFFFE", border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: B.fg }}>Sơ đồ tầng — {floorLabel}</p>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: B.muted, color: B.mutedFg }}>
              {floorAreas.length} khu vực
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {floorAreas.map((area) => (
              <RoomCard
                key={area.id}
                area={area}
                isSelected={selectedArea?.id === area.id}
                assetCount={assetCountByArea[area.id] ?? 0}
                onClick={() => setSelectedArea(selectedArea?.id === area.id ? null : area)}
              />
            ))}
          </div>
        </div>

        {/* Zone chips */}
        <div className="flex flex-wrap gap-2 px-1">
          {floorAreas.map((area) => {
            const isActive = selectedArea?.id === area.id;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedArea(isActive ? null : area)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={isActive
                  ? { background: B.dark, color: "#ffffff" }
                  : { background: "#ffffff", color: B.mutedFg, border: `1px solid ${B.border}` }}
              >
                {area.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Zone summary */}
      <ZoneSummary
        area={selectedArea}
        areaAssets={areaAssets}
        floorLabel={floorLabel}
        onSelectAsset={setSelectedAssetId}
      />

      <AssetDetailDrawer assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
    </div>
  );
}
