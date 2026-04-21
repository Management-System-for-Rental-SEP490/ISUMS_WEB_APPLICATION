import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viCommon from "./locales/vi/common.json";
import enCommon from "./locales/en/common.json";
import jaCommon from "./locales/ja/common.json";

const STORAGE_KEY = "app_language";
const savedLanguage = localStorage.getItem(STORAGE_KEY) || "vi";

i18n.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: "vi",
  resources: {
    vi: { common: viCommon },
    en: { common: enCommon },
    ja: { common: jaCommon },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
