import { useTranslation } from "react-i18next";
import { Tooltip } from "@heroui/react";

const RESERVED_KEYS = new Set(["_source", "_auto"]);

/**
 * MultiLangText — read-only display of a TranslationMap-shaped value.
 * Picks the active i18n locale's text, falls back to the source locale,
 * then any non-empty locale. Renders a small "auto" badge when the value
 * for the current locale was machine-translated.
 *
 * Props:
 *   value      — TranslationMap-shaped object: { vi, en, ja, _source, _auto } or string.
 *   fallback   — used when {value} is empty (default: "—").
 *   showAutoBadge — render the auto-translation badge (default true).
 *   className  — wrapper class.
 *   tag        — element tag, default "span".
 */
export default function MultiLangText({
  value,
  fallback = "—",
  showAutoBadge = true,
  className,
  tag: Tag = "span",
}) {
  const { i18n, t } = useTranslation("common");

  if (value == null) return <Tag className={className}>{fallback}</Tag>;
  if (typeof value === "string") {
    return <Tag className={className}>{value || fallback}</Tag>;
  }

  const lang = i18n.language || "vi";
  const direct = value[lang];
  const source = value._source ? value[value._source] : null;
  const anyValue = Object.entries(value)
    .filter(([k, v]) => !RESERVED_KEYS.has(k) && typeof v === "string" && v.trim())
    .map(([, v]) => v)[0];
  const resolved = (direct && direct.trim()) || source || anyValue || "";

  const autoSet = new Set(
    (value._auto || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const isAuto = autoSet.has(lang) && direct && direct.trim();

  return (
    <Tag className={className}>
      {resolved || fallback}
      {showAutoBadge && isAuto ? (
        <Tooltip
          content={t("i18nInput.autoTooltip", {
            defaultValue: "Translated automatically",
          })}
        >
          <span className="ml-1 inline-block text-[10px] bg-warning-100 text-warning-700 rounded px-1">
            {t("i18nInput.autoBadge", { defaultValue: "auto" })}
          </span>
        </Tooltip>
      ) : null}
    </Tag>
  );
}
