import { useEffect, useRef, useState } from "react";
import { Select } from "antd";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useVietnamAddress } from "../../hooks/useVietnamAddress";

// Fix Leaflet default icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#3bb582;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const CARTO_TILE = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTR = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';
const DEFAULT_CENTER = [16.047079, 108.20623]; // Trung tâm Việt Nam

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 15, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition";

const PinIcon = () => (
  <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * Props:
 *   value         — string địa chỉ đầy đủ (để reset khi form clear)
 *   onChange      — (e: { target: { value: string } }) => void
 *   onPartsChange — ({ street, ward, city }) => void
 *   error         — string | undefined
 *   label         — string
 *   showMap       — boolean (default false)
 */
export default function AddressPicker({
  value,
  onChange,
  onPartsChange,
  error,
  label = "Địa chỉ thường trú",
  showMap = false,
}) {
  const {
    provinces, wards,
    loadingProvinces, loadingWards,
    selectedProvince, selectedWard,
    selectProvince, selectWard,
    reset,
  } = useVietnamAddress();

  const [street, setStreet]     = useState("");
  const [coords, setCoords]     = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const onChangeRef  = useRef(onChange);
  const onPartsRef   = useRef(onPartsChange);
  const geocodeTimer = useRef(null);

  useEffect(() => { onChangeRef.current = onChange; onPartsRef.current = onPartsChange; });

  useEffect(() => {
    if (!value) { reset(); setStreet(""); setCoords(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (s, ward, province) => {
    const parts = [s.trim(), ward?.name, province?.name].filter(Boolean);
    onChangeRef.current?.({ target: { value: parts.join(", ") } });
    onPartsRef.current?.({ street: s.trim(), ward: ward?.name ?? "", city: province?.name ?? "" });
  };

  const handleProvinceChange = (val) => {
    const found = selectProvince(val);
    emit(street, null, found);
  };

  const handleWardChange = (val) => {
    const found = selectWard(val);
    emit(street, found, selectedProvince);
  };

  const handleStreetChange = (e) => {
    setStreet(e.target.value);
    emit(e.target.value, selectedWard, selectedProvince);
  };

  const preview = [street.trim(), selectedWard?.name, selectedProvince?.name].filter(Boolean).join(", ");

  // Geocode khi preview thay đổi (debounce 800ms), chỉ khi showMap=true
  useEffect(() => {
    if (!showMap || !preview) return;
    clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(preview)}&format=json&limit=1`,
          { headers: { "Accept-Language": "vi" } }
        );
        const data = await res.json();
        if (data[0]) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } catch {
        // ignore geocode errors
      } finally {
        setGeocoding(false);
      }
    }, 800);
    return () => clearTimeout(geocodeTimer.current);
  }, [preview, showMap]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-1.5">
        <PinIcon />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-red-500 text-sm">*</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tỉnh / Thành phố</label>
          <Select
            value={selectedProvince?.code ?? undefined}
            onChange={handleProvinceChange}
            disabled={loadingProvinces}
            loading={loadingProvinces}
            placeholder="Chọn tỉnh / thành phố"
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            status={!selectedProvince && error ? "error" : ""}
            options={provinces.map((p) => ({ value: p.code, label: p.name }))}
          />
        </div>
        <div>
          <label className={labelClass}>Phường / Xã</label>
          <Select
            value={selectedWard?.code ?? undefined}
            onChange={handleWardChange}
            disabled={!selectedProvince || loadingWards}
            loading={loadingWards}
            placeholder={!selectedProvince ? "Chọn tỉnh trước" : "Chọn phường / xã"}
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            status={!selectedWard && error ? "error" : ""}
            options={wards.map((w) => ({ value: w.code, label: w.name }))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Số nhà, tên đường</label>
        <input
          value={street}
          onChange={handleStreetChange}
          placeholder="VD: 30 đường 11"
          className={`${inputClass} ${error ? "border-red-500" : ""}`}
        />
      </div>

      {preview && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <PinIcon />
          {preview}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Map preview */}
      {showMap && (
        <div className="relative mt-1 rounded-xl overflow-hidden border border-slate-200" style={{ height: 220 }}>
          {geocoding && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                Đang xác định vị trí...
              </div>
            </div>
          )}
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={5}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={CARTO_TILE} attribution={CARTO_ATTR} />
            {coords && (
              <>
                <FlyTo coords={coords} />
                <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
              </>
            )}
          </MapContainer>

          {!preview && (
            <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center bg-slate-50/80 gap-2 pointer-events-none">
              <PinIcon />
              <p className="text-xs text-slate-400">Nhập địa chỉ để xem vị trí trên bản đồ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
