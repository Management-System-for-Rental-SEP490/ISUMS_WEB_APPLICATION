import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Plus, X } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { createMaintenancePlan } from "../api/maintenance.api";

const STEPS = ["Thông tin cơ bản", "Chu kỳ bảo trì", "Thời gian hiệu lực"];

const FREQUENCY_TYPE_OPTIONS = [
  { value: "MONTHLY", label: "Theo tháng", desc: "Số lần thực hiện mỗi tháng" },
];

const lbl = "block text-sm font-semibold text-slate-700 mb-1.5";
const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";

const INITIAL_FORM = {
  name: "",
  frequencyType: "MONTHLY",
  frequencyValue: 1,
  effectiveFrom: "",
  effectiveTo: "",
  nextRunAt: "",
};

export default function CreatePlanDrawer({ open, onClose, onCreated }) {
  const [mounted, setMounted]         = useState(false);
  const [visible, setVisible]         = useState(false);
  const [step, setStep]               = useState(0);
  const [form, setForm]               = useState(INITIAL_FORM);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const setField = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Vui lòng nhập tên kế hoạch";
    }
    if (step === 1) {
      if (!form.frequencyType)                              e.frequencyType  = "Vui lòng chọn loại chu kỳ";
      if (!form.frequencyValue || form.frequencyValue < 1) e.frequencyValue = "Số lần phải ít nhất là 1";
    }
    if (step === 2) {
      if (!form.effectiveFrom) e.effectiveFrom = "Vui lòng chọn ngày bắt đầu hiệu lực";
      if (!form.effectiveTo)   e.effectiveTo   = "Vui lòng chọn ngày kết thúc hiệu lực";
      if (!form.nextRunAt)     e.nextRunAt     = "Vui lòng chọn ngày bắt đầu kế hoạch";
      if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom)
        e.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
      if (form.effectiveFrom && form.nextRunAt && form.nextRunAt < form.effectiveFrom)
        e.nextRunAt = "Ngày bắt đầu kế hoạch phải trong thời gian hiệu lực";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const prev = () => setStep((s) => s - 1);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setStep(0);
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitError(null);
      onClose();
    }, 300);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createMaintenancePlan({
        name:           form.name.trim(),
        frequencyType:  form.frequencyType,
        frequencyValue: form.frequencyValue,
        effectiveFrom:  form.effectiveFrom,
        effectiveTo:    form.effectiveTo,
        nextRunAt:      form.nextRunAt,
      });
      handleClose();
      onCreated?.();
    } catch (e) {
      setSubmitError(e.message ?? "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(3px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{
          maxHeight: "90vh",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity 300ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-shrink-0">
          <div>
            <h3 className="text-[17px] font-bold text-slate-800 leading-tight">Tạo kế hoạch bảo trì</h3>
            <p className="text-xs text-slate-400 mt-0.5">Bước {step + 1}/{STEPS.length} — {STEPS[step]}</p>
          </div>
          <button type="button" onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  i < step   ? "bg-teal-600 text-white" :
                  i === step ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                               "bg-slate-100 text-slate-400"
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium truncate ${i === step ? "text-teal-700" : "text-slate-400"}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200 flex-shrink-0 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 0: Thông tin cơ bản ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className={lbl}>Tên kế hoạch <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="VD: Bảo trì hệ thống điện tháng 4..."
                  className={`${inp} ${errors.name ? "border-red-400" : ""}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
            </div>
          )}

          {/* ── Step 1: Chu kỳ bảo trì ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className={lbl}>Loại chu kỳ <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {FREQUENCY_TYPE_OPTIONS.map((t) => (
                    <button key={t.value} type="button" onClick={() => setField("frequencyType", t.value)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition ${
                        form.frequencyType === t.value
                          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      }`}>
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${form.frequencyType === t.value ? "bg-teal-500" : "bg-slate-300"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${form.frequencyType === t.value ? "text-teal-700" : "text-slate-700"}`}>{t.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.frequencyType && <p className="mt-1 text-xs text-red-500">{errors.frequencyType}</p>}
              </div>

              <div>
                <label className={lbl}>Số lần thực hiện / tháng <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-400 mb-3">Số lần bảo trì được thực hiện trong một tháng</p>
                <div className="flex items-center gap-4 mb-4">
                  <button type="button"
                    onClick={() => setField("frequencyValue", Math.max(1, form.frequencyValue - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-teal-700">{form.frequencyValue}</span>
                    <p className="text-xs text-slate-400 mt-0.5">lần / tháng</p>
                  </div>
                  <button type="button"
                    onClick={() => setField("frequencyValue", Math.min(12, form.frequencyValue + 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((v) => (
                    <button key={v} type="button" onClick={() => setField("frequencyValue", v)}
                      className={`py-2 rounded-xl border text-sm font-semibold transition ${
                        form.frequencyValue === v
                          ? "border-teal-500 bg-teal-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                      }`}>
                      {v}x
                    </button>
                  ))}
                </div>
                {errors.frequencyValue && <p className="mt-2 text-xs text-red-500">{errors.frequencyValue}</p>}
              </div>
            </div>
          )}

          {/* ── Step 2: Thời gian hiệu lực ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs text-teal-500 font-medium">Tóm tắt kế hoạch</p>
                <p className="text-sm font-semibold text-teal-800">{form.name}</p>
                <p className="text-xs text-teal-600">
                  Bảo trì <strong>{form.frequencyValue} lần / tháng</strong>
                </p>
              </div>

              <div>
                <label className={lbl}>Ngày bắt đầu hiệu lực <span className="text-red-500">*</span></label>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                  status={errors.effectiveFrom ? "error" : ""}
                  value={form.effectiveFrom ? dayjs(form.effectiveFrom) : null}
                  onChange={(date) => setField("effectiveFrom", date ? date.format("YYYY-MM-DD") : "")}
                />
                {errors.effectiveFrom && <p className="mt-1 text-xs text-red-500">{errors.effectiveFrom}</p>}
              </div>

              <div>
                <label className={lbl}>Ngày kết thúc hiệu lực <span className="text-red-500">*</span></label>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày kết thúc"
                  status={errors.effectiveTo ? "error" : ""}
                  value={form.effectiveTo ? dayjs(form.effectiveTo) : null}
                  disabledDate={(d) => form.effectiveFrom ? d.isBefore(dayjs(form.effectiveFrom), "day") : false}
                  onChange={(date) => setField("effectiveTo", date ? date.format("YYYY-MM-DD") : "")}
                />
                {errors.effectiveTo && <p className="mt-1 text-xs text-red-500">{errors.effectiveTo}</p>}
              </div>

              <div>
                <label className={lbl}>Ngày bắt đầu kế hoạch <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Mốc thời gian để hệ thống tạo lịch bảo trì đầu tiên
                </p>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu kế hoạch"
                  status={errors.nextRunAt ? "error" : ""}
                  value={form.nextRunAt ? dayjs(form.nextRunAt) : null}
                  disabledDate={(d) => {
                    if (form.effectiveFrom && d.isBefore(dayjs(form.effectiveFrom), "day")) return true;
                    if (form.effectiveTo && d.isAfter(dayjs(form.effectiveTo), "day")) return true;
                    return false;
                  }}
                  onChange={(date) => setField("nextRunAt", date ? date.format("YYYY-MM-DD") : "")}
                />
                {errors.nextRunAt && <p className="mt-1 text-xs text-red-500">{errors.nextRunAt}</p>}
              </div>

              {submitError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {submitError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={step === 0 ? handleClose : prev}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Hủy" : "Quay lại"}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition shadow-sm">
              Tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-[2] py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? "Đang tạo..." : "Tạo kế hoạch"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
