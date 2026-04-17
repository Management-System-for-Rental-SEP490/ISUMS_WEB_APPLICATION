import { useState } from "react";
import {
  Package, ChevronDown, ChevronRight,
  Search, Tag,
} from "lucide-react";
import ImageCarousel from "../../../components/shared/ImageCarousel";
import {
  AREA_TYPE_CONFIG, ASSET_STATUS, conditionColor,
} from "./HouseOverviewTab";
import AssetDetailDrawer from "./AssetDetailDrawer";

// ── Asset Card ────────────────────────────────────────────────────────────────

function AssetCard({ asset, onSelect }) {
  const status = ASSET_STATUS[asset.status] ?? ASSET_STATUS.default;
  const pct    = asset.conditionPercent ?? 0;
  const color  = conditionColor(pct);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(asset.id)}
    >
      {/* Image */}
      <div className="relative border-b border-gray-100">
        <ImageCarousel images={asset.images ?? []} alt={asset.displayName} height="h-36" showThumbnails={false} preview={false} />
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10 ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate" title={asset.displayName}>
            {asset.displayName}
          </p>
          <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
            {asset.serialNumber ?? "—"}
          </p>
        </div>

        {/* Condition bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">Tình trạng</span>
            <span className={`text-[11px] font-bold ${color.text}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${color.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {(asset.nfcTag || asset.qrTag) && (
          <div className="flex gap-1 flex-wrap">
            {asset.nfcTag && (
              <span className="flex items-center gap-0.5 text-[9px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> NFC
              </span>
            )}
            {asset.qrTag && (
              <span className="flex items-center gap-0.5 text-[9px] font-medium bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> QR
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Area group (collapsible) ──────────────────────────────────────────────────

function AreaGroup({ label, icon: Icon, iconCls, assets, defaultOpen = true, onSelectAsset }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full py-2 text-left group"
      >
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${iconCls}`} />}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 font-medium">({assets.length})</span>
      </button>

      {open && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-5">
          {assets.map((a) => <AssetCard key={a.id} asset={a} onSelect={onSelectAsset} />)}
        </div>
      )}
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────

export default function HouseAssetsTab({ assets = [], functionalAreas = [] }) {
  const [search, setSearch]               = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const areaMap = Object.fromEntries(functionalAreas.map((a) => [a.id, a]));

  const filtered = search
    ? assets.filter((a) =>
        `${a.displayName} ${a.serialNumber}`.toLowerCase().includes(search.toLowerCase())
      )
    : assets;

  // Group by functionAreaId
  const grouped = filtered.reduce((acc, asset) => {
    const key = asset.functionAreaId ?? "__unassigned__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(asset);
    return acc;
  }, {});

  // Areas that have assets, sorted by floorNo
  const areaKeys = Object.keys(grouped)
    .filter((k) => k !== "__unassigned__")
    .sort((a, b) => {
      const fa = areaMap[a]?.floorNo ?? "0";
      const fb = areaMap[b]?.floorNo ?? "0";
      return Number(fa) - Number(fb);
    });

  const unassigned = grouped["__unassigned__"] ?? [];

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Package className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Chưa có tài sản nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm tài sản, serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">Không tìm thấy tài sản nào</p>
      )}

      {/* Grouped by area */}
      {areaKeys.map((areaId) => {
        const area = areaMap[areaId];
        const cfg  = area ? (AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default) : AREA_TYPE_CONFIG.default;
        const floorLabel = area?.floorNo === "0" ? "Trệt" : area ? `Tầng ${area.floorNo}` : "";
        return (
          <AreaGroup
            key={areaId}
            label={`${area?.name ?? "Khu vực"} ${floorLabel ? `— ${floorLabel}` : ""}`}
            icon={cfg.Icon}
            iconCls={cfg.text}
            assets={grouped[areaId]}
            defaultOpen
            onSelectAsset={setSelectedAssetId}
          />
        );
      })}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <AreaGroup
          key="__unassigned__"
          label="Chưa phân khu vực"
          icon={Package}
          iconCls="text-gray-400"
          assets={unassigned}
          defaultOpen={areaKeys.length === 0}
          onSelectAsset={setSelectedAssetId}
        />
      )}

      <AssetDetailDrawer
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
      />
    </div>
  );
}
