import { useEffect, useState } from "react";
import api from "../../../lib/axios";

/**
 * Full nationality list for the tenant form, proxied through
 *   GET /api/econtracts/lookups/nationalities (econtract-service)
 * which in turn hits the HCM ESB "GetDanhMucQuocTich" endpoint
 *   (https://hcmesb.tphcm.gov.vn/...) — authoritative VN government list.
 *
 * Why a BE proxy (not direct):
 *   HCM ESB requires a signed Authorization header derived from AccessKey +
 *   SecretKey + AppName. Those secrets must not live in the browser bundle,
 *   and the platform doesn't emit CORS headers either. The BE holds the
 *   creds, caches the response for 24h, and returns a clean shape to us.
 *
 * Failure mode:
 *   If the BE call fails (offline, backend down), fall back to a bundled
 *   list of ~30 nationalities common in TP.HCM rental contracts — the form
 *   stays usable even with network partition.
 *
 * Cache:
 *   Module-scope cache avoids re-fetching across component re-mounts in the
 *   same page session.
 */

// Emergency fallback when the BE is unreachable on the very first load
// (module-scope cache hasn't been populated yet). Covers the 30 most
// common nationalities in HCMC rental contracts so the form stays
// usable offline. labelJa added so the JA-locale dropdown isn't blank.
const FALLBACK = [
  { code: "KOR", labelVi: "Hàn Quốc",        labelEn: "South Korea",    labelJa: "韓国" },
  { code: "JPN", labelVi: "Nhật Bản",        labelEn: "Japan",          labelJa: "日本" },
  { code: "CHN", labelVi: "Trung Quốc",      labelEn: "China",          labelJa: "中国" },
  { code: "TWN", labelVi: "Đài Loan",        labelEn: "Taiwan",         labelJa: "台湾" },
  { code: "USA", labelVi: "Hoa Kỳ",          labelEn: "United States",  labelJa: "アメリカ合衆国" },
  { code: "GBR", labelVi: "Vương quốc Anh",  labelEn: "United Kingdom", labelJa: "イギリス" },
  { code: "FRA", labelVi: "Pháp",            labelEn: "France",         labelJa: "フランス" },
  { code: "DEU", labelVi: "Đức",             labelEn: "Germany",        labelJa: "ドイツ" },
  { code: "AUS", labelVi: "Úc",              labelEn: "Australia",      labelJa: "オーストラリア" },
  { code: "CAN", labelVi: "Canada",          labelEn: "Canada",         labelJa: "カナダ" },
  { code: "SGP", labelVi: "Singapore",       labelEn: "Singapore",      labelJa: "シンガポール" },
  { code: "MYS", labelVi: "Malaysia",        labelEn: "Malaysia",       labelJa: "マレーシア" },
  { code: "THA", labelVi: "Thái Lan",        labelEn: "Thailand",       labelJa: "タイ" },
  { code: "PHL", labelVi: "Philippines",     labelEn: "Philippines",    labelJa: "フィリピン" },
  { code: "IDN", labelVi: "Indonesia",       labelEn: "Indonesia",      labelJa: "インドネシア" },
  { code: "IND", labelVi: "Ấn Độ",           labelEn: "India",          labelJa: "インド" },
  { code: "RUS", labelVi: "Nga",             labelEn: "Russia",         labelJa: "ロシア" },
  { code: "NLD", labelVi: "Hà Lan",          labelEn: "Netherlands",    labelJa: "オランダ" },
  { code: "ESP", labelVi: "Tây Ban Nha",     labelEn: "Spain",          labelJa: "スペイン" },
  { code: "ITA", labelVi: "Ý",               labelEn: "Italy",          labelJa: "イタリア" },
  { code: "NZL", labelVi: "New Zealand",     labelEn: "New Zealand",    labelJa: "ニュージーランド" },
  { code: "CHE", labelVi: "Thụy Sĩ",         labelEn: "Switzerland",    labelJa: "スイス" },
  { code: "SWE", labelVi: "Thụy Điển",       labelEn: "Sweden",         labelJa: "スウェーデン" },
  { code: "NOR", labelVi: "Na Uy",           labelEn: "Norway",         labelJa: "ノルウェー" },
  { code: "DNK", labelVi: "Đan Mạch",        labelEn: "Denmark",        labelJa: "デンマーク" },
  { code: "FIN", labelVi: "Phần Lan",        labelEn: "Finland",        labelJa: "フィンランド" },
  { code: "BEL", labelVi: "Bỉ",              labelEn: "Belgium",        labelJa: "ベルギー" },
  { code: "AUT", labelVi: "Áo",              labelEn: "Austria",        labelJa: "オーストリア" },
  { code: "IRL", labelVi: "Ireland",         labelEn: "Ireland",        labelJa: "アイルランド" },
  { code: "BRA", labelVi: "Brazil",          labelEn: "Brazil",         labelJa: "ブラジル" },
];

let cache = null; // module-scope cache; persists across component re-mounts

async function fetchCountries() {
  // BE proxy → HCM ESB. Response shape (per HCM spec):
  //   { StatusCode, Description, ResultObject: [{code,name,description,used}], Status }
  // We unwrap via the standard ApiResponse envelope used elsewhere in the
  // project. Timeout 8s; BE has an in-process 24h cache so subsequent calls
  // are fast.
  // Path is relative to `VITE_API_BASE_URL` (which already includes `/api`),
  // so we pass `/econtracts/...` — NOT `/api/econtracts/...`. Adding a
  // second `/api` prefix was what caused the 404 on
  // `/api/api/econtracts/lookups/nationalities` earlier.
  //
  // Lives under `/econtracts/lookups` to match the gateway route
  // `/api/econtracts/**` — a top-level `/lookups/**` would need a
  // dedicated gateway route and redeploy, so we keep everything
  // under econtract-service's base path.
  const res = await api.get("/econtracts/lookups/nationalities", { timeout: 8000 });
  const items = res?.data?.data || [];
  // BE returns per-locale names: { code, nameVi, nameEn, nameJa, used }
  // (plus legacy aliases `name` / `description` that mirror VI/EN). We
  // surface all three so the Select can render the one matching the
  // current app locale without another round-trip.
  return items
    .filter((c) => c?.code && (c.nameVi || c.nameEn || c.name))
    .map((c) => ({
      code: c.code,
      labelVi: c.nameVi ?? c.name ?? c.nameEn ?? c.code,
      labelEn: c.nameEn ?? c.description ?? c.nameVi ?? c.code,
      labelJa: c.nameJa ?? c.nameEn ?? c.description ?? c.nameVi ?? c.code,
      flag: "",
    }))
    .sort((a, b) => a.labelVi.localeCompare(b.labelVi, "vi"));
}

export function useCountries() {
  const [countries, setCountries] = useState(() => cache ?? FALLBACK);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    setLoading(true);
    fetchCountries()
      .then((list) => {
        if (cancelled) return;
        cache = list;
        setCountries(list);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        // Keep FALLBACK already in state. Surface the error for debugging
        // but don't block the form — the 30 most-common nationalities cover
        // virtually every foreign tenant we'll see.
        setError(e.message || "fetch failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { countries, loading, error };
}
