import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listCoTenants } from "../../api/contracts.api";

/**
 * Read-only panel surfacing legal fields on the contract detail page.
 * Policy / tenantType / contractLanguage values use i18n keys resolved at
 * render time — the stored DB value stays an enum (ALLOWED, NOT_ALLOWED…).
 */

function useLabelFor(t) {
  return (field, value) => {
    if (value == null || value === "") return "—";
    // Key convention: contracts.summary.{field}.{value} — e.g.
    //   contracts.summary.petPolicy.ALLOWED → "Được phép" / "Allowed" / "可"
    const key = `contracts.summary.${field}.${value}`;
    const resolved = t(key, { defaultValue: "" });
    return resolved || value;
  };
}

function useFmtMoney(i18n) {
  return (n) => {
    if (n == null) return "—";
    const locale = i18n.language === "ja" ? "ja-JP" : i18n.language === "en" ? "en-US" : "vi-VN";
    const suffix = i18n.language === "ja" ? " VND" : i18n.language === "en" ? " VND" : " ₫";
    return new Intl.NumberFormat(locale).format(n) + suffix;
  };
}

function useFmtDate(i18n) {
  return (iso) => {
    if (!iso) return "—";
    try {
      const locale = i18n.language === "ja" ? "ja-JP" : i18n.language === "en" ? "en-GB" : "vi-VN";
      return new Date(iso).toLocaleDateString(locale);
    } catch { return iso; }
  };
}

function Row({ label: lbl, children }) {
  return (
    <div className="flex gap-4 text-[13px]">
      <div className="w-48 text-slate-500">{lbl}</div>
      <div className="flex-1 text-slate-900 font-medium">{children}</div>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="space-y-2 px-4 pb-4">{children}</div>}
    </section>
  );
}

export default function ContractLegalSummary({ contract }) {
  const { t, i18n } = useTranslation("common");
  const label = useLabelFor(t);
  const fmtMoney = useFmtMoney(i18n);
  const fmtDate = useFmtDate(i18n);

  const [coTenants, setCoTenants] = useState([]);
  const [loadingCo, setLoadingCo] = useState(false);

  useEffect(() => {
    if (!contract?.id) return;
    let cancelled = false;
    setLoadingCo(true);
    listCoTenants(contract.id)
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          // Log in dev to diagnose "shows 0 but DB has row" — the request
          // may be 401/403/OK-empty. Silent catch was hiding the root cause.
          if (list.length === 0) {
            // eslint-disable-next-line no-console
            console.info("[ContractLegalSummary] listCoTenants returned 0 rows for", contract.id, "raw:", data);
          }
          setCoTenants(list);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error("[ContractLegalSummary] listCoTenants failed:", err?.response?.status, err?.response?.data, err?.message);
          setCoTenants([]);
        }
      })
      .finally(() => { if (!cancelled) setLoadingCo(false); });
    return () => { cancelled = true; };
  }, [contract?.id]);

  if (!contract) return null;
  const isForeigner = contract.tenantType === "FOREIGNER";

  return (
    <div className="space-y-3">
      <Section title={t("contracts.summary.sectionTenant")}>
        <Row label={t("contracts.summary.type")}>{label("tenantType", contract.tenantType)}</Row>
        <Row label={t("contracts.summary.fullName")}>{contract.tenantName ?? "—"}</Row>
        {isForeigner ? (
          <>
            <Row label={t("contracts.summary.passport")}>{contract.passportNumber ?? "—"}</Row>
            <Row label={t("contracts.summary.nationality")}>{contract.nationality ?? "—"}</Row>
            <Row label={t("contracts.summary.visa")}>
              {contract.visaType ?? "—"}
              {contract.visaExpiryDate ? ` (${t("contracts.summary.visaValidUntil")} ${fmtDate(contract.visaExpiryDate)})` : ""}
            </Row>
            <Row label={t("contracts.summary.passportExpiry")}>{fmtDate(contract.passportExpiryDate)}</Row>
          </>
        ) : (
          <Row label={t("contracts.summary.cccd")}>{contract.cccdNumber ?? "—"}</Row>
        )}
        <Row label={t("contracts.summary.dobGender")}>
          {fmtDate(contract.dateOfBirth)} / {contract.gender ? t("gender." + contract.gender.toLowerCase(), { defaultValue: contract.gender }) : "—"}
        </Row>
        <Row label={t("contracts.summary.occupation")}>{contract.occupation ?? "—"}</Row>
        <Row label={t("contracts.summary.permanentAddress")}>{contract.permanentAddress ?? "—"}</Row>
      </Section>

      <Section title={t("contracts.summary.sectionFinance")}>
        <Row label={t("contracts.summary.rent")}>{fmtMoney(contract.rentAmount)}</Row>
        <Row label={t("contracts.summary.deposit")}>{fmtMoney(contract.depositAmount)}</Row>
        <Row label={t("contracts.summary.payDay")}>
          {t("contracts.summary.payDayValue", { day: contract.payDate ?? "—" })}
        </Row>
        <Row label={t("contracts.summary.lateFee")}>
          {t("contracts.summary.lateFeeValue", {
            days: contract.lateDays ?? "—",
            pct: contract.latePenaltyPercent ?? "—",
          })}
        </Row>
        <Row label={t("contracts.summary.depositRefund")}>
          {t("contracts.summary.depositRefundValue", { days: contract.depositRefundDays ?? "—" })}
        </Row>
        <Row label={t("contracts.summary.taxResp")}>{label("taxResponsibility", contract.taxResponsibility)}</Row>
      </Section>

      <Section title={t("contracts.summary.sectionHandover")} defaultOpen={false}>
        <Row label={t("contracts.summary.handoverDate")}>{fmtDate(contract.handoverDate)}</Row>
        <div className="pt-2 text-[11px] italic text-slate-400">
          {t("contracts.summary.handoverNote")}
        </div>
      </Section>

      <Section title={t("contracts.summary.sectionRules")} defaultOpen={false}>
        <Row label={t("contracts.summary.pet")}>{label("petPolicy", contract.petPolicy)}</Row>
        <Row label={t("contracts.summary.smoking")}>{label("smokingPolicy", contract.smokingPolicy)}</Row>
        <Row label={t("contracts.summary.sublease")}>{label("subleasePolicy", contract.subleasePolicy)}</Row>
        <Row label={t("contracts.summary.visitor")}>{label("visitorPolicy", contract.visitorPolicy)}</Row>
        <Row label={t("contracts.summary.tempRes")}>{label("tempResidenceRegisterBy", contract.tempResidenceRegisterBy)}</Row>
        <Row label={t("contracts.summary.contractLang")}>{label("contractLanguage", contract.contractLanguage)}</Row>
      </Section>

      {contract.meterReadingsStart && (
        <Section title={t("contracts.summary.sectionMeter")} defaultOpen={false}>
          <Row label={t("contracts.summary.meterElectric")}>{contract.meterReadingsStart.electric ?? "—"} kWh</Row>
          <Row label={t("contracts.summary.meterWater")}>{contract.meterReadingsStart.water ?? "—"} m³</Row>
          {contract.meterReadingsStart.note && (
            <Row label={t("contracts.summary.meterNote")}>{contract.meterReadingsStart.note}</Row>
          )}
        </Section>
      )}

      <Section
        title={t("contracts.summary.sectionCoTenants", { count: coTenants.length })}
        defaultOpen={coTenants.length > 0}
      >
        {loadingCo && <p className="text-xs text-slate-400 italic">{t("contracts.summary.loading")}</p>}
        {!loadingCo && coTenants.length === 0 && (
          <p className="text-xs text-slate-400 italic">{t("contracts.summary.coTenantsEmpty")}</p>
        )}
        {coTenants.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200 p-3 text-[13px]">
            <div className="font-medium">
              {c.fullName}{" "}
              <span className="text-slate-400 font-normal">
                — {t("contracts.step4.relation" + c.relationship, { defaultValue: c.relationship })}
              </span>
            </div>
            <div className="text-slate-500 text-xs mt-1">
              {c.identityType}: {c.identityNumber}
              {c.phoneNumber ? ` · ${c.phoneNumber}` : ""}
              {c.nationality ? ` · ${c.nationality}` : ""}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t("contracts.summary.sectionVerify")} defaultOpen={false}>
        <Row label={t("contracts.summary.cccdVerified")}>
          {contract.cccdVerifiedAt ? fmtDate(contract.cccdVerifiedAt) : t("contracts.summary.notYet")}
        </Row>
        <Row label={t("contracts.summary.passportVerified")}>
          {contract.passportVerifiedAt ? fmtDate(contract.passportVerifiedAt) : t("contracts.summary.notYet")}
        </Row>
        <Row label={t("contracts.summary.vnptDocument")}>{contract.documentNo ?? "—"}</Row>
      </Section>
    </div>
  );
}
