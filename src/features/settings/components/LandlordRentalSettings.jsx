import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Save, Clock, AlertTriangle, User } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  getMyLandlordProfile,
  upsertMyLandlordProfile,
} from "../../contracts/api/landlordProfile.api";

const DEFAULT_WAIT_DAYS = 3;
const MIN_WAIT = 1;
const MAX_WAIT = 30;
const DEFAULT_FORCE_HOURS = 24;
const MIN_FORCE = 1;
const MAX_FORCE = 168;

const PERSONAL_FIELDS = [
  "fullName", "dateOfBirth", "identityNumber", "identityIssueDate", "identityIssuePlace",
  "permanentAddress", "address", "phoneNumber", "email",
  "bankAccount", "bankName", "taxCode",
];

const emptyForm = () => Object.fromEntries(PERSONAL_FIELDS.map((k) => [k, ""]));

const profileToForm = (p) => {
  const f = emptyForm();
  if (!p) return f;
  for (const k of PERSONAL_FIELDS) f[k] = p[k] ?? "";
  return f;
};

export default function LandlordRentalSettings() {
  const { t } = useTranslation("common");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [waitDays, setWaitDays] = useState(DEFAULT_WAIT_DAYS);
  const [forceHours, setForceHours] = useState(DEFAULT_FORCE_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyLandlordProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm(profileToForm(data));
        setWaitDays(data?.depositWaitDays ?? DEFAULT_WAIT_DAYS);
        setForceHours(data?.forceMajeureNoticeHours ?? DEFAULT_FORCE_HOURS);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || t("settings.landlord.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t]);

  const clampedWait = Math.min(MAX_WAIT, Math.max(MIN_WAIT, Number(waitDays) || DEFAULT_WAIT_DAYS));
  const clampedForce = Math.min(MAX_FORCE, Math.max(MIN_FORCE, Number(forceHours) || DEFAULT_FORCE_HOURS));

  const dirty = useMemo(() => {
    if (!profile) return false;
    if (clampedWait !== (profile.depositWaitDays ?? DEFAULT_WAIT_DAYS)) return true;
    if (clampedForce !== (profile.forceMajeureNoticeHours ?? DEFAULT_FORCE_HOURS)) return true;
    for (const k of PERSONAL_FIELDS) {
      if ((form[k] ?? "") !== (profile[k] ?? "")) return true;
    }
    return false;
  }, [profile, form, clampedWait, clampedForce]);

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!profile || saving) return;
    if (!form.fullName?.trim() || !form.identityNumber?.trim() || !form.email?.trim()) {
      toast.error(t("settings.landlord.saveError"));
      return;
    }
    setSaving(true);
    try {
      const updated = await upsertMyLandlordProfile({
        fullName: form.fullName.trim(),
        identityNumber: form.identityNumber.trim(),
        identityIssueDate: form.identityIssueDate?.trim() || null,
        identityIssuePlace: form.identityIssuePlace?.trim() || null,
        address: form.address?.trim() || null,
        phoneNumber: form.phoneNumber?.trim() || null,
        email: form.email.trim(),
        bankAccount: form.bankAccount?.trim() || null,
        dateOfBirth: form.dateOfBirth?.trim() || null,
        permanentAddress: form.permanentAddress?.trim() || null,
        bankName: form.bankName?.trim() || null,
        taxCode: form.taxCode?.trim() || null,
        depositWaitDays: clampedWait,
        forceMajeureNoticeHours: clampedForce,
      });
      setProfile(updated);
      setForm(profileToForm(updated));
      setWaitDays(updated?.depositWaitDays ?? clampedWait);
      setForceHours(updated?.forceMajeureNoticeHours ?? clampedForce);
      toast.success(t("settings.landlord.saveSuccess"));
    } catch (e) {
      toast.error(e?.message || t("settings.landlord.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-6 flex items-center gap-2 text-sm text-slate-500"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {t("settings.landlord.loading")}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl p-6 text-sm"
        style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.3)", color: "#9a3412" }}
      >
        {error || t("settings.landlord.profileMissing")}
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 pr-16 rounded-xl outline-none transition";
  const inputStyle = { border: "1px solid #C4DED5", background: "#ffffff", color: "#1E2D28" };
  const inputFocus = (e) => {
    e.currentTarget.style.borderColor = "#3bb582";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)";
  };
  const inputBlur = (e) => {
    e.currentTarget.style.borderColor = "#C4DED5";
    e.currentTarget.style.boxShadow = "none";
  };

  const textInputCls = "w-full px-4 py-2.5 rounded-xl outline-none transition text-sm";

  const renderTextField = (key, { type = "text", required = false } = {}) => (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">
        {t(`settings.landlord.${key}Label`)}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={updateField(key)}
        placeholder={t(`settings.landlord.${key}Placeholder`, { defaultValue: "" })}
        className={textInputCls}
        style={inputStyle}
        onFocus={inputFocus}
        onBlur={inputBlur}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(32,150,216,0.12)", color: "#2096d8" }}
          >
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {t("settings.landlord.personalInfoTitle")}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {t("settings.landlord.personalInfoSubtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTextField("fullName", { required: true })}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              {t("settings.landlord.dobLabel")}
            </label>
            <DatePicker
              className="w-full"
              size="large"
              value={form.dateOfBirth ? dayjs(form.dateOfBirth, "YYYY-MM-DD") : null}
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              onChange={(_, dateString) => {
                const iso = dateString ? dayjs(dateString, "DD/MM/YYYY").format("YYYY-MM-DD") : "";
                setForm((prev) => ({ ...prev, dateOfBirth: iso }));
              }}
            />
          </div>
          {renderTextField("identityNumber", { required: true })}
          {renderTextField("identityIssueDate")}
          <div className="md:col-span-2">{renderTextField("identityIssuePlace")}</div>
          <div className="md:col-span-2">{renderTextField("permanentAddress")}</div>
          <div className="md:col-span-2">{renderTextField("address")}</div>
          {renderTextField("phoneNumber")}
          {renderTextField("email", { type: "email", required: true })}
          {renderTextField("bankAccount")}
          {renderTextField("bankName")}
          <div className="md:col-span-2">{renderTextField("taxCode")}</div>
        </div>
      </div>

      <div className="rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(59,181,130,0.12)", color: "#3bb582" }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {t("settings.landlord.depositWaitTitle")}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {t("settings.landlord.depositWaitSubtitle")}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700">
            {t("settings.landlord.depositWaitDaysLabel")}
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={MIN_WAIT}
              max={MAX_WAIT}
              value={waitDays}
              onChange={(e) => setWaitDays(e.target.value)}
              className={inputCls}
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              {t("settings.landlord.daysUnit")}
            </span>
          </div>
          <p className="text-xs mt-1.5 text-slate-500">
            {t("settings.landlord.depositWaitHint", { min: MIN_WAIT, max: MAX_WAIT })}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          {t("settings.landlord.depositExpiryWarning", { days: clampedWait })}
        </div>
      </div>

      <div className="rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {t("settings.landlord.forceMajeureTitle")}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {t("settings.landlord.forceMajeureSubtitle")}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700">
            {t("settings.landlord.forceMajeureLabel")}
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={MIN_FORCE}
              max={MAX_FORCE}
              value={forceHours}
              onChange={(e) => setForceHours(e.target.value)}
              className={inputCls}
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              {t("settings.landlord.hoursUnit")}
            </span>
          </div>
          <p className="text-xs mt-1.5 text-slate-500">
            {t("settings.landlord.forceMajeureHint", { min: MIN_FORCE, max: MAX_FORCE })}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving
            ? t("settings.landlord.saving")
            : t("settings.landlord.saveButton")}
        </button>
      </div>
    </div>
  );
}
