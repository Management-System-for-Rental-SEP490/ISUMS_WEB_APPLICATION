import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Save, X, Pencil } from "lucide-react";
import {
  updateContractFields,
  listCoTenants,
  addCoTenant,
  updateCoTenant,
  deleteCoTenant,
} from "../../api/contracts.api";

/**
 * Inline panel that lets the landlord/manager patch legal fields WITHOUT
 * regenerating the HTML. Fields here are the ones most commonly corrected
 * during PENDING_TENANT_REVIEW / CORRECTING (rent, deposit, policies,
 * passport info, co-tenants).
 *
 * All labels flow through i18n so the panel follows the manager's UI locale,
 * independent of the contract's own contract-language.
 */

const POLICY_OPTIONS = {
  petPolicy:                 ["ALLOWED", "NOT_ALLOWED", "ALLOWED_WITH_APPROVAL"],
  smokingPolicy:             ["OUTDOOR_ONLY", "ALLOWED", "NOT_ALLOWED"],
  subleasePolicy:            ["NOT_ALLOWED", "ALLOWED_WITH_WRITTEN_APPROVAL"],
  visitorPolicy:             ["UNRESTRICTED", "OVERNIGHT_NEEDS_APPROVAL", "NO_OVERNIGHT"],
  tempResidenceRegisterBy:   ["LANDLORD", "TENANT"],
  taxResponsibility:         ["LANDLORD", "TENANT", "SHARED"],
};

const RELATION_PRESETS = ["Friend", "Colleague", "Family", "Spouse", "Child", "Parent", "Sibling", "Roommate"];

function pickInitial(contract) {
  if (!contract) return {};
  const {
    rentAmount, depositAmount, payDate, lateDays, latePenaltyPercent,
    depositRefundDays, renewNoticeDays,
    petPolicy, smokingPolicy, subleasePolicy, visitorPolicy,
    tempResidenceRegisterBy, taxResponsibility,
    cccdNumber, passportNumber, nationality, visaType,
  } = contract;
  return {
    rentAmount: rentAmount ?? "", depositAmount: depositAmount ?? "",
    payDate: payDate ?? "", lateDays: lateDays ?? "",
    latePenaltyPercent: latePenaltyPercent ?? "",
    depositRefundDays: depositRefundDays ?? "", renewNoticeDays: renewNoticeDays ?? "",
    petPolicy: petPolicy ?? "", smokingPolicy: smokingPolicy ?? "",
    subleasePolicy: subleasePolicy ?? "", visitorPolicy: visitorPolicy ?? "",
    tempResidenceRegisterBy: tempResidenceRegisterBy ?? "",
    taxResponsibility: taxResponsibility ?? "",
    cccdNumber: cccdNumber ?? "", passportNumber: passportNumber ?? "",
    nationality: nationality ?? "", visaType: visaType ?? "",
  };
}

export default function ContractQuickEditPanel({ contract, onSaved }) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState(() => pickInitial(contract));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(pickInitial(contract));
    setDirty(false);
  }, [contract?.id]);

  if (!contract?.id) return null;
  const isForeigner = contract.tenantType === "FOREIGNER";

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const toNumOrNull = (v) => (v === "" || v == null ? null : Number(v));
  const toStrOrNull = (v) => (v == null || String(v).trim() === "" ? null : String(v).trim());

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        rentAmount: toNumOrNull(form.rentAmount),
        depositAmount: toNumOrNull(form.depositAmount),
        payDate: toNumOrNull(form.payDate),
        lateDays: toNumOrNull(form.lateDays),
        latePenaltyPercent: toNumOrNull(form.latePenaltyPercent),
        depositRefundDays: toNumOrNull(form.depositRefundDays),
        renewNoticeDays: toNumOrNull(form.renewNoticeDays),
        petPolicy: toStrOrNull(form.petPolicy),
        smokingPolicy: toStrOrNull(form.smokingPolicy),
        subleasePolicy: toStrOrNull(form.subleasePolicy),
        visitorPolicy: toStrOrNull(form.visitorPolicy),
        tempResidenceRegisterBy: toStrOrNull(form.tempResidenceRegisterBy),
        taxResponsibility: toStrOrNull(form.taxResponsibility),
        cccdNumber: toStrOrNull(form.cccdNumber),
        passportNumber: toStrOrNull(form.passportNumber),
        nationality: toStrOrNull(form.nationality),
        visaType: toStrOrNull(form.visaType),
      };
      await updateContractFields(contract.id, payload);
      toast.success(t("contracts.quickEdit.saveSuccess"));
      setDirty(false);
      onSaved?.();
    } catch (err) {
      const msg = err?.response?.status === 403
        ? t("contracts.quickEdit.forbidden")
        : err?.response?.data?.message || t("contracts.quickEdit.saveFail");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectCls = "w-full border border-slate-300 rounded px-2 py-1.5 text-sm";
  const inputCls = selectCls;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("contracts.quickEdit.title")}</h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? t("contracts.quickEdit.saving") : dirty ? t("contracts.quickEdit.saveChanges") : t("contracts.quickEdit.noChanges")}
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-500">{t("contracts.quickEdit.finance")}</legend>
        <Field label={t("contracts.quickEdit.rent")}>
          <input type="number" min="0" value={form.rentAmount} onChange={set("rentAmount")} className={inputCls} />
        </Field>
        <Field label={t("contracts.quickEdit.deposit")}>
          <input type="number" min="0" value={form.depositAmount} onChange={set("depositAmount")} className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label={t("contracts.quickEdit.payDay")}>
            <input type="number" min="1" max="31" value={form.payDate} onChange={set("payDate")} className={inputCls} />
          </Field>
          <Field label={t("contracts.quickEdit.graceDays")}>
            <input type="number" min="0" value={form.lateDays} onChange={set("lateDays")} className={inputCls} />
          </Field>
          <Field label={t("contracts.quickEdit.penaltyPct")}>
            <input type="number" min="0" max="100" value={form.latePenaltyPercent} onChange={set("latePenaltyPercent")} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t("contracts.quickEdit.refundDays")}>
            <input type="number" min="0" value={form.depositRefundDays} onChange={set("depositRefundDays")} className={inputCls} />
          </Field>
          <Field label={t("contracts.quickEdit.renewNoticeDays")}>
            <input type="number" min="0" value={form.renewNoticeDays} onChange={set("renewNoticeDays")} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-500">{t("contracts.quickEdit.rules")}</legend>
        {Object.entries(POLICY_OPTIONS).map(([field, values]) => (
          <Field key={field} label={t("contracts.summary." + field + "Label", { defaultValue: t("contracts.summary." + policyLabelKey(field)) })}>
            <select value={form[field]} onChange={set(field)} className={selectCls}>
              <option value="">—</option>
              {values.map((v) => (
                <option key={v} value={v}>{t(`contracts.summary.${field}.${v}`, { defaultValue: v })}</option>
              ))}
            </select>
          </Field>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-500">{t("contracts.quickEdit.identity")}</legend>
        {isForeigner ? (
          <>
            <Field label={t("contracts.summary.passport")}>
              <input value={form.passportNumber} onChange={set("passportNumber")} className={`${inputCls} uppercase`} />
            </Field>
            <Field label={t("contracts.summary.nationality")}>
              <input value={form.nationality} onChange={set("nationality")} className={inputCls} />
            </Field>
            <Field label={t("contracts.quickEdit.visaType")}>
              <input value={form.visaType} onChange={set("visaType")} className={inputCls} />
            </Field>
          </>
        ) : (
          <Field label={t("contracts.summary.cccd")}>
            <input value={form.cccdNumber} onChange={set("cccdNumber")} className={inputCls} maxLength={12} />
          </Field>
        )}
      </fieldset>

      {/* Co-tenants CRUD — list + inline add / edit / delete. Writes go
          directly to the BE co-tenants API; changes are independent of the
          patch-fields save above. */}
      <CoTenantsSection contractId={contract.id} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] italic text-slate-500"
           dangerouslySetInnerHTML={{ __html: t("contracts.quickEdit.houseFactsNote") }} />
      </div>
    </div>
  );
}

function policyLabelKey(field) {
  // Maps the raw BE field key to the short label key in contracts.summary.*.
  return {
    petPolicy: "pet",
    smokingPolicy: "smoking",
    subleasePolicy: "sublease",
    visitorPolicy: "visitor",
    tempResidenceRegisterBy: "tempRes",
    taxResponsibility: "taxResp",
  }[field] || field;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Co-tenants CRUD
// ─────────────────────────────────────────────────────────────────────────────

function CoTenantsSection({ contractId }) {
  const { t } = useTranslation("common");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listCoTenants(contractId);
      const arr = Array.isArray(data) ? data : [];
      if (arr.length === 0) {
         
        console.info("[QuickEditPanel] listCoTenants 0 rows contractId=", contractId, "raw=", data);
      }
      setList(arr);
    } catch (err) {
       
      console.error("[QuickEditPanel] listCoTenants failed:",
        err?.response?.status, err?.response?.data, err?.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [contractId]);

  const handleAdd = async (payload) => {
    try {
      await addCoTenant(contractId, payload);
      toast.success(t("contracts.quickEdit.coTenantAdded"));
      setAdding(false);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("contracts.quickEdit.coTenantSaveFail"));
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await updateCoTenant(contractId, id, payload);
      toast.success(t("contracts.quickEdit.coTenantSaved"));
      setEditingId(null);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("contracts.quickEdit.coTenantSaveFail"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("contracts.quickEdit.coTenantDeleteConfirm"))) return;
    try {
      await deleteCoTenant(contractId, id);
      toast.success(t("contracts.quickEdit.coTenantDeleted"));
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("contracts.quickEdit.coTenantDeleteFail"));
    }
  };

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="text-xs font-semibold text-slate-500">
          {t("contracts.quickEdit.coTenants", { count: list.length })}
        </legend>
        {!adding && !editingId && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-2 py-1 text-[11px] font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            {t("actions.add")}
          </button>
        )}
      </div>

      {loading && <p className="text-xs italic text-slate-400">{t("contracts.summary.loading")}</p>}

      {!loading && list.length === 0 && !adding && (
        <p className="text-xs italic text-slate-400">{t("contracts.summary.coTenantsEmpty")}</p>
      )}

      {list.map((c) => (
        editingId === c.id ? (
          <CoTenantForm
            key={c.id}
            initial={c}
            onCancel={() => setEditingId(null)}
            onSubmit={(p) => handleUpdate(c.id, p)}
          />
        ) : (
          <div key={c.id} className="rounded border border-slate-200 p-2 text-[13px] flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {c.fullName}
                <span className="text-slate-400 font-normal ml-1">
                  — {t("contracts.step4.relation" + c.relationship, { defaultValue: c.relationship })}
                </span>
              </div>
              <div className="text-slate-500 text-xs mt-0.5 truncate">
                {c.identityType}: {c.identityNumber}
                {c.phoneNumber ? ` · ${c.phoneNumber}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingId(c.id)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
              title={t("actions.edit")}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(c.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title={t("actions.delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      ))}

      {adding && (
        <CoTenantForm
          initial={null}
          onCancel={() => setAdding(false)}
          onSubmit={handleAdd}
        />
      )}
    </fieldset>
  );
}

function CoTenantForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation("common");
  const [f, setF] = useState({
    fullName: initial?.fullName || "",
    identityType: initial?.identityType || "CCCD",
    identityNumber: initial?.identityNumber || "",
    relationship: initial?.relationship || "",
    phoneNumber: initial?.phoneNumber || "",
    nationality: initial?.nationality || "",
  });
  const isPreset = RELATION_PRESETS.includes(f.relationship);

  const submit = () => {
    if (!f.fullName.trim() || !f.identityNumber.trim() || !f.relationship.trim()) {
      toast.error(t("contracts.quickEdit.coTenantRequired"));
      return;
    }
    onSubmit({
      fullName: f.fullName.trim(),
      identityType: f.identityType,
      identityNumber: f.identityNumber.trim().toUpperCase(),
      relationship: f.relationship.trim(),
      phoneNumber: f.phoneNumber?.trim() || null,
      nationality: f.nationality?.trim() || null,
    });
  };

  const inputCls = "border border-slate-300 rounded px-2 py-1.5 text-sm w-full";

  return (
    <div className="rounded border border-teal-300 bg-teal-50/30 p-2 space-y-1.5">
      <div className="grid grid-cols-6 gap-1.5">
        <input
          placeholder={t("contracts.step4.coTenantName")}
          value={f.fullName}
          onChange={(e) => setF({ ...f, fullName: e.target.value })}
          className={`${inputCls} col-span-2`}
        />
        <select
          value={f.identityType}
          onChange={(e) => setF({ ...f, identityType: e.target.value })}
          className={inputCls}
        >
          <option value="CCCD">{t("contracts.step4.idKindCccd")}</option>
          <option value="PASSPORT">{t("contracts.step4.idKindPassport")}</option>
        </select>
        <input
          placeholder={t("contracts.step4.coTenantIdNo")}
          value={f.identityNumber}
          onChange={(e) => setF({ ...f, identityNumber: e.target.value })}
          className={`${inputCls} uppercase`}
        />
        <select
          value={isPreset || f.relationship === "" ? f.relationship : "__OTHER__"}
          onChange={(e) => {
            const v = e.target.value;
            setF({ ...f, relationship: v === "__OTHER__" ? "" : v });
          }}
          className={inputCls}
        >
          <option value="">— {t("contracts.step4.coTenantRelation")} —</option>
          {RELATION_PRESETS.map((r) => (
            <option key={r} value={r}>
              {t("contracts.step4.relation" + r, { defaultValue: r })}
            </option>
          ))}
          <option value="__OTHER__">{t("contracts.step4.relationOther")}</option>
        </select>
        <input
          placeholder={t("contracts.step4.coTenantPhone")}
          value={f.phoneNumber}
          onChange={(e) => setF({ ...f, phoneNumber: e.target.value })}
          className={inputCls}
        />
      </div>
      {!isPreset && f.relationship === "" && (
        <input
          placeholder={t("contracts.step4.coTenantRelation")}
          value={f.relationship}
          onChange={(e) => setF({ ...f, relationship: e.target.value })}
          className={inputCls}
        />
      )}
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-[11px] font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {t("actions.cancel")}
        </button>
        <button
          type="button"
          onClick={submit}
          className="px-2 py-1 text-[11px] font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center gap-1"
        >
          <Save className="w-3 h-3" />
          {t("actions.save")}
        </button>
      </div>
    </div>
  );
}
