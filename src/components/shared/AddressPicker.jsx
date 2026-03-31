import { useEffect, useRef, useState } from "react";
import { useVietnamAddress } from "../../hooks/useVietnamAddress";

const selectClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition";
const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

const PinIcon = () => (
  <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * Component chọn địa chỉ Việt Nam (tỉnh/thành → phường/xã → số nhà)
 *
 * Props:
 *   value         — string địa chỉ đầy đủ hiện tại (để reset khi form clear)
 *   onChange      — (e: { target: { value: string } }) => void   — full string
 *   onPartsChange — ({ street, ward, city }) => void             — từng phần riêng
 *   error         — string | undefined
 *   label         — string (mặc định "Địa chỉ thường trú")
 */
export default function AddressPicker({ value, onChange, onPartsChange, error, label = "Địa chỉ thường trú" }) {
  const {
    provinces, wards,
    loadingProvinces, loadingWards,
    selectedProvince, selectedWard,
    selectProvince, selectWard,
    reset,
  } = useVietnamAddress();

  const [street, setStreet] = useState("");
  const onChangeRef = useRef(onChange);
  const onPartsRef  = useRef(onPartsChange);
  useEffect(() => { onChangeRef.current = onChange; onPartsRef.current = onPartsChange; });

  // Reset nội bộ khi form clear (value trở về "" hoặc undefined)
  useEffect(() => {
    if (!value) { reset(); setStreet(""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (s, ward, province) => {
    const parts = [s.trim(), ward?.name, province?.name].filter(Boolean);
    onChangeRef.current?.({ target: { value: parts.join(", ") } });
    onPartsRef.current?.({ street: s.trim(), ward: ward?.name ?? "", city: province?.name ?? "" });
  };

  const handleProvinceChange = (e) => {
    const found = selectProvince(e.target.value);
    emit(street, null, found);
  };

  const handleWardChange = (e) => {
    const found = selectWard(e.target.value);
    emit(street, found, selectedProvince);
  };

  const handleStreetChange = (e) => {
    setStreet(e.target.value);
    emit(e.target.value, selectedWard, selectedProvince);
  };

  const preview = [street.trim(), selectedWard?.name, selectedProvince?.name].filter(Boolean).join(", ");

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <PinIcon />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-red-500 text-sm">*</span>
      </div>

      {/* Tỉnh + Phường */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tỉnh / Thành phố</label>
          <select
            value={selectedProvince?.code ?? ""}
            onChange={handleProvinceChange}
            disabled={loadingProvinces}
            className={`${selectClass} ${!selectedProvince && error ? "border-red-500" : ""}`}
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
            value={selectedWard?.code ?? ""}
            onChange={handleWardChange}
            disabled={!selectedProvince || loadingWards}
            className={`${selectClass} ${!selectedWard && error ? "border-red-500" : ""}`}
          >
            <option value="">
              {loadingWards ? "Đang tải..." : !selectedProvince ? "Chọn tỉnh trước" : "Chọn phường / xã"}
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

      {/* Preview */}
      {preview && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <PinIcon />
          {preview}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
