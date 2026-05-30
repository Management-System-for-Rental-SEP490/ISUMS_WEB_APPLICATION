import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function OtpInput({ value, onChange }) {
  const inputRefs = useRef([]);
  const digits = value.split("");
  while (digits.length < 6) digits.push("");

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    onChange(next.join(""));
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition bg-slate-50 text-slate-800"
        />
      ))}
    </div>
  );
}

const RESEND_COOLDOWN = 60;

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visibleStart = Math.min(3, Math.floor(local.length / 2));
  const visibleEnd = local.length > 5 ? 2 : 0;
  return (
    local.slice(0, visibleStart) +
    "****" +
    (visibleEnd > 0 ? local.slice(-visibleEnd) : "") +
    "@" +
    domain
  );
}

export default function OtpModal({
  open,
  onClose,
  onSubmit,
  onResend,
  loading,
  otpEmail,
}) {
  const { t } = useTranslation("common");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (open) {
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = () => {
    if (otp.length !== 6) {
      toast.error(t("contracts.otp.otpLength"));
      return;
    }
    onSubmit(otp);
  };

  const handleResend = async () => {
    if (!onResend || resending || cooldown > 0) return;
    setResending(true);
    try {
      await onResend();
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setResending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{t("contracts.otp.title")}</h2>
          {!loading && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-7 h-7 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">{t("contracts.otp.enterOtp")}</p>
            <p className="text-xs text-slate-500 mt-1">
              {otpEmail
                ? t("contracts.otp.sentToEmail", { email: maskEmail(otpEmail) })
                : t("contracts.otp.sentGeneric")}
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} />

          {/* Resend OTP */}
          <div className="text-center -mt-1">
            {cooldown > 0 ? (
              <p className="text-xs text-slate-400">
                {t("contracts.otp.resendAfter", { seconds: cooldown })}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium underline underline-offset-2 transition disabled:opacity-50"
              >
                {resending ? t("contracts.otp.resending") : t("contracts.otp.resend")}
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={otp.length !== 6 || loading}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t("contracts.otp.signing")}
                </>
              ) : (
                t("contracts.otp.confirm")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
