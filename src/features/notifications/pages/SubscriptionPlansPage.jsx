import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Plus, X, Pencil, Power, RefreshCcw, Star } from "lucide-react";
import { LoadingSpinner } from "../../../components/shared/Loading";
import MultiLangInput from "../../../components/shared/i18n/MultiLangInput";
import { useAutoTranslate } from "../../../hooks/useAutoTranslate";
import {
  listAllPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
} from "../api/plans.api";

/**
 * Landlord / admin page — manage the PREMIUM subscription catalogue
 * shown to tenants. Each row is one plan (price + duration_days +
 * monthly quotas). Deactivation flips {@code is_active=false} rather
 * than deleting so payment intents that still reference the row stay
 * valid.
 */

function parseTranslations(json) {
  if (!json) return { vi: "", en: "", ja: "" };
  try {
    const parsed = JSON.parse(json);
    return { vi: parsed.vi ?? "", en: parsed.en ?? "", ja: parsed.ja ?? "" };
  } catch {
    return { vi: json, en: "", ja: "" };
  }
}

function pickName(translations, locale) {
  const map = parseTranslations(translations);
  const short = (locale || "vi").slice(0, 2);
  return map[short] || map.vi || map.en || "";
}

function formatVnd(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

function describeDuration(days) {
  if (days % 365 === 0) return `${days / 365} năm`;
  if (days % 30 === 0)  return `${days / 30} tháng`;
  if (days % 7 === 0)   return `${days / 7} tuần`;
  return `${days} ngày`;
}

const EMPTY_FORM = {
  code: "",
  durationDays: 30,
  priceVnd: 19000,
  voiceQuotaMonthly: 100,
  smsQuotaMonthly: 200,
  sortOrder: 0,
  isActive: true,
  isFeatured: false,
  // TranslationMap shape — same convention as houses/issues elsewhere.
  // FE-only keys (_source, _auto) get stripped before serialise to BE.
  nameMap: { vi: "", en: "", ja: "" },
};

/** Strip FE-only metadata keys before persisting to BE. */
function pickLocaleKeys(map) {
  if (!map) return {};
  return Object.fromEntries(
    Object.entries(map).filter(([k]) => !k.startsWith("_"))
  );
}

/** Returns the locales we still need to fill (empty string after trim). */
function missingLocales(map) {
  const clean = pickLocaleKeys(map);
  return ["vi", "en", "ja"].filter((c) => !clean[c] || !String(clean[c]).trim());
}

function PlanFormModal({ initial, onClose, onSaved }) {
  const { t, i18n } = useTranslation("common");
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { translate } = useAutoTranslate();
  const isEdit = !!initial.id;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.durationDays || form.priceVnd == null) {
      toast.error("Vui lòng điền code, duration, price.");
      return;
    }
    setSaving(true);
    try {
      // Auto-translate missing locales right before save. The source is
      // either the user's currently chosen sourceLocale (auto-mode) or
      // the system UI language (fallback). MultiLangInput already handles
      // the manual "Translate now" click; this guards against the user
      // hitting Save while one of the three fields is still empty.
      let nameMap = pickLocaleKeys(form.nameMap);
      const missing = missingLocales(nameMap);
      const declaredSource = form.nameMap?._source;
      const fallbackSource = (i18n?.resolvedLanguage || "vi").slice(0, 2);
      const source = (declaredSource && nameMap[declaredSource])
              ? declaredSource
              // pick whichever locale the user actually filled, preferring
              // the system language so a JP-locale operator's typed text
              // becomes the canonical version.
              : (nameMap[fallbackSource] ? fallbackSource
                : Object.keys(nameMap).find((k) => nameMap[k]?.trim()));
      if (missing.length > 0 && source && nameMap[source]) {
        try {
          const result = await translate({
            text: nameMap[source],
            sourceLanguage: source,
            targetLanguages: missing,
            resourceType: "subscription.plan_name",
            intent: "CUSTOMER_FACING_UI",
          });
          for (const code of missing) {
            const txt = result?.translations?.[code];
            if (txt) nameMap[code] = txt;
          }
        } catch (translationErr) {
          // Surface the failure but keep saving — landlord can edit
          // missing locales later. Non-fatal.
          console.warn("[Plans] Auto-translate failed:", translationErr?.message);
          toast.warning("Không dịch được tự động — đã lưu với các trường còn trống.");
        }
      }

      const payload = {
        code: form.code.trim(),
        nameTranslations: JSON.stringify({
          vi: nameMap.vi || "",
          en: nameMap.en || "",
          ja: nameMap.ja || "",
        }),
        durationDays:       Number(form.durationDays),
        priceVnd:           Number(form.priceVnd),
        voiceQuotaMonthly:  Number(form.voiceQuotaMonthly),
        smsQuotaMonthly:    Number(form.smsQuotaMonthly),
        sortOrder:          Number(form.sortOrder),
        isActive:           !!form.isActive,
        isFeatured:         !!form.isFeatured,
      };
      const saved = isEdit
        ? await updatePlan(initial.id, payload)
        : await createPlan(payload);
      toast.success(isEdit ? "Đã cập nhật gói" : "Đã tạo gói mới");
      onSaved(saved);
    } catch (err) {
      toast.error(err.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center"
         style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-xl rounded-2xl p-6 bg-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isEdit ? "Sửa gói đăng ký" : "Tạo gói đăng ký mới"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Multi-language plan name — uses the shared MultiLangInput
              component (auto-translate via AWS Translate when the
              landlord doesn't fill all 3 locales, manual override
              available by toggling the switch). Source language
              defaults to the operator's UI locale so a JP-speaking
              landlord types Japanese once and gets vi+en for free. */}
          <div className="mb-3">
            <MultiLangInput
              value={form.nameMap}
              onChange={(map) => set("nameMap", map)}
              label="Tên hiển thị (đa ngôn ngữ)"
              placeholder="Ví dụ: 3 tháng"
              resourceType="subscription.plan_name"
              intent="CUSTOMER_FACING_UI"
              isRequired
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code (immutable)">
              <input type="text" value={form.code}
                     disabled={isEdit}
                     onChange={(e) => set("code", e.target.value.toUpperCase())}
                     placeholder="PREMIUM_1M"
                     className="w-full px-3 py-2 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500" />
            </Field>
            <Field label="Thứ tự hiển thị">
              <input type="number" value={form.sortOrder}
                     onChange={(e) => set("sortOrder", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </Field>
            <Field label="Thời hạn (ngày)">
              <input type="number" min="1" max="3650" value={form.durationDays}
                     onChange={(e) => set("durationDays", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg border border-gray-200" />
              <p className="text-xs text-gray-500 mt-1">{describeDuration(Number(form.durationDays || 0))}</p>
            </Field>
            <Field label="Giá (VND)">
              <input type="number" min="0" step="1000" value={form.priceVnd}
                     onChange={(e) => set("priceVnd", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg border border-gray-200" />
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatVnd(Math.round(form.priceVnd / Math.max(1, form.durationDays / 30)))} / tháng
              </p>
            </Field>
            <Field label="Quota voice / tháng">
              <input type="number" min="0" value={form.voiceQuotaMonthly}
                     onChange={(e) => set("voiceQuotaMonthly", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </Field>
            <Field label="Quota SMS / tháng">
              <input type="number" min="0" value={form.smsQuotaMonthly}
                     onChange={(e) => set("smsQuotaMonthly", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </Field>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isActive}
                     onChange={(e) => set("isActive", e.target.checked)} />
              Đang bán
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isFeatured}
                     onChange={(e) => set("isFeatured", e.target.checked)} />
              Nổi bật (hiển thị highlight)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold">
              Hủy
            </button>
            <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              {saving ? "Đang lưu..." : (isEdit ? "Cập nhật" : "Tạo gói")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SubscriptionPlansPage() {
  const { i18n } = useTranslation("common");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);  // null | EMPTY_FORM | { ...plan }

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách gói.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const sorted = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [plans]
  );

  const onCreate = () => setEditing({ ...EMPTY_FORM });

  const onEdit = (plan) => setEditing({
    ...EMPTY_FORM,
    ...plan,
    nameMap: {
      ...parseTranslations(plan.nameTranslations),
      // Mark all three as user-confirmed so the auto-translate dirty
      // tracking starts clean; saving without edits won't trigger any
      // AWS calls.
      _source: undefined,
      _auto: undefined,
    },
  });

  const onDeactivate = async (plan) => {
    if (!window.confirm(`Tắt bán gói "${plan.code}"?`)) return;
    try {
      await deactivatePlan(plan.id);
      toast.success("Đã tắt bán gói");
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            Gói đăng ký PREMIUM
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>
            Quản lý catalogue gói voice/SMS bán cho tenant. Code không đổi sau khi tạo.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll}
                  className="px-4 py-2.5 rounded-full text-sm border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-2">
            <RefreshCcw size={14} /> Làm mới
          </button>
          <button onClick={onCreate}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 shadow"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
            <Plus size={14} /> Thêm gói
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 bg-white border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl px-8 py-16 bg-white border border-gray-200 flex items-center justify-center">
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách gói..." />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-600">
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Tên hiển thị</th>
                <th className="text-left px-4 py-3">Thời hạn</th>
                <th className="text-right px-4 py-3">Giá</th>
                <th className="text-right px-4 py-3">Quota voice / SMS</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3 w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    Chưa có gói nào — bấm "Thêm gói" để tạo.
                  </td>
                </tr>
              ) : sorted.map((plan, idx) => (
                <tr key={plan.id} className="border-t border-gray-100 hover:bg-amber-50/40 transition">
                  <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{plan.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {plan.isFeatured ? <Star size={14} className="text-amber-500 fill-amber-500" /> : null}
                      <span>{pickName(plan.nameTranslations, i18n?.resolvedLanguage) || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{plan.durationDays} ngày <span className="text-xs text-gray-500">({describeDuration(plan.durationDays)})</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVnd(plan.priceVnd)}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600">
                    {plan.voiceQuotaMonthly} / {plan.smsQuotaMonthly}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: plan.isActive ? "#D1FAE5" : "#F3F4F6",
                            color:      plan.isActive ? "#065F46" : "#6B7280",
                          }}>
                      {plan.isActive ? "ĐANG BÁN" : "TẮT"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => onEdit(plan)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <Pencil size={14} />
                      </button>
                      {plan.isActive && (
                        <button onClick={() => onDeactivate(plan)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                          <Power size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PlanFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
