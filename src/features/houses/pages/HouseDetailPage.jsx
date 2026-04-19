import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, Loader2, AlertCircle, Plus, Settings, ChevronRight,
  Package, AlertTriangle, Wrench, Clock, Shield, LogIn, LogOut, ClipboardList,
} from "lucide-react";
import { useHouseDetail } from "../hooks/useHouseDetail";
import AddAreaModal from "../components/AddAreaModal";
import { STATUS_AREA } from "../components/HouseOverviewTab";
import { getHouseHistory } from "../api/houses.api";

const B = {
  green: "#3bb582",
  dark: "#1E2D28",
  border: "#C4DED5",
  muted: "#EAF4F0",
  fg: "#1E2D28",
  mutedFg: "#5A7A6E",
};

const HOUSE_STATUS = {
  AVAILABLE: { label: "Còn trống", cls: "bg-emerald-100 text-emerald-700" },
  RENTED: { label: "Đã thuê", cls: "bg-blue-100 text-blue-700" },
  MAINTENANCE: { label: "Bảo trì", cls: "bg-amber-100 text-amber-700" },
  default: { label: "—", cls: "bg-gray-100 text-gray-500" },
};

const HISTORY_CONFIG = {
  MAINTENANCE:        { icon: Wrench,        iconBg: B.muted,    iconColor: B.green    },
  INSPECTION_CHECK_IN:  { icon: LogIn,        iconBg: "#EFF6FF",  iconColor: "#3b82f6"  },
  INSPECTION_CHECK_OUT: { icon: LogOut,       iconBg: "#FFF7ED",  iconColor: "#f97316"  },
  INSPECTION:         { icon: ClipboardList,  iconBg: "#F5F3FF",  iconColor: "#8b5cf6"  },
};

function getHistoryCfg(item) {
  if (item.source === "MAINTENANCE") return HISTORY_CONFIG.MAINTENANCE;
  if (item.type === "CHECK_IN")  return HISTORY_CONFIG.INSPECTION_CHECK_IN;
  if (item.type === "CHECK_OUT") return HISTORY_CONFIG.INSPECTION_CHECK_OUT;
  return HISTORY_CONFIG.INSPECTION;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date;
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "Vừa xong";
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Hôm qua";
  if (diffD < 7) return `${diffD} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor, icon, iconBg, iconColor }) {
  const Icon = icon;
  return (
    <div
      className="flex-1 rounded-2xl p-5"
      style={{ background: "#FFFFFF", border: `1px solid ${B.border}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: B.mutedFg }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg ?? B.muted }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor ?? B.green }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color: B.fg }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: subColor ?? B.mutedFg }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── FloorCard ─────────────────────────────────────────────────────────────────

function FloorCard({ floor, areas, houseId, navigate }) {
  const floorLabel = floor === "0" ? "Tầng trệt" : `Tầng ${floor}`;
  const totalAssets = areas.reduce((s, a) => s + (a.assetCount ?? 0), 0);
  const hasIssue = areas.some(
    (a) => a.status === "DAMAGED" || a.status === "MAINTENANCE",
  );

  return (
    <div
      className="flex items-center gap-5 px-5 py-3.5 rounded-2xl"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${B.border}`,
        borderLeft: `4px solid ${hasIssue ? "#ef4444" : B.green}`,
      }}
    >
      {/* Floor number — label trên, số dưới */}
      <div className="flex-shrink-0 w-10 text-center">
        <p
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: B.mutedFg }}
        >
          Tầng
        </p>
        <p
          className="text-2xl font-bold leading-tight"
          style={{ color: hasIssue ? "#ef4444" : B.fg }}
        >
          {String(floor).padStart(2, "0")}
        </p>
      </div>

      <div className="w-px self-stretch flex-shrink-0" style={{ background: B.border }} />

      {/* Name + chips + area count */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5">
          <p className="text-sm font-bold" style={{ color: B.fg }}>{floorLabel}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: B.muted, color: B.mutedFg }}>
            {areas.length} khu vực
          </span>
          {hasIssue && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-red-50 text-red-500">
              {areas.filter(a => a.status === "DAMAGED" || a.status === "MAINTENANCE").length} sự cố
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {areas.slice(0, 5).map((area) => {
            const st = STATUS_AREA[area.status] ?? STATUS_AREA.default;
            const isIssue = area.status === "DAMAGED" || area.status === "MAINTENANCE";
            return (
              <span
                key={area.id}
                className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full"
                style={{ background: B.muted, color: B.fg }}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                {area.name}
                {isIssue && <AlertTriangle className="w-3 h-3 text-amber-500 ml-0.5" />}
              </span>
            );
          })}
          {areas.length > 5 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: B.muted, color: B.mutedFg }}>
              +{areas.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Asset count + button */}
      <div className="flex items-center gap-4 flex-shrink-0">
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
        <button
          onClick={() => navigate(`/houses/${houseId}/floors/${floor}`)}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          style={{
            background: B.muted,
            color: B.green,
            border: `1px solid ${B.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#C4DED5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = B.muted;
          }}
        >
          Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddArea, setShowAddArea] = useState(false);

  const { house, loading, error, refetch } = useHouseDetail(id);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!id) return;
    getHouseHistory(id).then(setHistory).catch(() => setHistory([]));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: B.green }} />
        <span className="text-sm" style={{ color: B.mutedFg }}>
          Đang tải...
        </span>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm" style={{ color: B.mutedFg }}>
          {error ?? "Không tìm thấy nhà"}
        </p>
        <button
          onClick={refetch}
          className="text-sm underline"
          style={{ color: B.green }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const hsBadge = HOUSE_STATUS[house.status] ?? HOUSE_STATUS.default;
  const fullAddr = [house.address, house.ward, house.city]
    .filter(Boolean)
    .join(", ");
  const areas = Array.isArray(house.functionalAreas)
    ? house.functionalAreas
    : [];
  const totalAssets = areas.reduce((s, a) => s + (a.assetCount ?? 0), 0);
  const alertCount = areas.filter(
    (a) => a.status === "DAMAGED" || a.status === "MAINTENANCE",
  ).length;

  const grouped = areas.reduce((acc, area) => {
    const key = String(area.floorNo ?? "0");
    (acc[key] = acc[key] ?? []).push(area);
    return acc;
  }, {});
  const sortedFloors = Object.keys(grouped).sort(
    (a, b) => Number(a) - Number(b),
  );

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: B.fg }}>
            {house.name ?? "Chưa đặt tên"}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${hsBadge.cls}`}
            >
              {hsBadge.label}
            </span>
            {fullAddr && (
              <span
                className="flex items-center gap-1 text-sm"
                style={{ color: B.mutedFg }}
              >
                <MapPin
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: B.green }}
                />
                {fullAddr}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            style={{
              border: `1px solid ${B.border}`,
              color: B.mutedFg,
              background: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = B.green;
              e.currentTarget.style.color = B.green;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = B.border;
              e.currentTarget.style.color = B.mutedFg;
            }}
          >
            <Settings className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
          <button
            onClick={() => setShowAddArea(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{
              background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Plus className="w-4 h-4" /> Thêm khu vực
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex gap-4">
        <StatCard label="Tổng tài sản" value={totalAssets} icon={Package} />
        <StatCard label="Khu vực" value={areas.length} icon={Shield} />
        <StatCard
          label="Cảnh báo"
          value={String(alertCount).padStart(2, "0")}
          sub={alertCount > 0 ? "Yêu cầu chú ý ngay" : "Không có vấn đề"}
          subColor={alertCount > 0 ? "#ef4444" : B.mutedFg}
          icon={AlertTriangle}
          iconBg={alertCount > 0 ? "#FEF2F2" : B.muted}
          iconColor={alertCount > 0 ? "#ef4444" : B.green}
        />
      </div>

      {/* ── 2-column: Floor Directory + Sidebar ── */}
      <div className="flex gap-5 items-start">
        {/* Floor Directory */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: B.fg }}>
              Chi tiết các tầng
            </h2>
          </div>

          {sortedFloors.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
              style={{ background: "#FFFFFF", border: `1px solid ${B.border}` }}
            >
              <Package className="w-10 h-10" style={{ color: B.border }} />
              <p className="text-sm" style={{ color: B.mutedFg }}>
                Chưa có tầng nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFloors.map((floor) => (
                <FloorCard
                  key={floor}
                  floor={floor}
                  areas={grouped[floor]}
                  houseId={id}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Management Notes */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "#FFFFFF", border: `1px solid ${B.border}` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: B.mutedFg }}
            >
              Ghi chú quản lý
            </p>
            <p className="text-sm leading-relaxed" style={{ color: B.fg }}>
              {house.description ?? "Chưa có ghi chú."}
            </p>
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "#FFFFFF", border: `1px solid ${B.border}` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: B.mutedFg }}
            >
              Hoạt động gần đây
            </p>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: B.mutedFg }}>Chưa có hoạt động nào</p>
              ) : (
                history.slice(0, 5).map((item) => {
                  const cfg = getHistoryCfg(item);
                  const ActivityIcon = cfg.icon;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: cfg.iconBg }}
                      >
                        <ActivityIcon className="w-4 h-4" style={{ color: cfg.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold leading-snug" style={{ color: B.fg }}>
                            {item.title}
                          </p>
                          <span className="text-[10px] flex-shrink-0 flex items-center gap-0.5" style={{ color: B.mutedFg }}>
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(item.happenedAt)}
                          </span>
                        </div>
                        {item.staffName && (
                          <p className="text-[10px] mt-0.5" style={{ color: B.mutedFg }}>
                            Nhân viên: {item.staffName}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: B.mutedFg }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              className="w-full mt-4 py-2 text-xs font-medium rounded-xl transition"
              style={{
                border: `1px solid ${B.border}`,
                color: B.mutedFg,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = B.muted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Xem toàn bộ lịch sử
            </button>
          </div>
        </div>
      </div>

      {showAddArea && (
        <AddAreaModal
          houseId={id}
          numberOfFloors={house.numberOfFloors}
          onClose={() => setShowAddArea(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
