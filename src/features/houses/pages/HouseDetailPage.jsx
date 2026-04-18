import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, AlertCircle, Plus, Settings } from "lucide-react";
import { useHouseDetail } from "../hooks/useHouseDetail";
import HouseOverviewTab from "../components/HouseOverviewTab";
import AddAreaModal from "../components/AddAreaModal";

const HOUSE_STATUS = {
  AVAILABLE:   { label: "Còn trống", cls: "bg-emerald-100 text-emerald-700" },
  RENTED:      { label: "Đã thuê",   cls: "bg-orange-100 text-orange-700"   },
  MAINTENANCE: { label: "Bảo trì",   cls: "bg-slate-100 text-slate-600"     },
  default:     { label: "—",         cls: "bg-gray-100 text-gray-500"       },
};

export default function HouseDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [showAddArea, setShowAddArea] = useState(false);

  const { house, assets, loading, error, refetch } = useHouseDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#3bb582" }} />
        <span className="text-sm" style={{ color: "#5A7A6E" }}>Đang tải...</span>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm" style={{ color: "#5A7A6E" }}>{error ?? "Không tìm thấy nhà"}</p>
        <button onClick={refetch} className="text-sm underline" style={{ color: "#3bb582" }}>Thử lại</button>
      </div>
    );
  }

  const hsBadge = HOUSE_STATUS[house.status] ?? HOUSE_STATUS.default;
  const fullAddr = [house.address, house.commune, house.city].filter(Boolean).join(", ");
  const areas    = Array.isArray(house.functionalAreas) ? house.functionalAreas : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-2 rounded-xl transition flex-shrink-0"
            style={{ background: "#EAF4F0", color: "#5A7A6E" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C4DED5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#EAF4F0"; }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
                {house.name ?? "Chưa đặt tên"}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${hsBadge.cls}`}>
                {hsBadge.label}
              </span>
            </div>
            {fullAddr && (
              <div className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#5A7A6E" }}>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#3bb582" }} />
                <span>{fullAddr}</span>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm" style={{ color: "#5A7A6E" }}>
                <span className="font-bold" style={{ color: "#1E2D28" }}>{areas.length}</span> khu vực
              </span>
              <span className="text-sm" style={{ color: "#5A7A6E" }}>
                <span className="font-bold" style={{ color: "#1E2D28" }}>{assets.length}</span> tài sản
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; }}
          >
            <Settings className="w-3.5 h-3.5" />
            Chỉnh sửa
          </button>
          <button
            onClick={() => setShowAddArea(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white rounded-full transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <Plus className="w-4 h-4" />
            Thêm khu vực
          </button>
        </div>
      </div>

      {/* Main: 3-column floor plan layout */}
      <HouseOverviewTab house={house} assets={assets} />

      {showAddArea && (
        <AddAreaModal houseId={id} numberOfFloors={house.numberOfFloors} onClose={() => setShowAddArea(false)} onSuccess={refetch} />
      )}
    </div>
  );
}
