import { useEffect, useState } from "react";

const API = "https://provinces.open-api.vn/api/v2";

/**
 * Hook tải danh sách tỉnh/thành và phường/xã từ provinces.open-api.vn
 * @returns {{ provinces, wards, loadingProvinces, loadingWards, selectedProvince, selectProvince, selectedWard, selectWard }}
 */
export function useVietnamAddress() {
  const [provinces, setProvinces]               = useState([]);
  const [wards, setWards]                       = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard]         = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards]         = useState(false);

  useEffect(() => {
    fetch(`${API}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!selectedProvince) { setWards([]); return; }
    setLoadingWards(true);
    fetch(`${API}/p/${selectedProvince.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? data.districts ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  }, [selectedProvince]);

  const selectProvince = (code) => {
    const found = provinces.find((p) => String(p.code) === String(code)) ?? null;
    setSelectedProvince(found);
    setSelectedWard(null);
    setWards([]);
    return found;
  };

  const selectWard = (code) => {
    const found = wards.find((w) => String(w.code) === String(code)) ?? null;
    setSelectedWard(found);
    return found;
  };

  const reset = () => {
    setSelectedProvince(null);
    setSelectedWard(null);
    setWards([]);
  };

  return {
    provinces,
    wards,
    loadingProvinces,
    loadingWards,
    selectedProvince,
    selectedWard,
    selectProvince,
    selectWard,
    reset,
  };
}
