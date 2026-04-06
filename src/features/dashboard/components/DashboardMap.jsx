import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLOR = {
  RENTED: "#14b8a6",
  AVAILABLE: "#22c55e",
  VACANT: "#94a3b8",
  MAINTENANCE: "#f59e0b",
  INACTIVE: "#94a3b8",
};

const STATUS_LABEL = {
  RENTED: "Đang thuê",
  AVAILABLE: "Còn trống",
  VACANT: "Còn trống",
  MAINTENANCE: "Bảo trì",
  INACTIVE: "Không hoạt động",
};

function createDotIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.35);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function buildAddress(house) {
  return [house.address, house.commune, house.city].filter(Boolean).join(", ");
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "vi" } });
  const data = await res.json();
  if (data[0])
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

export default function DashboardMap({ houses = [] }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!houses.length) return;
    let cancelled = false;
    setMarkers([]);

    const run = async () => {
      for (const house of houses) {
        if (cancelled) break;
        try {
          const coords = await geocode(buildAddress(house));
          if (coords && !cancelled)
            setMarkers((prev) => [...prev, { house, ...coords }]);
        } catch {
          // bỏ qua nếu geocode lỗi
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [houses]);

  const uniqueStatuses = [
    ...new Set(houses.map((h) => h.status).filter(Boolean)),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            Bản đồ bất động sản sở hữu{" "}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {markers.length > 0
              ? `Hiển thị ${markers.length}/${houses.length} địa điểm`
              : houses.length > 0
                ? "Đang tải vị trí..."
                : "TP. Hồ Chí Minh"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {uniqueStatuses.map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: STATUS_COLOR[s] ?? "#94a3b8" }}
              />
              {STATUS_LABEL[s] ?? s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: 500 }}>
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map(({ house, lat, lng }) => (
            <Marker
              key={house.id}
              position={[lat, lng]}
              icon={createDotIcon(STATUS_COLOR[house.status] ?? "#94a3b8")}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-semibold text-gray-900 mb-1">
                    {house.name}
                  </p>
                  <p className="text-gray-500 text-xs mb-2">
                    {buildAddress(house)}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${STATUS_COLOR[house.status] ?? "#94a3b8"}20`,
                      color: STATUS_COLOR[house.status] ?? "#94a3b8",
                    }}
                  >
                    {STATUS_LABEL[house.status] ?? house.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
