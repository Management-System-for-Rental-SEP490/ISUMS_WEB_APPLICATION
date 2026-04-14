import { useState } from "react";
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  Flame,
  ImageOff,
  Package,
  Tag,
  Tv,
  Trees,
  Wind,
} from "lucide-react";
import AssetDetailDrawer from "./AssetDetailDrawer";

// ── Shared configs ────────────────────────────────────────────────────────────

// Chỉ chứa các giá trị backend chấp nhận: OTHER, ALL, KITCHEN, GARDEN, HALLWAY, BEDROOM, BATHROOM, LIVINGROOM
export const AREA_TYPE_CONFIG = {
  BEDROOM: {
    label: "Phòng ngủ",
    Icon: Bed,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-300",
    activeBg: "bg-blue-100",
    accent: "#3b82f6",
  },
  BATHROOM: {
    label: "Phòng tắm",
    Icon: Bath,
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-300",
    activeBg: "bg-cyan-100",
    accent: "#06b6d4",
  },
  KITCHEN: {
    label: "Nhà bếp",
    Icon: Flame,
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-300",
    activeBg: "bg-orange-100",
    accent: "#f97316",
  },
  LIVINGROOM: {
    label: "Phòng khách",
    Icon: Tv,
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-300",
    activeBg: "bg-purple-100",
    accent: "#a855f7",
  },
  HALLWAY: {
    label: "Hành lang",
    Icon: ArrowRight,
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-300",
    activeBg: "bg-slate-100",
    accent: "#64748b",
  },
  GARDEN: {
    label: "Sân vườn",
    Icon: Trees,
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-300",
    activeBg: "bg-green-100",
    accent: "#22c55e",
  },
  ALL: {
    label: "Toàn bộ",
    Icon: Wind,
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-300",
    activeBg: "bg-teal-100",
    accent: "#14b8a6",
  },
  OTHER: {
    label: "Khác",
    Icon: Package,
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-300",
    activeBg: "bg-gray-100",
    accent: "#6b7280",
  },
  default: {
    label: "Khu vực",
    Icon: Building2,
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-300",
    activeBg: "bg-gray-100",
    accent: "#6b7280",
  },
};

export const STATUS_AREA = {
  NORMAL: { dot: "bg-emerald-500", label: "Bình thường" },
  MAINTENANCE: { dot: "bg-amber-400", label: "Bảo trì" },
  DAMAGED: { dot: "bg-red-500", label: "Hỏng" },
  default: { dot: "bg-gray-300", label: "—" },
};

export const ASSET_STATUS = {
  IN_USE: { label: "Đang dùng", cls: "bg-emerald-100 text-emerald-700" },
  DISPOSED: { label: "Sắp hư hỏng", cls: "bg-red-100 text-red-600" },
  BROKEN: { label: "Hỏng", cls: "bg-red-100 text-red-600" },
  UNDER_REPAIR: { label: "Đang sửa", cls: "bg-amber-100 text-amber-700" },
  default: { label: "Không rõ", cls: "bg-gray-100 text-gray-500" },
};

export function conditionColor(pct) {
  if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-red-500", text: "text-red-600" };
}

// ── Room box in floor plan ────────────────────────────────────────────────────

const ROOM_FLEX = {
  LIVINGROOM: "flex-[3]",
  BEDROOM:    "flex-[2]",
  KITCHEN:    "flex-[2]",
  BATHROOM:   "flex-[1]",
  HALLWAY:    "flex-[1]",
  GARDEN:     "flex-[2]",
  ALL:        "flex-[3]",
  OTHER:      "flex-[1]",
  default:    "flex-[1]",
};

function RoomBox({ area, isSelected, assetCount, onClick }) {
  const cfg = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status] ?? STATUS_AREA.default;
  const { Icon } = cfg;
  const flex = ROOM_FLEX[area.areaType] ?? ROOM_FLEX.default;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        flex,
        "relative min-h-[100px] border-2 rounded-none flex flex-col items-start justify-between p-3 transition-all duration-150 cursor-pointer group",
        isSelected
          ? `${cfg.activeBg} ${cfg.border}`
          : "bg-white border-gray-200 hover:bg-gray-50",
      ].join(" ")}
      style={{ borderColor: isSelected ? cfg.accent : undefined }}
    >
      {/* Icon + asset count */}
      <div className="flex items-start justify-between w-full">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-white shadow-sm" : cfg.bg}`}
        >
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        {assetCount > 0 && (
          <span className="text-[10px] font-bold bg-gray-900/10 text-gray-600 px-1.5 py-0.5 rounded">
            {assetCount}
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <p
          className={`text-xs font-semibold ${isSelected ? cfg.text : "text-gray-700"} leading-tight`}
        >
          {area.name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className="text-[9px] text-gray-400">{status.label}</span>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: cfg.accent }}
        />
      )}
    </button>
  );
}

// ── Floor plan 2D ─────────────────────────────────────────────────────────────

function FloorPlan({
  grouped,
  sortedFloors,
  selectedArea,
  onSelectArea,
  assetCountByArea,
}) {
  const floorCount = sortedFloors.length;
  const floorsDesc = [...sortedFloors].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            Mặt cắt tòa nhà
          </span>
          <span className="text-xs text-gray-400">• {floorCount} tầng</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-gray-400">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-[10px] text-gray-400">Common</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floor rows */}
      <div className="divide-y divide-gray-100">
        {floorsDesc.map((floor) => {
          const floorAreas = grouped[floor];
          const label = floor === "0" ? "Trệt" : `T.${floor}`;

          return (
            <div key={floor} className="flex">
              {/* Floor label */}
              <div className="w-10 flex-shrink-0 bg-gray-50 border-r border-gray-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400 rotate-0">
                  {label}
                </span>
              </div>

              {/* Rooms */}
              <div className="flex flex-1 divide-x divide-gray-100">
                {floorAreas.map((area) => (
                  <RoomBox
                    key={area.id}
                    area={area}
                    isSelected={selectedArea?.id === area.id}
                    assetCount={assetCountByArea[area.id] ?? 0}
                    onClick={() =>
                      onSelectArea(selectedArea?.id === area.id ? null : area)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Entrance bar */}
      <div className="flex items-center justify-center py-2 bg-gray-50 border-t border-gray-100">
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
          Entrance
        </span>
      </div>
    </div>
  );
}

// ── Asset row in list ─────────────────────────────────────────────────────────

function AssetRow({ asset, onSelect }) {
  const status = ASSET_STATUS[asset.status] ?? ASSET_STATUS.default;
  const pct = asset.conditionPercent ?? 0;
  const color = conditionColor(pct);

  return (
    <button
      type="button"
      onClick={() => onSelect(asset.id)}
      className="w-full flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">
            {asset.displayName}
          </p>
          {(asset.nfcTag || asset.qrTag) && (
            <Tag className="w-3 h-3 text-gray-300 flex-shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
          {asset.serialNumber ?? "—"} ·{" "}
          {asset.updateAt
            ? new Date(asset.updateAt).toLocaleDateString("vi-VN")
            : "Chưa cập nhật"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}
        >
          {status.label}
        </span>
      </div>
    </button>
  );
}

// ── Selected area detail + assets ─────────────────────────────────────────────

function SelectedAreaPanel({ area, areaAssets, onSelectAsset }) {
  const cfg = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status] ?? STATUS_AREA.default;
  const { Icon } = cfg;
  const floorLabel = area.floorNo === "0" ? "Trệt" : `Tầng ${area.floorNo}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Area header */}
      <div
        className={`px-4 py-3.5 border-b ${cfg.bg} ${cfg.border.replace("border-", "border-b-")}`}
        style={{ borderBottomColor: cfg.accent }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border ${cfg.border}`}
            >
              <Icon className={`w-4 h-4 ${cfg.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${cfg.text}`}>
                  {area.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              {area.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {area.description}
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            {floorLabel}
          </span>
        </div>
      </div>

      {/* Assets list */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">
            Tài sản trong khu vực
          </span>
          <span className="text-xs font-bold text-gray-400">
            {areaAssets.length}
          </span>
        </div>

        {areaAssets.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-gray-300">
            <Package className="w-8 h-8" />
            <p className="text-xs">Chưa có tài sản</p>
          </div>
        ) : (
          <div className="space-y-0">
            {areaAssets.map((a) => (
              <AssetRow key={a.id} asset={a} onSelect={onSelectAsset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HouseOverviewTab({ house, assets = [] }) {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const areas = Array.isArray(house?.functionalAreas)
    ? house.functionalAreas
    : [];

  const grouped = areas.reduce((acc, area) => {
    const key = area.floorNo ?? "0";
    if (!acc[key]) acc[key] = [];
    acc[key].push(area);
    return acc;
  }, {});
  const sortedFloors = Object.keys(grouped).sort(
    (a, b) => Number(a) - Number(b),
  );

  const assetCountByArea = assets.reduce((acc, a) => {
    if (a.functionAreaId)
      acc[a.functionAreaId] = (acc[a.functionAreaId] ?? 0) + 1;
    return acc;
  }, {});

  const areaAssets = selectedArea
    ? assets.filter((a) => a.functionAreaId === selectedArea.id)
    : [];

  // Recent assets (latest updated)
  const recentAssets = [...assets]
    .filter((a) => a.updateAt)
    .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt))
    .slice(0, 5);

  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-200">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Building2 className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 font-medium">
          Chưa có khu vực chức năng nào
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Floor plan */}
      <FloorPlan
        grouped={grouped}
        sortedFloors={sortedFloors}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        assetCountByArea={assetCountByArea}
      />

      {/* Selected area panel */}
      {selectedArea && (
        <SelectedAreaPanel
          area={selectedArea}
          areaAssets={areaAssets}
          onSelectAsset={setSelectedAssetId}
        />
      )}

      {/* Recent assets */}
      {!selectedArea && recentAssets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              Danh sách tài sản mới nhất
            </span>
            <button className="text-xs text-teal-600 font-medium hover:underline">
              Xem tất cả →
            </button>
          </div>
          <div className="px-4 py-1">
            {recentAssets.map((a) => (
              <AssetRow key={a.id} asset={a} onSelect={setSelectedAssetId} />
            ))}
          </div>
        </div>
      )}

      {/* Asset detail drawer */}
      <AssetDetailDrawer
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
      />
    </div>
  );
}
