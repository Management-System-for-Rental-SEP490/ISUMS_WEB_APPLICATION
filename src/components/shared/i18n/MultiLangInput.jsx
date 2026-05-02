import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Input,
  Textarea,
  Tabs,
  Tab,
  Switch,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { useAutoTranslate } from "../../../hooks/useAutoTranslate";

const SUPPORTED = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

/**
 * MultiLangInput — input field that accepts content in vi / en / ja.
 *
 * Two display modes:
 *   - autoTranslate=true (default): single input + source-language picker.
 *     Backend fills the other locales when the entity is saved.
 *   - autoTranslate=false: three tabs, one per locale; user fills any
 *     subset, missing ones are auto-translated on save.
 *
 * Value shape: { vi: string, en: string, ja: string, _source: string, _auto: string }.
 *
 * Props:
 *   value           — current TranslationMap-shaped object (may be null/empty).
 *   onChange(map)   — receives the updated map.
 *   label           — visible label.
 *   placeholder     — placeholder text per input.
 *   multiline       — render Textarea instead of Input.
 *   defaultAutoTranslate — initial state of the toggle (default true).
 *   resourceType    — passed through to /api/ai/translate for policy lookup
 *                     (e.g. "notification.title").
 *   intent          — translation intent (default CUSTOMER_FACING_UI).
 *   isRequired      — at least one locale must be filled.
 *   onTranslate     — called when user clicks "Translate now" with sync result.
 */
export default function MultiLangInput({
  value,
  onChange,
  label,
  placeholder,
  multiline = false,
  defaultAutoTranslate = true,
  resourceType,
  intent = "CUSTOMER_FACING_UI",
  isRequired = false,
  onTranslate,
}) {
  const { i18n, t } = useTranslation("common");
  const [autoMode, setAutoMode] = useState(defaultAutoTranslate);
  const [sourceLocale, setSourceLocale] = useState(
    () => value?._source || (SUPPORTED.find((l) => l.code === i18n.language)?.code ?? "vi"),
  );
  const { translate, loading: translating, error: translateError } = useAutoTranslate();

  const safeValue = useMemo(() => value || {}, [value]);
  const autoSet = useMemo(() => {
    const raw = safeValue._auto || "";
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
  }, [safeValue._auto]);

  // Keep _source in sync if user edits the source field while in autoMode.
  useEffect(() => {
    if (autoMode && safeValue._source !== sourceLocale) {
      onChange({ ...safeValue, _source: sourceLocale });
    }
  }, [autoMode, sourceLocale]); // eslint-disable-line react-hooks/exhaustive-deps

  function setLocale(code, text) {
    const next = { ...safeValue, [code]: text };
    // editing a locale removes it from the auto list
    if (autoSet.has(code)) {
      const remaining = [...autoSet].filter((c) => c !== code);
      next._auto = remaining.join(",");
      if (!next._auto) delete next._auto;
    }
    if (!text || !text.trim()) {
      delete next[code];
    }
    onChange(next);
  }

  async function translateNow() {
    const sourceText = safeValue[sourceLocale];
    if (!sourceText || !sourceText.trim()) return;
    const targets = SUPPORTED.map((l) => l.code).filter((c) => c !== sourceLocale);
    try {
      const result = await translate({
        text: sourceText,
        sourceLanguage: sourceLocale,
        targetLanguages: targets,
        resourceType,
        intent,
      });
      const next = { ...safeValue, _source: sourceLocale };
      const newAuto = new Set(autoSet);
      for (const target of targets) {
        const t = result?.translations?.[target];
        if (t && (!safeValue[target] || autoSet.has(target))) {
          next[target] = t;
          newAuto.add(target);
        }
      }
      if (newAuto.size > 0) next._auto = [...newAuto].join(",");
      onChange(next);
      onTranslate?.(result);
    } catch {
      // swallow — error surfaced via translateError
    }
  }

  const Field = multiline ? Textarea : Input;

  // Header is shared between auto + manual modes. Production layout:
  //   row 1 → label (with * if required) on the left
  //   row 1 → tiny "auto" pill toggle on the right (icon + on/off only)
  // The previous implementation put a long Switch label inline next to
  // the field label, which collided when the field label wrapped.
  const Header = (
    <div className="flex items-start justify-between gap-3 min-w-0">
      <span className="text-sm font-medium leading-5 break-words">
        {label}
        {isRequired ? <span className="text-danger ml-1">*</span> : null}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <span className="text-xs text-default-500 whitespace-nowrap">
          {t("i18nInput.autoTranslate", { defaultValue: "Auto-translate" })}
        </span>
        <Switch
          size="sm"
          isSelected={autoMode}
          onValueChange={setAutoMode}
          aria-label={t("i18nInput.autoTranslate", { defaultValue: "Auto-translate" })}
        />
      </div>
    </div>
  );

  if (autoMode) {
    return (
      <div className="flex flex-col gap-2">
        {Header}
        <div className="flex gap-2 items-start">
          <Select
            className="w-44 flex-shrink-0"
            selectedKeys={new Set([sourceLocale])}
            aria-label={t("i18nInput.sourceLanguage", { defaultValue: "Source language" })}
            onSelectionChange={(keys) => {
              const code = [...keys][0];
              if (code) setSourceLocale(code);
            }}
          >
            {SUPPORTED.map((l) => (
              <SelectItem key={l.code}>
                {l.flag} {l.label}
              </SelectItem>
            ))}
          </Select>
          <Field
            value={safeValue[sourceLocale] || ""}
            onValueChange={(text) => setLocale(sourceLocale, text)}
            placeholder={placeholder}
            isRequired={isRequired}
            className="flex-1 min-w-0"
            minRows={multiline ? 3 : undefined}
          />
        </div>
        <div className="flex justify-between text-xs text-default-500 gap-3">
          <span className="flex-1 min-w-0">
            {t("i18nInput.willAutoFill", {
              defaultValue: "Other languages auto-translated on save",
            })}
          </span>
          <button
            type="button"
            className="text-primary disabled:opacity-50 flex-shrink-0"
            onClick={translateNow}
            disabled={translating || !safeValue[sourceLocale]}
          >
            {translating
              ? t("i18nInput.translating", { defaultValue: "Translating..." })
              : t("i18nInput.translateNow", { defaultValue: "Translate now" })}
          </button>
        </div>
        {translateError ? (
          <span className="text-xs text-danger">{translateError}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Header}
      <Tabs aria-label={t("i18nInput.editPerLanguage", { defaultValue: "Edit per language" })}>
        {SUPPORTED.map((l) => (
          <Tab
            key={l.code}
            title={
              <span className="flex items-center gap-1">
                {l.flag} {l.label}
                {autoSet.has(l.code) ? (
                  <Tooltip
                    content={t("i18nInput.autoTooltip", {
                      defaultValue: "Translated automatically",
                    })}
                  >
                    <span className="text-xs bg-warning-100 text-warning-700 rounded px-1">
                      {t("i18nInput.autoBadge", { defaultValue: "auto" })}
                    </span>
                  </Tooltip>
                ) : null}
              </span>
            }
          >
            <Field
              value={safeValue[l.code] || ""}
              onValueChange={(text) => setLocale(l.code, text)}
              placeholder={placeholder}
              minRows={multiline ? 3 : undefined}
            />
          </Tab>
        ))}
      </Tabs>
      <span className="text-xs text-default-500">
        {t("i18nInput.emptyWillAutoFill", {
          defaultValue: "Empty fields will be filled automatically on save",
        })}
      </span>
    </div>
  );
}
