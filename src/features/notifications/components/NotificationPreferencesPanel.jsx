import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Moon,
  Crown,
  TestTube,
  Save,
} from "lucide-react";
import {
  getMyPreferences,
  updateMyPreferences,
  getMySubscription,
  getMyQuota,
  fireTestVoiceCall,
} from "../api/preferences.api";
import { createSubscriptionPaymentLink } from "../api/payments.api";
import { getAllManagers } from "../../auth/api/users.api";
import { useAuthStore } from "../../auth/store/auth.store";

const VOICE_GENDERS = [
  { value: "FEMALE", label: { vi: "Nữ", en: "Female", ja: "女性" } },
  { value: "MALE",   label: { vi: "Nam", en: "Male",  ja: "男性" } },
];

/**
 * Drop-in notification-preferences panel for the Settings page.
 * Connects to /api/notifications/preferences/me on mount, lets the
 * user toggle channels + language + quiet hours + voice settings,
 * and pushes a partial PUT on Save. Also surfaces the PREMIUM tier +
 * monthly voice quota and exposes a "test voice" button (one per day,
 * BE-rate-limited).
 */
export default function NotificationPreferencesPanel() {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n?.resolvedLanguage || "vi").slice(0, 2);

  // Role-aware UI. The web app only ever serves ADMIN / LANDLORD /
  // MANAGER (TECH_STAFF + TENANT use the mobile apps), so the "tenant"
  // branch here is defensive only — it would never trigger for a
  // properly-routed user. ADMIN is folded into LANDLORD for display:
  // they want portfolio-level visibility, not voice spam.
  const { roles = [] } = useAuthStore();
  const roleSet  = new Set((roles || []).map((r) => String(r).toUpperCase()));
  const isLandlord = roleSet.has("LANDLORD") || roleSet.has("ADMIN") || roleSet.has("SYSTEM_ADMIN");
  const isManager  = roleSet.has("MANAGER");
  // Tenants live on mobile, but if someone managed to land on this
  // page anyway they'd see the full panel — including the now-defunct
  // subscription card. We surface a polite redirect notice instead.
  const isTenant   = !isLandlord && !isManager;

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [prefs, setPrefs]       = useState(null);
  const [sub, setSub]           = useState(null);
  const [quota, setQuota]       = useState(null);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // First-visit race: getOrCreate inside the BE inserts a default
        // row if missing. Firing all four endpoints in parallel makes
        // two of them try to INSERT for the same user_id at once — one
        // wins, the other fails with a unique-constraint violation.
        // Serialise the two creator-paths (prefs + subscription); the
        // read-only ones (quota, managers) can still run in parallel
        // afterwards.
        const p = await getMyPreferences();
        if (cancelled) return;
        setPrefs(p);

        const s = await getMySubscription();
        if (cancelled) return;
        setSub(s);

        const [q, mgrs] = await Promise.all([
          getMyQuota().catch(() => null),
          getAllManagers().catch(() => []),
        ]);
        if (cancelled) return;
        setQuota(q);
        setManagers(Array.isArray(mgrs) ? mgrs : []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setField = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const patch = {
        // language intentionally omitted — system-wide setting drives it.
        quietHoursEnabled:          prefs.quietHoursEnabled,
        emailEnabled:               prefs.emailEnabled,
        pushEnabled:                prefs.pushEnabled,
        smsEnabled:                 prefs.smsEnabled,
        voiceEnabled:               prefs.voiceEnabled,
        quietHoursStart:            prefs.quietHoursStart,
        quietHoursEnd:              prefs.quietHoursEnd,
        quietHoursOverrideCritical: prefs.quietHoursOverrideCritical,
        voiceMaxRetries:            prefs.voiceMaxRetries,
        voiceRetryIntervalSec:      prefs.voiceRetryIntervalSec,
        voiceRateLimitSec:          prefs.voiceRateLimitSec,
        voiceGender:                prefs.voiceGender,
        voiceSpeed:                 prefs.voiceSpeed,
        dtmfAckEnabled:             prefs.dtmfAckEnabled,
        escalationEnabled:          prefs.escalationEnabled,
        escalationTargetUserId:     prefs.escalationTargetUserId || null,
      };
      const fresh = await updateMyPreferences(patch);
      setPrefs(fresh);
      toast.success(t("notif.prefs.saved"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onGrantConsentAndEnableVoice = async () => {
    setSaving(true);
    try {
      const fresh = await updateMyPreferences({
        voiceEnabled: true,
        voiceConsentGranted: true,
      });
      setPrefs(fresh);
      toast.success(t("notif.prefs.consentGranted"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onRevokeConsent = async () => {
    setSaving(true);
    try {
      const fresh = await updateMyPreferences({
        voiceConsentGranted: false,
      });
      setPrefs(fresh);
      toast.info(t("notif.prefs.consentRevoked"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onUpgrade = async () => {
    setUpgrading(true);
    try {
      // Payment-Service returns the signed VNPay URL as a plain string
      // (its standard ApiResponse<String> envelope). We open it in a
      // new tab so the user can come back to Settings after paying;
      // tier flip happens via the IPN, independent of the browser tab.
      const months = 1;
      const url = await createSubscriptionPaymentLink(months, { locale: "vn" });
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        toast.info(
          t("notif.prefs.upgradeRedirectMsg", {
            amount: (months * 19000).toLocaleString("vi-VN"),
            months,
          })
        );
      } else {
        toast.error(t("notif.prefs.upgradeRedirectMissing"));
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpgrading(false);
    }
  };

  const onTestVoice = async () => {
    setTesting(true);
    try {
      const r = await fireTestVoiceCall();
      const voiceLine = r?.results?.find((x) => x.channel?.includes("VOICE"));
      if (voiceLine?.status === "SENT") {
        toast.success(t("notif.prefs.testQueued"));
      } else {
        toast.warning(`${voiceLine?.channel || "VOICE"}: ${voiceLine?.reason || voiceLine?.status}`);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading || !prefs) {
    return <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>;
  }

  const isPremium = sub?.tier === "PREMIUM";
  const voiceLocked = !isPremium;
  const consentGiven = !!prefs.voiceConsentGivenAt;

  return (
    <div className="space-y-6">
      {/* Landlord banner — explain why voice/SMS isn't here */}
      {isLandlord && (
        <div className="rounded-2xl p-4"
             style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
          <p className="text-sm" style={{ color: "#92400E" }}>
            {t("notif.prefs.landlordHint")}
          </p>
        </div>
      )}

      {/* Tenant arrived on web (shouldn't happen — they live on mobile).
          Tell them to switch apps; subscription / voice consent / test
          call are all designed for the mobile UX. */}
      {isTenant && (
        <div className="rounded-2xl p-4"
             style={{ background: "#DBEAFE", border: "1px solid #BFDBFE" }}>
          <p className="text-sm" style={{ color: "#1E40AF" }}>
            {t("notif.prefs.tenantOnMobileHint")}
          </p>
        </div>
      )}

      {/* Subscription summary — TENANT ONLY (manager/landlord aren't tier-gated) */}
      {isTenant && (
        <div className="rounded-2xl p-6"
             style={{ background: "#FFFFFF", border: "1px solid #C4DED5",
                      boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Crown size={18} style={{ color: isPremium ? "#f59e0b" : "#9ca3af" }} />
              {t("notif.prefs.subscription")}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: isPremium ? "#FEF3C7" : "#F3F4F6",
                           color:      isPremium ? "#92400E" : "#6B7280" }}>
              {sub?.tier || "FREE"}
            </span>
          </div>
          {isPremium && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Stat label={t("notif.prefs.voiceQuota")}
                    value={`${quota?.voiceUsedThisMonth ?? 0}/${quota?.voiceQuotaMonthly ?? 0}`} />
              <Stat label={t("notif.prefs.smsQuota")}
                    value={`${quota?.smsUsedThisMonth ?? 0}/${quota?.smsQuotaMonthly ?? 0}`} />
              <Stat label={t("notif.prefs.premiumUntil")}
                    value={sub?.premiumUntil ? new Date(sub.premiumUntil).toLocaleDateString() : "—"} />
            </div>
          )}
          {!isPremium && (
            <>
              <p className="text-sm text-gray-500">
                {t("notif.prefs.upgradeHint")}
              </p>
              <button
                onClick={onUpgrade}
                disabled={upgrading}
                className="mt-3 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow inline-flex items-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
              >
                <Crown size={14} />
                {upgrading
                  ? t("notif.prefs.upgrading")
                  : t("notif.prefs.upgradeBtn")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Channel toggles — landlord only sees email/push (matrix enforces
          this on the BE; the FE mirrors so the user doesn't see toggles
          that have no effect). */}
      <Section title={t("notif.prefs.channels")}>
        <ChannelToggle icon={<Mail size={16} />} label={t("notif.prefs.email")}
                        desc={t("notif.prefs.emailDesc")}
                        checked={prefs.emailEnabled}
                        onChange={(v) => setField("emailEnabled", v)} />
        <ChannelToggle icon={<Bell size={16} />} label={t("notif.prefs.push")}
                        desc={t("notif.prefs.pushDesc")}
                        checked={prefs.pushEnabled}
                        onChange={(v) => setField("pushEnabled", v)} />
        {!isLandlord && (
          <>
            <ChannelToggle icon={<MessageSquare size={16} />} label={t("notif.prefs.sms")}
                            desc={t("notif.prefs.smsDesc")}
                            checked={prefs.smsEnabled}
                            onChange={(v) => setField("smsEnabled", v)}
                            disabled={isTenant && voiceLocked}
                            lockedReason={isTenant && voiceLocked ? t("notif.prefs.premiumOnly") : null} />
            <ChannelToggle icon={<Phone size={16} />} label={t("notif.prefs.voice")}
                            desc={t("notif.prefs.voiceDesc")}
                            checked={prefs.voiceEnabled}
                            onChange={(v) => setField("voiceEnabled", v)}
                            disabled={isTenant && (voiceLocked || !consentGiven)}
                            lockedReason={isTenant && voiceLocked ? t("notif.prefs.premiumOnly")
                                                       : isTenant && !consentGiven ? t("notif.prefs.consentRequired") : null} />
          </>
        )}
      </Section>

      {/* Voice consent — TENANT only. Managers/landlords have implicit
          consent via their employment role (B2B), so the BE auto-stamps
          voiceConsentGivenAt when they first enable voice. */}
      {isTenant && isPremium && (
        <Section title={t("notif.prefs.voiceConsent")}>
          <p className="text-sm text-gray-600 mb-3">{t("notif.prefs.voiceConsentDesc")}</p>
          {consentGiven ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">
                ✓ {t("notif.prefs.consentGivenAt", { date: new Date(prefs.voiceConsentGivenAt).toLocaleString() })}
              </span>
              <button onClick={onRevokeConsent}
                      className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50">
                {t("notif.prefs.revokeConsent")}
              </button>
            </div>
          ) : (
            <button onClick={onGrantConsentAndEnableVoice}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm text-white"
                    style={{ background: "#3bb582" }}>
              {t("notif.prefs.grantConsent")}
            </button>
          )}
        </Section>
      )}

      {/* Language picker removed — notifications follow the system-wide
          language set under Settings → System. The BE falls back to the
          user's profile language (User-Service) when prefs.language is
          null, so omitting the field here keeps the two in sync. */}

      {/* Quiet hours */}
      <Section title={t("notif.prefs.quietHours")} icon={<Moon size={16} />}>
        {/* Master switch — when off, time inputs + override checkbox are
            visually disabled and the BE skips the time-of-day check. */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium" style={{ color: "#1E2D28" }}>
              {t("notif.prefs.quietHoursEnabled")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("notif.prefs.quietHoursEnabledDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox"
                   checked={prefs.quietHoursEnabled !== false}
                   onChange={(e) => setField("quietHoursEnabled", e.target.checked)}
                   className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer
                            peer-checked:after:translate-x-full peer-checked:after:border-white
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                            after:bg-white after:border after:rounded-full after:h-5 after:w-5
                            after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className={`grid grid-cols-2 gap-4 mb-3 ${prefs.quietHoursEnabled === false ? "opacity-50 pointer-events-none" : ""}`}>
          <Field label={t("notif.prefs.quietStart")}>
            <input type="time"
                   value={prefs.quietHoursStart || "22:00"}
                   onChange={(e) => setField("quietHoursStart", e.target.value)}
                   disabled={prefs.quietHoursEnabled === false}
                   className="w-full px-3 py-2 rounded-lg border border-gray-200" />
          </Field>
          <Field label={t("notif.prefs.quietEnd")}>
            <input type="time"
                   value={prefs.quietHoursEnd || "06:00"}
                   onChange={(e) => setField("quietHoursEnd", e.target.value)}
                   disabled={prefs.quietHoursEnabled === false}
                   className="w-full px-3 py-2 rounded-lg border border-gray-200" />
          </Field>
        </div>
        <label className={`flex items-center gap-2 text-sm ${prefs.quietHoursEnabled === false ? "opacity-50" : ""}`}>
          <input type="checkbox"
                 checked={!!prefs.quietHoursOverrideCritical}
                 onChange={(e) => setField("quietHoursOverrideCritical", e.target.checked)}
                 disabled={prefs.quietHoursEnabled === false} />
          {t("notif.prefs.overrideCritical")}
        </label>
      </Section>

      {/* Voice settings — visible for both tenant + manager but content
          differs:
            • Tenant gets the full panel (retry knobs, DTMF, escalation
              picker — they're the originator of the alert).
            • Manager only gets style preferences (gender + speed) +
              test call. Retries, DTMF and escalation are tenant-side
              concepts; the manager IS the escalation target so doesn't
              configure it. */}
      {!isLandlord && (isPremium || isManager) && (
        <Section title={t("notif.prefs.voiceSettings")} icon={<Phone size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("notif.prefs.voiceGender")}>
              <select value={prefs.voiceGender || "FEMALE"}
                      onChange={(e) => setField("voiceGender", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200">
                {VOICE_GENDERS.map((g) =>
                  <option key={g.value} value={g.value}>{g.label[lang] || g.label.vi}</option>)}
              </select>
            </Field>
            <Field label={t("notif.prefs.voiceSpeed")}>
              <input type="range" min="0.8" max="1.2" step="0.05"
                     value={parseFloat(prefs.voiceSpeed || "1")}
                     onChange={(e) => setField("voiceSpeed", parseFloat(e.target.value))}
                     className="w-full" />
              <span className="text-xs text-gray-500">{(parseFloat(prefs.voiceSpeed || "1")).toFixed(2)}×</span>
            </Field>
            {isTenant && (
              <>
                <Field label={t("notif.prefs.maxRetries")}>
                  <input type="number" min="0" max="5"
                         value={prefs.voiceMaxRetries ?? 2}
                         onChange={(e) => setField("voiceMaxRetries", Number(e.target.value))}
                         className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                </Field>
                <Field label={t("notif.prefs.retryIntervalSec")}>
                  <input type="number" min="30" max="600" step="30"
                         value={prefs.voiceRetryIntervalSec ?? 120}
                         onChange={(e) => setField("voiceRetryIntervalSec", Number(e.target.value))}
                         className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                </Field>
                <Field label={t("notif.prefs.rateLimitSec")}>
                  <input type="number" min="60" max="3600" step="30"
                         value={prefs.voiceRateLimitSec ?? 300}
                         onChange={(e) => setField("voiceRateLimitSec", Number(e.target.value))}
                         className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                </Field>
              </>
            )}
          </div>

          {/* DTMF + escalation are tenant-only — the manager is who the
              tenant escalates TO, so showing these to a manager would be
              circular. */}
          {isTenant && (
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox"
                       checked={!!prefs.dtmfAckEnabled}
                       onChange={(e) => setField("dtmfAckEnabled", e.target.checked)} />
                {t("notif.prefs.dtmfAck")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox"
                       checked={!!prefs.escalationEnabled}
                       onChange={(e) => setField("escalationEnabled", e.target.checked)} />
                {t("notif.prefs.escalation")}
              </label>
            </div>
          )}

          {/* Manager picker — only relevant when escalation is on. Empty
              value means "auto-resolve via region manager", which is the
              normal path. Pinning a specific manager is for power users
              who want to bypass region-based routing. */}
          {isTenant && prefs.escalationEnabled && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Field label={t("notif.prefs.escalationTarget")}>
                <select value={prefs.escalationTargetUserId || ""}
                        onChange={(e) => setField("escalationTargetUserId", e.target.value || null)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200">
                  <option value="">
                    {t("notif.prefs.escalationAuto")}
                  </option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.email ? `(${m.email})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {t("notif.prefs.escalationTargetHint")}
                </p>
              </Field>
            </div>
          )}

          {/* Test call — manager has implicit consent so doesn't need
              the consentGiven gate. Quota note shown only to tenant. */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={onTestVoice}
                    disabled={testing || !prefs.voiceEnabled || (isTenant && !consentGiven)}
                    className="px-4 py-2 rounded-lg text-sm border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 inline-flex items-center gap-2">
              <TestTube size={14} />
              {testing ? t("notif.prefs.testing") : t("notif.prefs.testVoice")}
            </button>
            {isTenant && (
              <p className="text-xs text-gray-500 mt-1">{t("notif.prefs.testVoiceHint")}</p>
            )}
          </div>
        </Section>
      )}

      {/* Save bar */}
      <div className="sticky bottom-0 flex justify-end pt-2">
        <button onClick={onSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2 shadow"
                style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
          <Save size={16} />
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl p-6"
         style={{ background: "#FFFFFF", border: "1px solid #C4DED5",
                  boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1E2D28" }}>{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#F8FBF9" }}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

function ChannelToggle({ icon, label, desc, checked, onChange, disabled, lockedReason }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-500">{icon}</div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-gray-500">{desc}</div>
          {disabled && lockedReason && (
            <div className="text-xs mt-0.5" style={{ color: "#92400E" }}>🔒 {lockedReason}</div>
          )}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox"
               checked={!!checked}
               disabled={disabled}
               onChange={(e) => onChange(e.target.checked)}
               className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-disabled:opacity-50
                        peer-checked:after:translate-x-full peer-checked:after:border-white
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:border after:rounded-full after:h-5 after:w-5
                        after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );
}
