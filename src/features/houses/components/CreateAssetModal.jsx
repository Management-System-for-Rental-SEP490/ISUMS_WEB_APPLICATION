import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Save, Shuffle, ImagePlus } from "lucide-react";
import { LoadingSpinner } from "../../../components/shared/Loading";
import { Select, InputNumber } from "antd";
import { toast } from "react-toastify";
import {
  getAssetCategories,
  createAsset,
  uploadAssetImages,
} from "../api/houses.api";
import { managerConfirmAsset } from "../../assets/api/assets.api";
import MultiLangInput from "../../../components/shared/i18n/MultiLangInput";

const pickPrimary = (map) => {
  if (!map || typeof map !== "object") return "";
  const src = map._source;
  if (src && typeof map[src] === "string" && map[src].trim()) return map[src];
  for (const [k, v] of Object.entries(map)) {
    if (k === "_source" || k === "_auto") continue;
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
};

const inp =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";
const lbl =
  "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

export default function CreateAssetModal({
  houseId,
  functionAreaId,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation("common");
  const [categories, setCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [form, setForm] = useState({
    categoryId: "",
    displayName: {},
    serialNumber: "",
    conditionPercent: 100,
    status: "IN_USE",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const assetStatusOptions = [
    { value: "IN_USE",       label: t("houses.assetStatus.IN_USE")       },
    { value: "UNDER_REPAIR", label: t("houses.assetStatus.UNDER_REPAIR") },
    { value: "BROKEN",       label: t("houses.assetStatus.BROKEN")       },
  ];

  useEffect(() => {
    getAssetCategories()
      .then(setCategories)
      .catch(() => toast.error(t("houses.createAsset.catsLoadError")))
      .finally(() => setCatsLoading(false));
  }, []);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => { URL.revokeObjectURL(p[i]); return p.filter((_, idx) => idx !== i); });
  };

  const generateSerial = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const seg = (len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setField("serialNumber", `${seg(3)}-${seg(4)}-${seg(4)}-${seg(4)}`);
  };

  const setField = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.categoryId)                       e.categoryId  = t("houses.createAsset.validation.category");
    if (!pickPrimary(form.displayName).trim())  e.displayName = t("houses.createAsset.validation.name");
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        houseId,
        functionAreaId,
        categoryId: form.categoryId,
        displayName: form.displayName,
        serialNumber: form.serialNumber.trim() || undefined,
        conditionPercent: form.conditionPercent,
        status: form.status,
        assetImages: [],
      };
      const created = await createAsset(payload);
      if (created?.id) {
        await managerConfirmAsset(created.id, "IN_USE");
        if (images.length > 0) {
          await uploadAssetImages(created.id, images);
        }
      }
      toast.success(t("houses.createAsset.successToast"));
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.message ?? t("houses.createAsset.failToast"));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {t("houses.createAsset.title")}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className={lbl}>
              {t("houses.createAsset.categoryLabel")} <span className="text-red-500 normal-case">*</span>
            </label>
            <Select
              className="w-full"
              placeholder={t("houses.createAsset.categoryPlaceholder")}
              value={form.categoryId || undefined}
              onChange={(v) => setField("categoryId", v)}
              loading={catsLoading}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              status={errors.categoryId ? "error" : ""}
              getPopupContainer={(trigger) => trigger.parentElement}
            />
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <MultiLangInput
              value={form.displayName}
              onChange={(v) => setField("displayName", v)}
              label={t("houses.createAsset.nameLabel")}
              placeholder={t("houses.createAsset.namePlaceholder")}
              resourceType="asset-item.displayName"
              intent="STAFF_INTERNAL"
              isRequired
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>
            )}
          </div>

          <div>
            <label className={lbl}>{t("houses.createAsset.serialLabel")}</label>
            <div className="relative">
              <input
                value={form.serialNumber}
                onChange={(e) => setField("serialNumber", e.target.value)}
                placeholder="VD: A7X-29KQ-M4RT-88NL"
                className={`${inp} pr-10 font-mono`}
              />
              <button
                type="button"
                onClick={generateSerial}
                title={t("houses.createAsset.randomSerial")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t("houses.createAsset.conditionLabel")}</label>
              <InputNumber
                className="w-full"
                min={0}
                max={100}
                value={form.conditionPercent}
                onChange={(v) => setField("conditionPercent", v ?? 100)}
                suffix="%"
              />
            </div>
          </div>

          <div>
            <label className={lbl}>
              {t("houses.createAsset.imagesLabel")} <span className="normal-case font-normal text-slate-400">{t("houses.createAsset.imagesMax")}</span>
            </label>
            {images.length < 5 && (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition"
                style={{ background: "#EAF4F0", color: "#3bb582", border: "1px solid #C4DED5" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#d4ede3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#EAF4F0"; }}
              >
                <ImagePlus className="w-4 h-4" />
                {t("houses.createAsset.chooseFiles")}
                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              </label>
            )}
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            {t("actions.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            {submitting ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            {submitting ? t("houses.createAsset.saving") : t("houses.createAsset.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

