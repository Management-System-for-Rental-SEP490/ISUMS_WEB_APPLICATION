const FORMATTER_CACHE = new Map();
const COMPACT_FORMATTER_CACHE = new Map();

function resolveLocale(input) {
  if (!input) return "vi-VN";
  if (input.startsWith("vi")) return "vi-VN";
  if (input.startsWith("ja")) return "ja-JP";
  if (input.startsWith("en")) return "en-US";
  return input;
}

function getFormatter(locale) {
  const key = resolveLocale(locale);
  let f = FORMATTER_CACHE.get(key);
  if (!f) {
    f = new Intl.NumberFormat(key, { maximumFractionDigits: 0 });
    FORMATTER_CACHE.set(key, f);
  }
  return f;
}

function getCompactFormatter(locale) {
  const key = resolveLocale(locale);
  let f = COMPACT_FORMATTER_CACHE.get(key);
  if (!f) {
    f = new Intl.NumberFormat(key, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
    COMPACT_FORMATTER_CACHE.set(key, f);
  }
  return f;
}

export function formatVnd(value, locale) {
  if (value == null) return "0 ₫";
  return `${getFormatter(locale).format(value)} ₫`;
}

export function formatVndCompact(value, locale) {
  if (value == null) return "0 ₫";
  if (Math.abs(value) < 1_000_000) return formatVnd(value, locale);
  return `${getCompactFormatter(locale).format(value)} ₫`;
}

export function formatPercent(value, options = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = options.signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDelta(value) {
  if (value == null || Number.isNaN(value)) return null;
  const positive = value >= 0;
  return {
    label: `${positive ? "+" : ""}${value.toFixed(1)}%`,
    positive,
  };
}
