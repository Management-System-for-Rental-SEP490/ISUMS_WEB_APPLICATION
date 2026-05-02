import { useEffect, useState } from "react";
import { fetchNationalities } from "../api/contracts.api";

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

let cache = null;

export function useCountries() {
  const [countries, setCountries] = useState(() => cache ?? FALLBACK);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetchNationalities()
      .then((list) => {
        if (cancelled) return;
        cache = list;
        setCountries(list);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "fetch failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { countries, loading, error };
}
