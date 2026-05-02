import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Minus,
  Plus,
  Repeat2,
  X,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { createMaintenancePlan } from "../api/maintenance.api";
import MultiLangInput from "../../../components/shared/i18n/MultiLangInput";

const RESERVED_TRANSLATION_KEYS = new Set(["_source", "_auto"]);
const FREQUENCY_TYPE_OPTIONS = ["MONTHLY"];

const pickPrimary = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";

  const sourceLocale = value._source;
  if (sourceLocale && typeof value[sourceLocale] === "string" && value[sourceLocale].trim()) {
    return value[sourceLocale].trim();
  }

  for (const [key, text] of Object.entries(value)) {
    if (RESERVED_TRANSLATION_KEYS.has(key)) continue;
    if (typeof text === "string" && text.trim()) return text.trim();
  }
  return "";
};

const emptyForm = () => ({
  name: {},
  frequencyType: "MONTHLY",
  frequencyValue: 1,
  effectiveFrom: "",
  effectiveTo: "",
  nextRunAt: "",
});

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";
const fieldShellClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

export default function CreatePlanDrawer({ open, onClose, onCreated, t }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const steps = useMemo(
    () => [
      {
        title: t("maintenance.createStep0"),
        icon: ClipboardList,
      },
      {
        title: t("maintenance.createStep1"),
        icon: Repeat2,
      },
      {
        title: t("maintenance.createStep2"),
        icon: CalendarDays,
      },
    ],
    [t],
  );

  const planName = pickPrimary(form.name);

  useEffect(() => {
    let mountTimer;
    let closeTimer;
    let firstFrame;
    let secondFrame;

    if (open) {
      mountTimer = window.setTimeout(() => {
        setMounted(true);
        firstFrame = requestAnimationFrame(() => {
          secondFrame = requestAnimationFrame(() => setVisible(true));
        });
      }, 0);
    } else {
      firstFrame = requestAnimationFrame(() => setVisible(false));
      closeTimer = window.setTimeout(() => setMounted(false), 260);
    }

    return () => {
      window.clearTimeout(mountTimer);
      window.clearTimeout(closeTimer);
      if (firstFrame) cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [open]);

  if (!mounted) return null;

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const validateStep = () => {
    const nextErrors = {};

    if (step === 0 && !pickPrimary(form.name)) {
      nextErrors.name = t("maintenance.createErrorName");
    }

    if (step === 1) {
      if (!form.frequencyType) nextErrors.frequencyType = t("maintenance.createErrorFreqType");
      if (!form.frequencyValue || Number(form.frequencyValue) < 1) {
        nextErrors.frequencyValue = t("maintenance.createErrorFreqValue");
      }
    }

    if (step === 2) {
      if (!form.effectiveFrom) nextErrors.effectiveFrom = t("maintenance.createErrorEffectiveFrom");
      if (!form.effectiveTo) nextErrors.effectiveTo = t("maintenance.createErrorEffectiveTo");
      if (!form.nextRunAt) nextErrors.nextRunAt = t("maintenance.createErrorNextRunAt");
      if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
        nextErrors.effectiveTo = t("maintenance.createErrorEffectiveToOrder");
      }
      if (form.effectiveFrom && form.nextRunAt && form.nextRunAt < form.effectiveFrom) {
        nextErrors.nextRunAt = t("maintenance.createErrorNextRunAtOrder");
      }
      if (form.effectiveTo && form.nextRunAt && form.nextRunAt > form.effectiveTo) {
        nextErrors.nextRunAt = t("maintenance.createErrorNextRunAtOrder");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setStep(0);
      setForm(emptyForm());
      setErrors({});
      setSubmitError(null);
      setSubmitting(false);
      onClose();
    }, 260);
  };

  const handleNext = () => {
    if (validateStep()) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handlePrevious = () => setStep((current) => Math.max(current - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await createMaintenancePlan({
        name: planName,
        nameTranslations: form.name,
        frequencyType: form.frequencyType,
        frequencyValue: Number(form.frequencyValue),
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo,
        nextRunAt: form.nextRunAt,
      });
      handleClose();
      onCreated?.();
    } catch (error) {
      setSubmitError(error.message ?? t("maintenance.createErrorGeneral"));
      setSubmitting(false);
    }
  };

  const dateDisabledBefore = (date, boundary) => (
    boundary ? date.isBefore(dayjs(boundary), "day") : false
  );

  const dateDisabledAfter = (date, boundary) => (
    boundary ? date.isAfter(dayjs(boundary), "day") : false
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
      onClick={handleClose}
    >
      <section
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] bg-slate-50 shadow-2xl ring-1 ring-slate-900/10 transition-all duration-200"
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(18px) scale(0.98)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900">
                  {t("maintenance.createTitle")}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {t("maintenance.createStepIndicator", {
                    current: step + 1,
                    total: steps.length,
                    step: steps[step].title,
                  })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={t("maintenance.btnCancel")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const done = index < step;
              const active = index === step;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    if (index <= step) setStep(index);
                  }}
                  className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-teal-300 bg-teal-50 text-teal-800"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-teal-600 text-white" : done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{item.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className={fieldShellClass}>
                <MultiLangInput
                  value={form.name}
                  onChange={(value) => setField("name", value)}
                  label={t("maintenance.createLabelName")}
                  placeholder={t("maintenance.createPlaceholderName")}
                  resourceType="maintenance-plan.name"
                  intent="STAFF_INTERNAL"
                  isRequired
                />
                {errors.name ? <p className="mt-2 text-xs font-medium text-red-600">{errors.name}</p> : null}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className={fieldShellClass}>
                <label className={labelClass}>
                  {t("maintenance.createLabelFreqType")} <span className="text-red-500">*</span>
                </label>
                <div className="mt-3 space-y-2">
                  {FREQUENCY_TYPE_OPTIONS.map((value) => {
                    const selected = form.frequencyType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField("frequencyType", value)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-teal-300 bg-teal-50 ring-2 ring-teal-100"
                            : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Repeat2 className="h-5 w-5" />
                        </span>
                        <span>
                          <span className={`block text-sm font-bold ${selected ? "text-teal-800" : "text-slate-800"}`}>
                            {t("maintenance.createFreqMonthly")}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {t("maintenance.createFreqMonthlyDesc")}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.frequencyType ? <p className="mt-2 text-xs font-medium text-red-600">{errors.frequencyType}</p> : null}
              </div>

              <div className={fieldShellClass}>
                <label className={labelClass}>
                  {t("maintenance.createLabelFreqValue")} <span className="text-red-500">*</span>
                </label>
                <p className="mt-2 text-xs text-slate-500">{t("maintenance.createFreqValueHint")}</p>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setField("frequencyValue", Math.max(1, Number(form.frequencyValue) - 1))}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <p className="text-4xl font-black tracking-tight text-slate-900">{form.frequencyValue}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{t("maintenance.createFreqValueUnit")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("frequencyValue", Math.min(12, Number(form.frequencyValue) + 1))}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField("frequencyValue", value)}
                      className={`rounded-xl border py-2 text-sm font-bold transition ${
                        Number(form.frequencyValue) === value
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      {value}x
                    </button>
                  ))}
                </div>
                {errors.frequencyValue ? <p className="mt-2 text-xs font-medium text-red-600">{errors.frequencyValue}</p> : null}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
              <aside className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                  {t("maintenance.createSummaryTitle")}
                </p>
                <p className="mt-2 text-base font-black leading-snug text-slate-900">
                  {planName || t("maintenance.createPlaceholderName")}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Repeat2 className="h-4 w-4" />
                    <span className="font-semibold">
                      {t("maintenance.createSummaryFreq", { value: form.frequencyValue })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    <span className="font-medium">{t("maintenance.createLabelNextRunAt")}</span>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <div className={fieldShellClass}>
                  <label className={labelClass}>
                    {t("maintenance.createLabelEffectiveFrom")} <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    className="mt-2 w-full"
                    format="DD/MM/YYYY"
                    placeholder={t("maintenance.createPlaceholderEffectiveFrom")}
                    status={errors.effectiveFrom ? "error" : ""}
                    value={form.effectiveFrom ? dayjs(form.effectiveFrom) : null}
                    onChange={(date) => setField("effectiveFrom", date ? date.format("YYYY-MM-DD") : "")}
                  />
                  {errors.effectiveFrom ? <p className="mt-2 text-xs font-medium text-red-600">{errors.effectiveFrom}</p> : null}
                </div>

                <div className={fieldShellClass}>
                  <label className={labelClass}>
                    {t("maintenance.createLabelEffectiveTo")} <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    className="mt-2 w-full"
                    format="DD/MM/YYYY"
                    placeholder={t("maintenance.createPlaceholderEffectiveTo")}
                    status={errors.effectiveTo ? "error" : ""}
                    value={form.effectiveTo ? dayjs(form.effectiveTo) : null}
                    disabledDate={(date) => dateDisabledBefore(date, form.effectiveFrom)}
                    onChange={(date) => setField("effectiveTo", date ? date.format("YYYY-MM-DD") : "")}
                  />
                  {errors.effectiveTo ? <p className="mt-2 text-xs font-medium text-red-600">{errors.effectiveTo}</p> : null}
                </div>

                <div className={fieldShellClass}>
                  <label className={labelClass}>
                    {t("maintenance.createLabelNextRunAt")} <span className="text-red-500">*</span>
                  </label>
                  <p className="mt-1 text-xs text-slate-500">{t("maintenance.createNextRunAtHint")}</p>
                  <DatePicker
                    className="mt-2 w-full"
                    format="DD/MM/YYYY"
                    placeholder={t("maintenance.createPlaceholderNextRunAt")}
                    status={errors.nextRunAt ? "error" : ""}
                    value={form.nextRunAt ? dayjs(form.nextRunAt) : null}
                    disabledDate={(date) => (
                      dateDisabledBefore(date, form.effectiveFrom) || dateDisabledAfter(date, form.effectiveTo)
                    )}
                    onChange={(date) => setField("nextRunAt", date ? date.format("YYYY-MM-DD") : "")}
                  />
                  {errors.nextRunAt ? <p className="mt-2 text-xs font-medium text-red-600">{errors.nextRunAt}</p> : null}
                </div>

                {submitError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitError}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </main>

        <footer className="flex shrink-0 gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={step === 0 ? handleClose : handlePrevious}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? t("maintenance.btnCancel") : t("maintenance.btnBack")}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              {t("maintenance.btnNext")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t("maintenance.btnSubmitting") : t("maintenance.btnSubmit")}
            </button>
          )}
        </footer>
      </section>
    </div>,
    document.body,
  );
}
