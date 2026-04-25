import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../../../../components/shared/Loading";
import { getUserByEmail } from "../../../../services/authService";
import AddressPicker from "../../../../components/shared/AddressPicker";
import { useCountries } from "../../hooks/useCountries";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepGeneralInfo({ form, update, errors = {} }) {
  const { t, i18n } = useTranslation("common");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailLookupUser, setEmailLookupUser] = useState(null);
  const [emailLookupError, setEmailLookupError] = useState("");
  // Nationality list from BE (REST Countries + bundled VN map + JA native).
  // Each country carries labelVi / labelEn / labelJa; the Select below picks
  // the label matching the current app locale so VI users see Vietnamese
  // names only, EN users see English, JA users see Japanese.
  const { countries, loading: countriesLoading } = useCountries();
  // `i18n.language` can be "vi", "en-US", "ja"... we only care about the
  // 2-letter primary subtag. Falls back to "vi" since that's the default.
  const primaryLang = (i18n.language || "vi").slice(0, 2).toLowerCase();
  const labelForLocale = (c) => {
    if (primaryLang === "ja") return c.labelJa || c.labelEn || c.labelVi;
    if (primaryLang === "en") return c.labelEn || c.labelVi;
    return c.labelVi || c.labelEn;
  };

  const startDateValue = useMemo(
    () => (form.startDate ? dayjs(form.startDate, "YYYY-MM-DD") : null),
    [form.startDate],
  );
  const endDateValue = useMemo(
    () => (form.endDate ? dayjs(form.endDate, "YYYY-MM-DD") : null),
    [form.endDate],
  );
  const dateOfIssueValue = useMemo(
    () => (form.dateOfIssue ? dayjs(form.dateOfIssue, "YYYY-MM-DD") : null),
    [form.dateOfIssue],
  );

  // DOB picker defaults — MUST be memoized to a stable reference.
  //
  // Previous bug: `defaultPickerValue={dayjs().subtract(25, "year")}` and
  // `disabledDate={(cur) => cur > dayjs().subtract(16, "year")}` were
  // inlined in JSX. Each render created a NEW Dayjs object / function,
  // which triggered antd DatePicker's internal prop-change useEffect,
  // which scheduled a setState, which re-rendered this component, which
  // created another new Dayjs object … → "Maximum update depth exceeded"
  // infinite loop crash on the Create Contract page.
  //
  // Fix: compute once per mount. For DOB the "today" reference drifting
  // by a few seconds while the user fills the form is irrelevant — the
  // 25-year-ago / 16-year-ago cutoffs are month-granularity decisions.
  const dobDefaultPickerValue = useMemo(() => dayjs().subtract(25, "year"), []);
  const dobMaxDate = useMemo(() => dayjs().subtract(16, "year"), []);
  const dobDisabledDate = useMemo(
    () => (cur) => cur && cur > dobMaxDate,
    [dobMaxDate],
  );

  const [showTenantFields, setShowTenantFields] = useState(() => {
    return !!(form?.emailChecked || form?.name || form?.phoneNumber || form?.identityNumber || form?.permanentAddress);
  });

  const handleEmailChange = (e) => {
    update("email")(e);
    update("emailChecked")({ target: { value: false } });
    setEmailLookupError("");
    setEmailLookupUser(null);
    setShowTenantFields(false);
    clearTenantFields();
  };

  const handleCheckEmail = async () => {
    const email = String(form.email ?? "").trim();
    if (!email) {
      setEmailLookupError(t("contracts.validation.emailRequired"));
      return;
    }

    setCheckingEmail(true);
    setEmailLookupError("");
    setEmailLookupUser(null);

    try {
      const res = await getUserByEmail(email);
      const user = res?.data ?? res ?? null;
      // BE user-service stores CCCD issue metadata + permanent address + (as
      // of BE-1) passport block on the User entity so subsequent contracts
      // auto-fill. Fields are populated on first contract write-back
      // (EContractServiceImpl post-commit hook + createUser-topic handler).
      const hasAnyIdentity =
        user && (user.name || user.identityNumber || user.passportNumber ||
                 user.fullName || user.phoneNumber);
      if (hasAnyIdentity) {
        setEmailLookupUser(user);

        const name        = user.name || user.fullName || user.username;
        const identity    = user.identityNumber || user.idNumber;
        const phone       = user.phoneNumber || user.phone;
        const dateOfIssue = user.dateOfIssue || user.identityDateOfIssue; // ISO or null
        const placeOfIssue   = user.placeOfIssue;
        const permAddress    = user.permanentAddress;
        const dateOfBirth    = user.dateOfBirth;
        const gender         = user.gender;
        // Passport block (foreign tenant). Presence of passportNumber is
        // the signal to flip tenantType → FOREIGNER and hide the CCCD
        // fields — user.identityNumber on a foreign tenant is a legacy
        // stub (the passport number mirrored into the NOT NULL column).
        const passportNumber     = user.passportNumber;
        const passportIssueDate  = user.passportIssueDate;
        const passportExpiryDate = user.passportExpiryDate;
        const nationality        = user.nationality;
        const visaType           = user.visaType;
        const visaExpiryDate     = user.visaExpiryDate;

        const isForeigner = !!passportNumber;
        update("tenantType")({ target: { value: isForeigner ? "FOREIGNER" : "VIETNAMESE" } });

        if (name)         update("name")({ target: { value: name } });
        if (phone)        update("phoneNumber")({ target: { value: phone } });
        if (permAddress)  update("permanentAddress")({ target: { value: permAddress } });
        if (dateOfBirth)  update("dateOfBirth")({ target: { value: String(dateOfBirth).slice(0, 10) } });
        if (gender)       update("gender")({ target: { value: gender } });

        if (isForeigner) {
          // Populate passport side; leave CCCD-only fields blank so the
          // wizard doesn't submit stale VN data for a foreign tenant.
          update("passportNumber")({ target: { value: passportNumber } });
          if (passportIssueDate)  update("passportIssueDate")({ target: { value: String(passportIssueDate).slice(0, 10) } });
          if (passportExpiryDate) update("passportExpiryDate")({ target: { value: String(passportExpiryDate).slice(0, 10) } });
          if (nationality)        update("nationality")({ target: { value: nationality } });
          if (visaType)           update("visaType")({ target: { value: visaType } });
          if (visaExpiryDate)     update("visaExpiryDate")({ target: { value: String(visaExpiryDate).slice(0, 10) } });
        } else {
          // VN tenant — CCCD side.
          if (identity)     update("identityNumber")({ target: { value: identity } });
          if (dateOfIssue)  update("dateOfIssue")({ target: { value: String(dateOfIssue).slice(0, 10) } });
          if (placeOfIssue) update("placeOfIssue")({ target: { value: placeOfIssue } });
        }
        update("isNewAccount")({ target: { value: false } });
        setEmailLookupError("");
      } else {
        update("isNewAccount")({ target: { value: true } });
        setEmailLookupError(t("contracts.validation.emailNotRegistered"));
      }
    } catch (err) {
      update("isNewAccount")({ target: { value: true } });
      setEmailLookupError(
        err?.status === 404
          ? t("contracts.validation.emailNotRegistered")
          : t("contracts.validation.emailCheckError"),
      );
    } finally {
      setCheckingEmail(false);
      update("emailChecked")({ target: { value: true } });
      setShowTenantFields(true);
    }
  };

  const clearTenantFields = () => {
    update("name")({ target: { value: "" } });
    update("phoneNumber")({ target: { value: "" } });
    // VN block
    update("identityNumber")({ target: { value: "" } });
    update("dateOfIssue")({ target: { value: "" } });
    update("placeOfIssue")({ target: { value: "" } });
    // Shared
    update("permanentAddress")({ target: { value: "" } });
    update("dateOfBirth")({ target: { value: "" } });
    update("gender")({ target: { value: "" } });
    // Foreign block
    update("passportNumber")({ target: { value: "" } });
    update("passportIssueDate")({ target: { value: "" } });
    update("passportExpiryDate")({ target: { value: "" } });
    update("nationality")({ target: { value: "" } });
    update("visaType")({ target: { value: "" } });
    update("visaExpiryDate")({ target: { value: "" } });
  };

  /**
   * G-2: when the user flips tenantType, clear the orphan block so the BE
   * doesn't receive a mixed payload (e.g. CCCD + passport both filled).
   * Without this, toggling FOREIGNER → VIETNAMESE could ship a stale
   * passport number into the VN contract flow.
   */
  const handleTenantTypeChange = (newType) => {
    update("tenantType")({ target: { value: newType } });
    if (newType === "VIETNAMESE") {
      update("passportNumber")({ target: { value: "" } });
      update("passportIssueDate")({ target: { value: "" } });
      update("passportExpiryDate")({ target: { value: "" } });
      update("visaType")({ target: { value: "" } });
      update("visaExpiryDate")({ target: { value: "" } });
      // Nationality stays — a VN tenant legitimately has nationality="Việt Nam".
    } else {
      update("identityNumber")({ target: { value: "" } });
      update("dateOfIssue")({ target: { value: "" } });
      update("placeOfIssue")({ target: { value: "" } });
    }
  };

  return (
    <div className="space-y-6">
      {/* General info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.generalInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.startDate")}</label>
            <DatePicker
              className={`w-full ${errors.startDate ? "border-red-500" : ""}`}
              value={startDateValue}
              format="DD/MM/YYYY"
              placeholder={t("contracts.form.startDatePlaceholder")}
              status={errors.startDate ? "error" : ""}
              onChange={(date) => update("startDate")({ target: { value: date ? date.format("YYYY-MM-DD") : "" } })}
            />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.endDate")}</label>
            <DatePicker
              className={`w-full ${errors.endDate ? "border-red-500" : ""}`}
              value={endDateValue}
              format="DD/MM/YYYY"
              placeholder={t("contracts.form.endDatePlaceholder")}
              status={errors.endDate ? "error" : ""}
              disabledDate={(current) => {
                if (!form.startDate) return false;
                return current && current < dayjs(form.startDate, "YYYY-MM-DD").startOf("day");
              }}
              onChange={(date) => update("endDate")({ target: { value: date ? date.format("YYYY-MM-DD") : "" } })}
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Tenant info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.tenantInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>{t("contracts.form.email")}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={handleEmailChange}
                  placeholder="nguyenvana@example.com"
                  className={`${inputClass} pr-10 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {checkingEmail && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <LoadingSpinner size="sm" label={t("contracts.form.checkingEmail")} />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={checkingEmail}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-teal-500 text-teal-600 hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {t("contracts.form.checkEmail")}
              </button>
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            {emailLookupError && !errors.email && (
              <p className="mt-1 text-xs text-amber-600">{emailLookupError}</p>
            )}
          </div>

          {showTenantFields && (
            <>
              {emailLookupUser && (
                <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {t("contracts.form.userFound")}
                </div>
              )}

              {/* Tenant type selector — placed up front so CCCD vs Passport
                  fields show the right shape immediately, instead of asking
                  for CCCD here and contradicting with passport in step 4. */}
              <div className="md:col-span-2">
                <label className={labelClass}>{t("contracts.step4.tenantType")}</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleTenantTypeChange("VIETNAMESE")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                      form.tenantType === "VIETNAMESE"
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🇻🇳 {t("contracts.step4.tenantTypeVN")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTenantTypeChange("FOREIGNER")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                      form.tenantType === "FOREIGNER"
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🌏 {t("contracts.step4.tenantTypeForeigner")}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t("contracts.form.tenantName")}</label>
                <input
                  value={form.name ?? ""}
                  onChange={update("name")}
                  placeholder="Nguyễn Văn A"
                  className={`${inputClass} ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("contracts.form.phone")}</label>
                <input
                  value={form.phoneNumber ?? ""}
                  onChange={update("phoneNumber")}
                  placeholder="0987654321"
                  className={`${inputClass} ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
              </div>

              {form.tenantType === "FOREIGNER" ? (
                <>
                  {/* Foreigner: passport number + nationality + visa — mirrors
                      the set that used to live in step 4. */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      {t("contracts.step4.passportNumber")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.passportNumber ?? ""}
                      onChange={update("passportNumber")}
                      placeholder="N1234567"
                      className={`${inputClass} uppercase ${errors.passportNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {errors.passportNumber && <p className="mt-1 text-xs text-red-600">{errors.passportNumber}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.step4.passportIssueDate")}</label>
                    <input
                      type="date"
                      value={form.passportIssueDate ?? ""}
                      onChange={update("passportIssueDate")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.step4.passportExpiryDate")}</label>
                    <input
                      type="date"
                      value={form.passportExpiryDate ?? ""}
                      onChange={update("passportExpiryDate")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.step4.visaType")}</label>
                    <input
                      value={form.visaType ?? ""}
                      onChange={update("visaType")}
                      placeholder="DN / LD / DL / ..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.step4.visaExpiryDate")}</label>
                    <input
                      type="date"
                      value={form.visaExpiryDate ?? ""}
                      onChange={update("visaExpiryDate")}
                      className={inputClass}
                    />
                  </div>
                  {/* Nationality — full HCM-ESB country list with antd Select
                      (searchable by VI or EN label). Step 4 no longer needs
                      a nationality override; moving the canonical picker
                      here avoids the UX bug where a foreigner types "Japan"
                      as free text here and the field goes blank in step 4. */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      {t("contracts.step4.nationality")} <span className="text-red-500">*</span>
                    </label>
                    <Select
                      showSearch
                      loading={countriesLoading}
                      value={form.nationality || undefined}
                      onChange={(v) => update("nationality")({ target: { value: v ?? "" } })}
                      placeholder={countriesLoading
                        ? t("contracts.step4.loadingCountries")
                        : t("contracts.step4.selectNationality")}
                      status={errors.nationality ? "error" : ""}
                      style={{ width: "100%" }}
                      optionFilterProp="label"
                      // Search across all three localized names — user can
                      // type "Japan", "Nhật", or "日本" and find the same row.
                      filterOption={(input, option) => {
                        const q = input.toLowerCase();
                        const d = option?.data ?? {};
                        return (option?.label ?? "").toLowerCase().includes(q)
                            || (d.labelVi ?? "").toLowerCase().includes(q)
                            || (d.labelEn ?? "").toLowerCase().includes(q)
                            || (d.labelJa ?? "").toLowerCase().includes(q);
                      }}
                      options={countries.map((c) => ({
                        // Stored value: Vietnamese name (canonical for BE
                        // contract rendering; BE normalizes for match).
                        // Dropdown label: the locale-matching name only
                        // (no more "Nhật Bản — Japan" mixed display).
                        value: c.labelVi,
                        label: labelForLocale(c),
                        data: c,
                      }))}
                    />
                    {errors.nationality && <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>}
                  </div>
                </>
              ) : (
                <>
                  {/* Vietnamese: CCCD block */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>{t("contracts.form.idNumber")}</label>
                    <input
                      type="text"
                      value={form.identityNumber ?? ""}
                      onChange={update("identityNumber")}
                      placeholder="012345678901"
                      className={`${inputClass} ${errors.identityNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    {errors.identityNumber && <p className="mt-1 text-xs text-red-600">{errors.identityNumber}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.form.dateOfIssue")}</label>
                    <DatePicker
                      className={`w-full ${inputClass} ${errors.dateOfIssue ? "border-red-500" : ""}`}
                      value={dateOfIssueValue}
                      format="DD/MM/YYYY"
                      placeholder={t("contracts.form.startDatePlaceholder")}
                      onChange={(_, dateString) => {
                        const iso = dateString ? dayjs(dateString, "DD/MM/YYYY").format("YYYY-MM-DD") : "";
                        update("dateOfIssue")({ target: { value: iso } });
                      }}
                      status={errors.dateOfIssue ? "error" : ""}
                    />
                    {errors.dateOfIssue && <p className="mt-1 text-xs text-red-600">{errors.dateOfIssue}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("contracts.form.placeOfIssue")}</label>
                    <input
                      value={form.placeOfIssue}
                      onChange={update("placeOfIssue")}
                      placeholder="Cục Cảnh sát QLHC về TTXH"
                      className={inputClass}
                    />
                  </div>
                </>
              )}
              {/* Ngày sinh + Giới tính — rendered on contract's tenant block.
                  Previously missing from the wizard, so they came through as
                  "/" on both VI + JA sides. */}
              <div>
                <label className={labelClass}>
                  {t("contracts.form.dateOfBirth", { defaultValue: "Ngày sinh" })}
                </label>
                <DatePicker
                  className={`w-full ${inputClass}`}
                  value={form.dateOfBirth ? dayjs(form.dateOfBirth, "YYYY-MM-DD") : null}
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  onChange={(_, dateString) => {
                    const iso = dateString ? dayjs(dateString, "DD/MM/YYYY").format("YYYY-MM-DD") : "";
                    update("dateOfBirth")({ target: { value: iso } });
                  }}
                  // Open the panel at ~25 years ago (typical adult renter
                  // age) instead of the current year — otherwise the user
                  // has to click Back-year 2-3 decades before they reach a
                  // plausible birth year. Disabled-date rule still enforces
                  // the 16+ floor so this is display-only.
                  defaultPickerValue={dobDefaultPickerValue}
                  // Ctrl+click year header → open the decade panel; most
                  // users just want to pick year first. antd has no direct
                  // "start on year" prop for date picker, but opening on a
                  // sensible default year means typical flow is
                  // scroll-one-month-panel instead of 30 back-clicks.
                  disabledDate={dobDisabledDate}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("contracts.form.gender", { defaultValue: "Giới tính" })}
                </label>
                <select
                  value={form.gender ?? ""}
                  onChange={update("gender")}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">— {t("actions.select", { defaultValue: "Chọn" })} —</option>
                  <option value="MALE">{t("gender.male", { defaultValue: "Nam" })}</option>
                  <option value="FEMALE">{t("gender.female", { defaultValue: "Nữ" })}</option>
                  <option value="OTHER">{t("gender.other", { defaultValue: "Khác" })}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                {/* Permanent address (địa chỉ thường trú trên CCCD) — a fact
                    about the person, not the rental. Lives on User so it
                    auto-fills across future contracts for the same tenant. */}
                <AddressPicker
                  value={form.permanentAddress ?? ""}
                  onChange={update("permanentAddress")}
                  error={errors.permanentAddress}
                  isForeigner={form.tenantType === "FOREIGNER"}
                  // Foreign tenants: feed the Nationality value (picked above)
                  // as the country portion of the address instead of rendering
                  // a second country dropdown inside AddressPicker. One country
                  // source per form — removes the dup dropdown + prevents the
                  // "nationality=Japan, address country=USA" mismatch bug.
                  country={form.tenantType === "FOREIGNER" ? (form.nationality ?? "") : ""}
                  label={form.tenantType === "FOREIGNER"
                    ? t("contracts.form.permanentAddressForeign", { defaultValue: "Địa chỉ thường trú (trên hộ chiếu)" })
                    : t("contracts.form.permanentAddress", { defaultValue: "Địa chỉ thường trú (trên CCCD)" })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
