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

  /**
   * Fuzzy-resolve a free-text address string (e.g. "Thôn Phước Hòa, Xã Mộ Đức,
   * Tỉnh Quảng Ngãi") back into province/ward codes so the AddressPicker's
   * dropdowns can display the correct selection on mount.
   *
   * Strategy:
   *   1. Diacritic-insensitive substring search across province names;
   *      prefer the longest match (so "Tỉnh Quảng Ngãi" wins over "Tỉnh").
   *   2. After picking province, fetch its wards and repeat the match on them.
   *   3. Leftover text (minus matched province + ward) goes into the caller's
   *      street field via the `onStreet` callback.
   *
   * Returns { province, ward, street } — callers can await this to stitch the
   * result back into the form.
   */
  const resolveFromString = async (addressStr) => {
    if (!addressStr || typeof addressStr !== "string") return null;
    const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[đĐ]/g, "d");
    const addrN = norm(addressStr);

    // Wait until provinces are loaded (defensive — caller might invoke during
    // the initial fetch).
    let list = provinces;
    if (list.length === 0) {
      try {
        const data = await fetch(`${API}/p/`).then((r) => r.json());
        list = Array.isArray(data) ? data : [];
      } catch {
        return null;
      }
    }

    const matchP = list
      .filter((p) => addrN.includes(norm(p.name)))
      .sort((a, b) => b.name.length - a.name.length)[0];
    if (!matchP) return { province: null, ward: null, street: addressStr };
    setSelectedProvince(matchP);

    let wardList = [];
    try {
      const data = await fetch(`${API}/p/${matchP.code}?depth=2`).then((r) => r.json());
      wardList = data.wards ?? data.districts ?? [];
      setWards(wardList);
    } catch {
      // ward fetch failed — still return the matched province
      return { province: matchP, ward: null, street: addressStr };
    }

    const matchW = wardList
      .filter((w) => addrN.includes(norm(w.name)))
      .sort((a, b) => b.name.length - a.name.length)[0] ?? null;
    if (matchW) setSelectedWard(matchW);

    // Remove matched province + ward from the original string to recover the
    // street-level remainder. We strip trailing commas / whitespace too.
    let remaining = addressStr;
    if (matchP) remaining = remaining.replace(new RegExp(matchP.name, "i"), "");
    if (matchW) remaining = remaining.replace(new RegExp(matchW.name, "i"), "");
    remaining = remaining.replace(/[,\s]+$/g, "").replace(/^[,\s]+/g, "")
      .replace(/,\s*,+/g, ",").trim();

    return { province: matchP, ward: matchW, street: remaining };
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
    resolveFromString,
  };
}
