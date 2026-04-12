import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Package, LayoutDashboard,
  Loader2, AlertCircle, Plus, Settings,
  ClipboardList, CalendarDays,
} from "lucide-react";
import { useHouseDetail } from "../hooks/useHouseDetail";
import HouseOverviewTab from "../components/HouseOverviewTab";
import HouseAssetsTab from "../components/HouseAssetsTab";
import AddAreaModal from "../components/AddAreaModal";

const HOUSE_STATUS = {
  AVAILABLE:   { label: "Còn trống", cls: "bg-emerald-100 text-emerald-700" },
  RENTED:      { label: "Đã thuê",   cls: "bg-orange-100 text-orange-700"   },
  MAINTENANCE: { label: "Bảo trì",   cls: "bg-slate-100  text-slate-600"    },
  default:     { label: "—",         cls: "bg-gray-100   text-gray-500"     },
};

const TABS = [
  { key: "overview", label: "Tổng quan", Icon: LayoutDashboard },
  { key: "assets",   label: "Tài sản",   Icon: Package         },
];

export default function HouseDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [tab, setTab]         = useState("overview");
  const [showAddArea, setShowAddArea] = useState(false);

  const { house, assets, loading, error, refetch } = useHouseDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span className="text-sm">Đang tải...</span>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-sm text-gray-500">{error ?? "Không tìm thấy nhà"}</p>
        <button onClick={refetch} className="text-sm text-teal-600 underline">Thử lại</button>
      </div>
    );
  }

  const hsBadge  = HOUSE_STATUS[house.status] ?? HOUSE_STATUS.default;
  const fullAddr = [house.address, house.commune, house.city].filter(Boolean).join(", ");
  const areas    = Array.isArray(house.functionalAreas) ? house.functionalAreas : [];
  const floors   = [...new Set(areas.map((a) => a.floorNo))].length;

  return (
    <div className="space-y-0">
      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: back + info */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900">{house.name ?? "Chưa đặt tên"}</h1>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${hsBadge.cls}`}>
                  {hsBadge.label}
                </span>
              </div>
              {fullAddr && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{fullAddr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: stats */}
          <div className="flex items-center gap-6 flex-shrink-0 pr-2">
            {[
              { label: "Khu vực", value: areas.length  },
              { label: "Tài sản", value: assets.length },
            ].map(({ label, value }, i, arr) => (
              <div key={label} className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-0">
            {TABS.map(({ key, label, Icon }) => {
              const isActive = tab === key;
              const count = key === "assets" ? assets.length : areas.length;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative flex items-center gap-1.5 px-1 py-2 mr-6 text-sm font-medium transition ${
                    isActive ? "text-teal-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  <span className={`text-xs font-semibold ${isActive ? "text-teal-600" : "text-gray-400"}`}>
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t" />
                  )}
                </button>
              );
            })}
          </div>

          {tab === "overview" && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Settings className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => setShowAddArea(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm khu vực
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex gap-4 items-start">
        {/* Main */}
        <div className="flex-1 min-w-0 px-1">
          {tab === "overview" && (
            <HouseOverviewTab house={house} assets={assets} floors={floors} />
          )}
          {tab === "assets" && (
            <HouseAssetsTab assets={assets} functionalAreas={areas} />
          )}
        </div>

        {/* Sidebar */}
        {tab === "overview" && (
          <div className="w-64 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-4 space-y-5">
            {/* Management notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ghi chú quản lý</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-start gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {house.description ?? "Chưa có ghi chú nào cho nhà này."}
                  </p>
                </div>
                <button className="w-full mt-2 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition">
                  Xem lịch bảo trì
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tổng quan nhanh</h3>
              <div className="space-y-2">
                {[
                  { label: "Tổng khu vực",   value: areas.length,                         color: "text-gray-900"    },
                  { label: "Tài sản đang dùng", value: assets.filter(a => a.status === "IN_USE").length, color: "text-emerald-600" },
                  { label: "Đã thanh lý",    value: assets.filter(a => a.status === "DISPOSED").length, color: "text-red-500"     },
                  { label: "Chưa phân khu",  value: assets.filter(a => !a.functionAreaId).length, color: "text-amber-600"   },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                Cập nhật gần đây
              </h3>
              {assets.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{a.displayName}</p>
                    <p className="text-[10px] text-gray-400">
                      {a.updateAt ? new Date(a.updateAt).toLocaleDateString("vi-VN") : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddArea && (
        <AddAreaModal
          houseId={id}
          onClose={() => setShowAddArea(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
