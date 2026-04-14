import { useEffect, useRef, useState } from "react";
import { Select } from "antd";
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
