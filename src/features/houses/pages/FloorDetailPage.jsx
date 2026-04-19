import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Loader2, AlertCircle, ImageOff } from "lucide-react";
import { useHouseDetail } from "../hooks/useHouseDetail";
import { getAssetsByFunctionArea } from "../api/houses.api";
import { AREA_TYPE_CONFIG, STATUS_AREA, ASSET_STATUS, conditionColor } from "../components/HouseOverviewTab";
import AssetDetailDrawer from "../components/AssetDetailDrawer";
import CreateAssetModal from "../components/CreateAssetModal";

const B = {
  green: "#3bb582", dark: "#1E2D28", border: "#C4DED5",
  muted: "#EAF4F0", fg: "#1E2D28", mutedFg: "#5A7A6E",
};

// ── AreaRow — trái ────────────────────────────────────────────────────────────

function AreaRow({ area, isSelected, onSelect }) {
  const cfg    = AREA_TYPE_CONFIG[area.areaType] ?? AREA_TYPE_CONFIG.default;
  const status = STATUS_AREA[area.status]        ?? STATUS_AREA.default;
  const { Icon } = cfg;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150"
      style={{
        borderLeft: `3px solid ${isSelected ? B.green : "transparent"}`,
        background: isSelected ? B.muted : "transparent",
        borderBottom: `1px solid rgba(196,222,213,0.4)`,
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(234,244,240,0.5)"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: B.fg }}>{area.name}</p>
        <p className="text-xs mt-0.5" style={{ color: B.mutedFg }}>{cfg.label}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: B.muted, color: B.green }}
        >
          {area.assetCount ?? 0}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
      </div>
    </button>
  );
}

// ── AssetCard — phải ──────────────────────────────────────────────────────────

function AssetCard({ asset, onSelect }) {
  const st  = ASSET_STATUS[asset.status] ?? ASSET_STATUS.default;
  const pct = asset.conditionPercent ?? 0;
  const cc  = conditionColor(pct);
  const img = asset.images?.[0]?.url;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className="rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer"
      style={{ background: "#ffffff", border: `1px solid ${B.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = B.green; e.currentTarget.style.boxShadow = "0 4px 16px -4px rgba(59,181,130,0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Ảnh */}
      <div className="relative h-40 overflow-hidden" style={{ background: "#F3F4F6" }}>
        {img ? (
          <img src={img} alt={asset.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>
          {st.label}
        </span>
        {/* Serial */}
        {asset.serialNumber && (
          <span
            className="absolute bottom-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
          >
            {asset.serialNumber}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-semibold leading-snug" style={{ color: B.fg }}>{asset.displayName}</p>

        {/* Condition bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: B.muted }}>
            <div className={`h-full rounded-full ${cc.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-[10px] font-bold ${cc.text}`}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FloorDetailPage() {
  const { id, floorNo } = useParams();
  const navigate = useNavigate();

  const { house, loading: houseLoading, error: houseError } = useHouseDetail(id);

  const [selectedArea, setSelectedArea]   = useState(null);
  const [drawerAssetId, setDrawerAssetId] = useState(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [areaAssets, setAreaAssets]       = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError]     = useState(null);

  const floorAreas = (house?.functionalAreas ?? [])
    .filter((a) => String(a.floorNo) === String(floorNo))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));

  const floorLabel = floorNo === "0" ? "Tầng trệt" : `Tầng ${floorNo}`;

  // Auto-select first area
  useEffect(() => {
    if (floorAreas.length > 0 && !selectedArea) {
      setSelectedArea(floorAreas[0]);
    }
  }, [floorAreas.length]);

  // Load assets khi chọn area
  const loadAssets = useCallback(async (area) => {
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const data = await getAssetsByFunctionArea(id, area.id);
      setAreaAssets(data);
    } catch (e) {
      setAssetsError(e.message);
      setAreaAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (selectedArea) loadAssets(selectedArea);
  }, [selectedArea?.id]);

  if (houseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: B.green }} />
        <span className="text-sm" style={{ color: B.mutedFg }}>Đang tải...</span>
      </div>
    );
  }

  if (houseError || !house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm" style={{ color: B.mutedFg }}>{houseError ?? "Không tìm thấy dữ liệu"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/houses/${id}`)}
          className="p-2 rounded-xl transition flex-shrink-0"
          style={{ background: B.muted, color: B.mutedFg }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#C4DED5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = B.muted; }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: B.fg }}>{floorLabel}</h1>
          <p className="text-sm mt-0.5" style={{ color: B.mutedFg }}>
            {house.name} · {floorAreas.length} khu vực
          </p>
        </div>
      </div>

      {/* 2-column layout */}
      {floorAreas.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl"
          style={{ background: "#FAFFFE", border: `1px solid ${B.border}` }}
        >
          <Package className="w-10 h-10" style={{ color: B.border }} />
          <p className="text-sm" style={{ color: B.mutedFg }}>Tầng này chưa có khu vực nào</p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Trái: danh sách khu vực */}
          <div
            className="w-72 flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ background: "#FAFFFE", border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
          >
            <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${B.border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: B.mutedFg }}>Khu vực chức năng</p>
            </div>
            <div>
              {floorAreas.map((area) => (
                <AreaRow
                  key={area.id}
                  area={area}
                  isSelected={selectedArea?.id === area.id}
                  onSelect={() => setSelectedArea(area)}
                />
              ))}
            </div>
          </div>

          {/* Phải: assets */}
          <div className="flex-1 min-w-0">
            {/* Header panel */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold" style={{ color: B.fg }}>
                  Tài sản trong {selectedArea?.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: B.mutedFg }}>
                  {assetsLoading ? "Đang tải..." : `${areaAssets.length} tài sản`}
                </p>
              </div>
              {selectedArea && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white rounded-xl transition"
                  style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  + Thêm tài sản
                </button>
              )}
            </div>

            {assetsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ border: `1px solid ${B.border}` }}>
                    <div className="h-40" style={{ background: B.muted }} />
                    <div className="p-3 space-y-2">
                      <div className="h-3 rounded w-3/4" style={{ background: B.muted }} />
                      <div className="h-2 rounded w-full" style={{ background: B.muted }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : assetsError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm" style={{ color: B.mutedFg }}>{assetsError}</p>
              </div>
            ) : areaAssets.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
                style={{ background: "#FAFFFE", border: `1px solid ${B.border}` }}
              >
                <Package className="w-10 h-10" style={{ color: B.border }} />
                <p className="text-sm" style={{ color: B.mutedFg }}>Khu vực này chưa có tài sản</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {areaAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onSelect={() => setDrawerAssetId(asset.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AssetDetailDrawer assetId={drawerAssetId} onClose={() => setDrawerAssetId(null)} />

      {showCreate && selectedArea && (
        <CreateAssetModal
          houseId={id}
          functionAreaId={selectedArea.id}
          onClose={() => setShowCreate(false)}
          onSuccess={() => loadAssets(selectedArea)}
        />
      )}
    </div>
  );
}
