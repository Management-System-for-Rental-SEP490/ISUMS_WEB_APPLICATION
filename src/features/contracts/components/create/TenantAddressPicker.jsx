import { useEffect, useRef, useState } from "react";

const API = "https://provinces.open-api.vn/api/v2";

const selectClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition";
const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function TenantAddressPicker({ value, onChange, error }) {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards]         = useState([]);
  const [province, setProvince]   = useState(null);
  const [ward, setWard]           = useState(null);
  const [street, setStreet]       = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards]         = useState(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (!value) {
      setProvince(null);
      setWard(null);
      setStreet("");
      setWards([]);
    }
  }, [value]);

  useEffect(() => {
    fetch(`${API}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!province) { setWards([]); return; }
    setLoadingWards(true);
    fetch(`${API}/p/${province.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? data.districts ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [province]);

  const emit = (s, w, p) => {
    const parts = [s.trim(), w?.name, p?.name].filter(Boolean);
    onChangeRef.current?.({ target: { value: parts.join(", ") } });
  };

  const handleProvinceChange = (e) => {
    const found = provinces.find((p) => String(p.code) === e.target.value) ?? null;
    setProvince(found);
    setWard(null);
    setWards([]);
    emit(street, null, found);
  };

  const handleWardChange = (e) => {
    const found = wards.find((w) => String(w.code) === e.target.value) ?? null;
    setWard(found);
    emit(street, found, province);
  };

  const handleStreetChange = (e) => {
    setStreet(e.target.value);
    emit(e.target.value, ward, province);
  };

  const preview = [street.trim(), ward?.name, province?.name].filter(Boolean).join(", ");

  return (
    <div className="space-y-4 pt-2">
      {/* Header — nhẹ, flat, không có box */}
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">Địa chỉ thường trú</span>
        <span className="text-red-500 text-sm">*</span>
      </div>

      {/* Tỉnh + Phường */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tỉnh / Thành phố</label>
          <select
            value={province?.code ?? ""}
            onChange={handleProvinceChange}
            disabled={loadingProvinces}
            className={`${selectClass} ${!province && error ? "border-red-500" : ""}`}
          >
            <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh / thành phố"}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Phường / Xã</label>
          <select
            value={ward?.code ?? ""}
            onChange={handleWardChange}
            disabled={!province || loadingWards}
            className={`${selectClass} ${!ward && error ? "border-red-500" : ""}`}
          >
            <option value="">
              {loadingWards ? "Đang tải..." : !province ? "Chọn tỉnh trước" : "Chọn phường / xã"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Số nhà, đường */}
      <div>
        <label className={labelClass}>Số nhà, tên đường</label>
        <input
          value={street}
          onChange={handleStreetChange}
          placeholder="VD: 30 đường 11"
          className={`${inputClass} ${error ? "border-red-500" : ""}`}
        />
      </div>

      {/* Preview — chỉ text, không có box */}
      {preview && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {preview}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
