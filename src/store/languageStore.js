import { useSyncExternalStore } from "react";
import i18n from "../i18n";
import dayjs from "dayjs";

const STORAGE_KEY = "app_language";
const SUPPORTED = ["vi", "en", "ja"];

let state = { language: localStorage.getItem(STORAGE_KEY) || "vi" };
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  listeners.forEach((l) => l());
}

export const languageActions = {
  setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    i18n.changeLanguage(lang);
    dayjs.locale(lang);
    state = { language: lang };
    notify();
  },
};

export function useLanguageStore(selector) {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()));
}
