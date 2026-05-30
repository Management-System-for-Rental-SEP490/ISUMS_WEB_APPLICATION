import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { updateHouseTranslations } from "../api/houses.api";

const LANGS = ["vi", "en", "ja"];
const LANG_LABELS = { vi: "🇻🇳 Tiếng Việt", en: "🇬🇧 English", ja: "🇯🇵 日本語" };
const LANG_BG    = { vi: "bg-emerald-50 border-emerald-200", en: "bg-blue-50 border-blue-200", ja: "bg-rose-50 border-rose-200" };
const LANG_TEXT  = { vi: "text-emerald-700", en: "text-blue-700", ja: "text-rose-700" };

const FIELDS = [
  { key: "nameTranslations",        labelKey: "houses.translations.fieldName",        multiline: false },
  { key: "addressTranslations",     labelKey: "houses.translations.fieldAddress",     multiline: false },
  { key: "wardTranslations",        labelKey: "houses.translations.fieldWard",        multiline: false },
  { key: "cityTranslations",        labelKey: "houses.translations.fieldCity",        multiline: false },
  { key: "descriptionTranslations", labelKey: "houses.translations.fieldDescription", multiline: true  },
];

function buildInitialEdits(house) {
  const edits = {};
  FIELDS.forEach(({ key }) => { edits[key] = { ...(house[key] ?? {}) }; });
  return edits;
}

/**
 * @param {{ house: Object, onClose: () => void, onDone: () => void }} props
 */
export default function HouseTranslationReview({ house, onClose, onDone }) {
  const { t } = useTranslation("common");
  const [edits, setEdits] = useState(() => buildInitialEdits(house));
  const [editingCell, setEditingCell] = useState(null); // "fieldKey:lang"
  const [saving, setSaving] = useState(false);

  const cellKey = (field, lang) => `${field}:${lang}`;

  const handleChange = (field, lang, value) => {
    setEdits((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHouseTranslations(house.id, edits);
      toast.success(t("houses.translations.saveSuccess"));
      onDone();
    } catch (e) {
      toast.error(e?.message ?? t("houses.translations.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t("houses.translations.title")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t("houses.translations.subtitle")}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lang header */}
        <div className="grid grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
          {LANGS.map((lang) => (
            <div key={lang} className={`px-6 py-3 flex items-center justify-center gap-2 bg-white`}>
              <span className={`text-xs font-bold uppercase tracking-wide ${LANG_TEXT[lang]}`}>
                {LANG_LABELS[lang]}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-auto flex-1">
          {FIELDS.map(({ key, labelKey, multiline }) => (
            <div key={key} className="border-b border-slate-100 last:border-0">
              {/* Field label row */}
              <div className="px-7 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {t(labelKey)}
                </span>
              </div>
              {/* 3 col content row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {LANGS.map((lang) => {
                  const ck = cellKey(key, lang);
                  const isEditing = editingCell === ck;
                  return (
                    <div key={lang} className="group relative px-5 py-4 min-h-[60px]">
                      {isEditing ? (
                        multiline ? (
                          <textarea
                            autoFocus
                            rows={4}
                            value={edits[key][lang] ?? ""}
                            onChange={(e) => handleChange(key, lang, e.target.value)}
                            className="w-full text-sm px-2.5 py-1.5 border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none bg-white"
                          />
                        ) : (
                          <input
                            autoFocus
                            value={edits[key][lang] ?? ""}
                            onChange={(e) => handleChange(key, lang, e.target.value)}
                            className="w-full text-sm px-2.5 py-1.5 border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white"
                          />
                        )
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap pr-6 leading-relaxed">
                          {edits[key][lang] || <span className="text-slate-300 italic">—</span>}
                        </p>
                      )}
                      {/* Edit / Confirm button */}
                      <button
                        onClick={() => setEditingCell(isEditing ? null : ck)}
                        className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition text-slate-400"
                      >
                        {isEditing
                          ? <Check className="w-3.5 h-3.5 text-teal-500" />
                          : <Pencil className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400">{t("houses.translations.editHint")}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition"
            >
              {t("houses.translations.skip")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-70 transition"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? t("houses.translations.saving") : t("houses.translations.save")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
