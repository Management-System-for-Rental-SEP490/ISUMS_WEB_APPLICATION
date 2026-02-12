import { Building2, MapPin } from "lucide-react";

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Còn trống",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RENTED: {
    label: "Đã thuê",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  default: {
    label: "—",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

export default function HouseCard({ house }) {
  const statusConfig = STATUS_CONFIG[house?.status] ?? STATUS_CONFIG.default;
  const displayName = house?.name ?? house?.title ?? "Chưa đặt tên";
  const address = house?.address ?? "—";
  const description = house?.description ?? "";
  const rentPrice = house?.rentPrice ?? house?.rent;
  const unit = house?.unit ? ` • ${house.unit}` : "";

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
      {/* Image placeholder / header area */}
      {/* <div className="aspect-[16/9] bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <Building2 className="w-8 h-8 text-teal-600" />
        </div>
      </div> */}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2">
            {displayName}
          </h3>
          <span
            className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg border ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {address && (
          <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
            <p className="line-clamp-2">
              {address}
              {unit}
            </p>
          </div>
        )}

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {rentPrice != null && rentPrice > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Giá thuê:</span>
            <span className="text-base font-semibold text-teal-700">
              ₫{Number(rentPrice).toLocaleString("vi-VN")}
              <span className="text-xs font-normal text-gray-500">/tháng</span>
            </span>
          </div>
        )}

        <button
          type="button"
          className="mt-4 w-full py-2 px-4 text-sm font-medium text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          onClick={() => console.log("TODO: view house", house?.id)}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
