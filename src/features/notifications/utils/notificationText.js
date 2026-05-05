const RESERVED_KEYS = new Set(["_source", "_auto"]);

function normalizeLanguage(language) {
  if (!language) return "";
  return String(language).trim().toLowerCase().replace("_", "-").split("-")[0];
}

function firstNonEmptyMapValue(map) {
  if (!map || typeof map !== "object") return "";
  for (const [key, value] of Object.entries(map)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pick(map, language) {
  if (!map || typeof map !== "object") return "";
  const direct = map[language];
  return typeof direct === "string" && direct.trim() ? direct.trim() : "";
}

export function resolveNotificationText(notification, field, language, fallback = "") {
  if (!notification) return fallback;

  const map =
    field === "title"
      ? notification.titleTranslations
      : notification.bodyTranslations;
  const flat =
    field === "title"
      ? notification.title
      : notification.body || notification.message || notification.content;
  const flatText = typeof flat === "string" && flat.trim() ? flat.trim() : "";

  if (map && typeof map === "object") {
    const lang = normalizeLanguage(language);
    const direct = pick(map, lang);
    if (direct) return direct;

    if (flatText) return flatText;

    const source = normalizeLanguage(map._source);
    const sourceText = pick(map, source);
    if (sourceText) return sourceText;

    return firstNonEmptyMapValue(map) || fallback;
  }

  return flatText || fallback;
}
