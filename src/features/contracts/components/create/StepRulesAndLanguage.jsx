import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Step 4 of the create-contract wizard — legal fields required by the
 * Vietnamese Housing Law 2023 + Residence Law 2020 + Civil Code 2015 bundle.
 *
 * Fields:
 *   - Tenant type (VIETNAMESE / FOREIGNER) — drives CCCD vs Passport path.
 *   - Foreign passport block (conditional).
 *   - Contract language (VI, VI+EN, VI+JA).
 *   - House-rule policies: pets, smoking, subletting, overnight visitors.
 *   - Temp-residence registration responsibility (Luật Cư trú 2020).
 *   - Personal income tax responsibility.
 *   - Land certificate (GCN) number + issue date + issuer.
 *   - Handover meter readings (record-only, not billed).
 *   - Co-tenants (người ở cùng) for temp-residence registration.
 */
export default function StepRulesAndLanguage({ form, update, setForm, errors = {} }) {
  const { t } = useTranslation("common");
  const onChange = (key) => update(key);

  const onCoTenantChange = (index, field) => (e) => {
    const value = e?.target?.value ?? "";
    setForm((prev) => {
      const arr = [...(prev.coTenants || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, coTenants: arr };
    });
  };

  const addCoTenant = () => {
    setForm((prev) => ({
      ...prev,
      coTenants: [
        ...(prev.coTenants || []),
        {
          fullName: "",
          identityNumber: "",
          identityType: "CCCD",
          dateOfBirth: "",
          gender: "",
          nationality: "",
          relationship: "",
          phoneNumber: "",
        },
      ],
    }));
  };

  const removeCoTenant = (index) => {
    setForm((prev) => ({
      ...prev,
      coTenants: (prev.coTenants || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* ---- Contract language ----
          Tenant type + passport fields + nationality picker moved to Step 1
          so the wizard asks the right identity shape up front. Step 4
          keeps only the contract-language selector (VI / VI_EN / VI_JA).
          Nationality is authoritatively picked in Step 1 via the same
          HCM-ESB-backed useCountries hook — no override needed here. */}
      <section className="space-y-3 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900">{t("contracts.step4.contractLang")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("contracts.step4.contractLang")}</label>
            <select
              value={form.contractLanguage}
              onChange={onChange("contractLanguage")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="VI">{t("contracts.step4.langVi")}</option>
              <option value="VI_EN">{t("contracts.step4.langViEn")}</option>
              <option value="VI_JA">{t("contracts.step4.langViJa")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* ---- House rule policies ---- */}
      <section className="space-y-3 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900">{t("contracts.step4.rulesTitle")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={t("contracts.step4.pet")}>
            <select value={form.petPolicy} onChange={onChange("petPolicy")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="ALLOWED">{t("contracts.step4.petAllowed")}</option>
              <option value="NOT_ALLOWED">{t("contracts.step4.petNotAllowed")}</option>
              <option value="ALLOWED_WITH_APPROVAL">{t("contracts.step4.petWithApproval")}</option>
            </select>
          </Field>
          <Field label={t("contracts.step4.smoking")}>
            <select value={form.smokingPolicy} onChange={onChange("smokingPolicy")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="OUTDOOR_ONLY">{t("contracts.step4.smokingOutdoor")}</option>
              <option value="ALLOWED">{t("contracts.step4.smokingAllowed")}</option>
              <option value="NOT_ALLOWED">{t("contracts.step4.smokingNotAllowed")}</option>
            </select>
          </Field>
          <Field label={t("contracts.step4.sublease")}>
            <select value={form.subleasePolicy} onChange={onChange("subleasePolicy")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="NOT_ALLOWED">{t("contracts.step4.subleaseNotAllowed")}</option>
              <option value="ALLOWED_WITH_WRITTEN_APPROVAL">{t("contracts.step4.subleaseWritten")}</option>
            </select>
          </Field>
          <Field label={t("contracts.step4.visitor")}>
            <select value={form.visitorPolicy} onChange={onChange("visitorPolicy")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="UNRESTRICTED">{t("contracts.step4.visitorUnrestricted")}</option>
              <option value="OVERNIGHT_NEEDS_APPROVAL">{t("contracts.step4.visitorNotice")}</option>
              <option value="NO_OVERNIGHT">{t("contracts.step4.visitorNoOvernight")}</option>
            </select>
          </Field>
          <Field label={t("contracts.step4.tempRes")}>
            <select value={form.tempResidenceRegisterBy} onChange={onChange("tempResidenceRegisterBy")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="LANDLORD">{t("contracts.step4.tempResLandlord")}</option>
              <option value="TENANT">{t("contracts.step4.tempResTenant")}</option>
            </select>
          </Field>
          <Field label={t("contracts.step4.tax")}>
            <select value={form.taxResponsibility} onChange={onChange("taxResponsibility")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="LANDLORD">{t("contracts.step4.taxLandlord")}</option>
              <option value="TENANT">{t("contracts.step4.taxTenant")}</option>
              <option value="SHARED">{t("contracts.step4.taxShared")}</option>
            </select>
          </Field>
        </div>
      </section>

      {/* House legal info hint removed per product feedback 2026-04-23:
          the warning banner on Step 2 (StepHouseAndMoney) already tells
          landlord what's missing and where to fix it, so this second
          hint on Step 4 is redundant and clutters the page. The i18n
          keys `contracts.step4.houseLegalTitle` and `houseLegalDesc`
          stay in the locale files in case we want to re-introduce a
          more prominent surface later. */}

      {/* ---- Meter readings ---- */}
      <section className="space-y-3 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900">{t("contracts.step4.meterTitle")}</h3>
        <p className="text-xs text-gray-500"
           dangerouslySetInnerHTML={{ __html: t("contracts.step4.meterDesc") }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label={t("contracts.step4.meterElectric")}>
            <input type="number" min="0" value={form.meterElectric} onChange={onChange("meterElectric")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </Field>
          <Field label={t("contracts.step4.meterWater")}>
            <input type="number" min="0" value={form.meterWater} onChange={onChange("meterWater")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </Field>
          <Field label={t("contracts.step4.meterNote")}>
            <input type="text" value={form.meterNote} onChange={onChange("meterNote")}
              placeholder={t("contracts.step4.meterNotePlaceholder")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </Field>
        </div>
      </section>

      {/* ---- Co-tenants ---- */}
      <section className="space-y-3 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{t("contracts.step4.coTenantsTitle")}</h3>
          <button type="button" onClick={addCoTenant}
            className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-1">
            <Plus className="w-3 h-3" /> {t("actions.add")}
          </button>
        </div>
        {(form.coTenants || []).length === 0 && (
          <p className="text-xs text-gray-500 italic">{t("contracts.step4.coTenantsEmpty")}</p>
        )}
        {(form.coTenants || []).map((c, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-gray-50 rounded border border-gray-200">
            <input placeholder={t("contracts.step4.coTenantName")} value={c.fullName || ""} onChange={onCoTenantChange(i, "fullName")}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm md:col-span-2"/>
            <select value={c.identityType || "CCCD"} onChange={onCoTenantChange(i, "identityType")}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm">
              <option value="CCCD">{t("contracts.step4.idKindCccd")}</option>
              <option value="PASSPORT">{t("contracts.step4.idKindPassport")}</option>
            </select>
            <input placeholder={t("contracts.step4.coTenantIdNo")} value={c.identityNumber || ""} onChange={onCoTenantChange(i, "identityNumber")}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm uppercase"/>
            <CoTenantRelationPicker
              value={c.relationship || ""}
              onChange={onCoTenantChange(i, "relationship")}
              t={t}
            />
            <div className="flex items-center gap-1">
              <input placeholder={t("contracts.step4.coTenantPhone")} value={c.phoneNumber || ""} onChange={onCoTenantChange(i, "phoneNumber")}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1"/>
              <button type="button" onClick={() => removeCoTenant(i)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded" title={t("actions.delete")}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

// Preset relationship values + "other" free-text fallback. Values stored in
// English so the BE's ContractHtmlBuilder.translateRelationship() can map
// them to the contract language at render time (Friend → 友人, Family → 家族…).
const RELATION_PRESETS = ["Friend", "Colleague", "Family", "Spouse", "Child", "Parent", "Sibling", "Roommate"];

function CoTenantRelationPicker({ value, onChange, t }) {
  const isPreset = RELATION_PRESETS.includes(value);
  // Keep the select in "other" mode when the user typed a custom value so the
  // text input stays visible; selecting a preset collapses it back.
  const selectValue = value === "" ? "" : isPreset ? value : "__OTHER__";
  return (
    <div className="flex items-center gap-1">
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__OTHER__") onChange({ target: { value: "" } });
          else onChange({ target: { value: v } });
        }}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
      >
        <option value="">— {t("contracts.step4.coTenantRelation")} —</option>
        {RELATION_PRESETS.map((r) => (
          <option key={r} value={r}>
            {t("contracts.step4.relation" + r, { defaultValue: r })}
          </option>
        ))}
        <option value="__OTHER__">{t("contracts.step4.relationOther", { defaultValue: "Khác (nhập tay)" })}</option>
      </select>
      {selectValue === "__OTHER__" && (
        <input
          placeholder={t("contracts.step4.coTenantRelation")}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-0"
        />
      )}
    </div>
  );
}
