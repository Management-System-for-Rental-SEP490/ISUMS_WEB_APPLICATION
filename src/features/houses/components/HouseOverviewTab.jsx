import { useNavigate } from "react-router-dom";
import {
  Bath,
  Bed,
  Building2,
  Flame,
  Package,
  Trees,
  Wind,
  ArrowRight,
  Tv,
  ChevronRight,
} from "lucide-react";

// ── Exported configs (used by HouseAssetsTab) ─────────────────────────────────

export const AREA_TYPE_CONFIG = {
  BEDROOM: {
    label: "Phòng ngủ",
    Icon: Bed,
    bg: "bg-blue-50",
    text: "text-blue-600",
    accent: "#3b82f6",
  },
  BATHROOM: {
    label: "Phòng tắm",
    Icon: Bath,
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    accent: "#06b6d4",
  },
  KITCHEN: {
    label: "Nhà bếp",
    Icon: Flame,
    bg: "bg-orange-50",
    text: "text-orange-600",
    accent: "#f97316",
  },
  LIVINGROOM: {
    label: "Phòng khách",
    Icon: Tv,
    bg: "bg-purple-50",
    text: "text-purple-600",
    accent: "#a855f7",
  },
  HALLWAY: {
    label: "Hành lang",
    Icon: ArrowRight,
    bg: "bg-slate-50",
    text: "text-slate-600",
    accent: "#64748b",
  },
  GARDEN: {
    label: "Sân vườn",
    Icon: Trees,
    bg: "bg-green-50",
    text: "text-green-600",
    accent: "#22c55e",
  },
  ALL: {
    label: "Toàn bộ",
    Icon: Wind,
    bg: "bg-teal-50",
    text: "text-teal-600",
    accent: "#14b8a6",
  },
  OTHER: {
    label: "Khác",
    Icon: Package,
    bg: "bg-gray-50",
    text: "text-gray-500",
    accent: "#6b7280",
  },
  default: {
    label: "Khu vực",
    Icon: Building2,
    bg: "bg-gray-50",
    text: "text-gray-500",
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
  IN_USE: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
  DISPOSED: { label: "Đang chờ thay ", cls: "bg-red-50 text-red-600" },
  BROKEN: { label: "Hỏng", cls: "bg-red-50 text-red-600" },
  UNDER_REPAIR: { label: "Đang sửa", cls: "bg-amber-50 text-amber-700" },
  default: { label: "Không rõ", cls: "bg-gray-100 text-gray-500" },
};

export function conditionColor(pct) {
  if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-red-500", text: "text-red-600" };
}

const B = {
  green: "#3bb582",
  dark: "#1E2D28",
  border: "#C4DED5",
  muted: "#EAF4F0",
  fg: "#1E2D28",
  mutedFg: "#5A7A6E",
};

// ── FloorCard ─────────────────────────────────────────────────────────────────

function FloorCard({ floor, areas, houseId, navigate }) {
  const floorLabel = floor === "0" ? "Tầng trệt" : `Tầng ${floor}`;
  const totalAssets = areas.reduce((s, a) => s + (a.assetCount ?? 0), 0);
  const issueCount = areas.filter(
    (a) => a.status === "DAMAGED" || a.status === "MAINTENANCE",
  ).length;
  const hasIssue = issueCount > 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/houses/${houseId}/floors/${floor}`)}
      className="w-full text-left rounded-2xl overflow-hidden transition-all duration-150"
      style={{
        background: "#FAFFFE",
        border: `1px solid ${hasIssue ? "#fca5a5" : B.border}`,
        borderLeft: `4px solid ${hasIssue ? "#ef4444" : B.green}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 20px -2px rgba(59,181,130,0.12)";
        e.currentTarget.style.background = B.muted;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = "#FAFFFE";
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-base font-bold" style={{ color: B.fg }}>
            {floorLabel}
          </p>
          <p className="text-xs mt-0.5" style={{ color: B.mutedFg }}>
            {areas.length} khu vực
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: B.mutedFg }}
            >
              Tài sản
            </p>
            <p className="text-xl font-bold" style={{ color: B.fg }}>
              {totalAssets}
            </p>
          </div>
          {hasIssue && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                Issues
              </p>
              <p className="text-xl font-bold text-red-500">{issueCount}</p>
            </div>
          )}
          <ChevronRight
            className="w-4 h-4 flex-shrink-0"
            style={{ color: B.mutedFg }}
          />
        </div>
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HouseOverviewTab({ house }) {
  const navigate = useNavigate();

  const areas = Array.isArray(house?.functionalAreas)
    ? house.functionalAreas
    : [];

  const grouped = areas.reduce((acc, area) => {
    const key = String(area.floorNo ?? "0");
    (acc[key] = acc[key] ?? []).push(area);
    return acc;
  }, {});

  const sortedFloors = Object.keys(grouped).sort(
    (a, b) => Number(a) - Number(b),
  );

  if (areas.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl"
        style={{ background: "#FAFFFE", border: `1px solid ${B.border}` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: B.muted }}
        >
          <Building2 className="w-7 h-7" style={{ color: B.green }} />
        </div>
        <p className="text-sm font-medium" style={{ color: B.mutedFg }}>
          Chưa có khu vực chức năng nào
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedFloors.map((floor) => (
        <FloorCard
          key={floor}
          floor={floor}
          areas={grouped[floor]}
          houseId={house.id}
          navigate={navigate}
        />
      ))}
    </div>
  );
}
