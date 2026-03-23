import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, X } from "lucide-react";

const STEPS = ["Thông tin cơ bản", "Chọn bất động sản", "Lịch chu kỳ"];

const TYPE_OPTIONS = [
  { value: "ELECTRICAL", label: "Hệ thống điện",       desc: "Kiểm tra điện, ổ cắm, aptomat..." },
  { value: "PLUMBING",   label: "Hệ thống nước",        desc: "Đường ống, van, bơm nước..."       },
  { value: "HVAC",       label: "Điều hòa / thông gió", desc: "Máy lạnh, quạt thông gió..."       },
  { value: "GENERAL",    label: "Bảo dưỡng chung",      desc: "Vệ sinh, sơn tường, cửa..."        },
];

const CYCLE_OPTIONS = [
  { value: "WEEKLY",    label: "Hàng tuần",  desc: "Mỗi 7 ngày"    },
  { value: "MONTHLY",   label: "Hàng tháng", desc: "Mỗi 30 ngày"   },
  { value: "QUARTERLY", label: "Hàng quý",   desc: "Mỗi 3 tháng"   },
  { value: "YEARLY",    label: "Hàng năm",   desc: "Mỗi 12 tháng"  },
];

// Mock houses — swap with API later
const MOCK_HOUSES = [
  { id: "h1", name: "Vinhomes Central Park - Tòa B", address: "208 Nguyễn Hữu Cảnh, Bình Thạnh" },
  { id: "h2", name: "Masteri Thảo Điền",             address: "159 Xa Lộ Hà Nội, Quận 2"        },
  { id: "h3", name: "Saigon Pearl",                  address: "92 Nguyễn Hữu Cảnh, Bình Thạnh"  },
  { id: "h4", name: "The Sun Avenue",                address: "28 Mai Chí Thọ, Quận 2"           },
];

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";
const lbl = "block text-sm font-semibold text-slate-700 mb-1.5";

const INITIAL_FORM = { name: "", description: "", type: "", houseId: "", cycle: "", startDate: "", note: "" };

export default function CreatePlanDrawer({ open, onClose, onCreated }) {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const setField = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Vui lòng nhập tên kế hoạch";
      if (!form.type)        e.type = "Vui lòng chọn loại bảo trì";
    }
    if (step === 1) {
      if (!form.houseId) e.houseId = "Vui lòng chọn bất động sản";
    }
    if (step === 2) {
      if (!form.cycle)     e.cycle     = "Vui lòng chọn chu kỳ";
      if (!form.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const prev = () => setStep((s) => s - 1);

  const handleClose = () => {
    setStep(0);
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    // TODO: gọi createMaintenancePlan(form) khi có API
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    handleClose();
    onCreated?.();
  };

  const selectedHouse = MOCK_HOUSES.find((h) => h.id === form.houseId);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tạo kế hoạch bảo trì</h3>
            <p className="text-xs text-slate-400 mt-0.5">Bước {step + 1}/{STEPS.length} — {STEPS[step]}</p>
          </div>
          <button type="button" onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                  i < step  ? "bg-teal-600 text-white" :
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
                  placeholder="VD: Kiểm tra hệ thống điện định kỳ..."
                  className={`${inp} ${errors.name ? "border-red-400" : ""}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className={lbl}>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  placeholder="Mô tả nội dung bảo trì..."
                  className={`${inp} resize-none`}
                />
              </div>

              <div>
                <label className={lbl}>Loại bảo trì <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {TYPE_OPTIONS.map((t) => (
                    <button key={t.value} type="button" onClick={() => setField("type", t.value)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition ${
                        form.type === t.value
                          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      }`}>
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${form.type === t.value ? "bg-teal-500" : "bg-slate-300"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${form.type === t.value ? "text-teal-700" : "text-slate-700"}`}>{t.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.type && <p className="mt-2 text-xs text-red-500">{errors.type}</p>}
              </div>
            </div>
          )}

          {/* ── Step 1: Chọn BĐS ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Chọn bất động sản áp dụng kế hoạch này:</p>
              {MOCK_HOUSES.map((h) => (
                <button key={h.id} type="button" onClick={() => setField("houseId", h.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                    form.houseId === h.id
                      ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                      : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                  }`}>
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-teal-700">{h.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${form.houseId === h.id ? "text-teal-700" : "text-slate-700"}`}>{h.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{h.address}</p>
                  </div>
                  {form.houseId === h.id && <Check className="w-4 h-4 text-teal-600 flex-shrink-0 ml-auto" />}
                </button>
              ))}
              {errors.houseId && <p className="text-xs text-red-500">{errors.houseId}</p>}
            </div>
          )}

          {/* ── Step 2: Lịch chu kỳ ── */}
          {step === 2 && (
            <div className="space-y-5">
              {selectedHouse && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-teal-500 font-medium">Bất động sản đã chọn</p>
                  <p className="text-sm font-semibold text-teal-800 mt-0.5">{selectedHouse.name}</p>
                </div>
              )}

              <div>
                <label className={lbl}>Chu kỳ thực hiện <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {CYCLE_OPTIONS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setField("cycle", c.value)}
                      className={`flex flex-col px-4 py-3 rounded-xl border text-left transition ${
                        form.cycle === c.value
                          ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      }`}>
                      <span className={`text-sm font-semibold ${form.cycle === c.value ? "text-teal-700" : "text-slate-700"}`}>{c.label}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{c.desc}</span>
                    </button>
                  ))}
                </div>
                {errors.cycle && <p className="mt-1 text-xs text-red-500">{errors.cycle}</p>}
              </div>

              <div>
                <label className={lbl}>Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  className={`${inp} ${errors.startDate ? "border-red-400" : ""}`}
                />
                {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
              </div>

              <div>
                <label className={lbl}>Ghi chú thêm</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setField("note", e.target.value)}
                  rows={3}
                  placeholder="Lưu ý khi thực hiện bảo trì..."
                  className={`${inp} resize-none`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button type="button" onClick={step === 0 ? handleClose : prev}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Hủy" : "Quay lại"}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition">
              Tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
              {submitting ? "Đang tạo..." : "Tạo kế hoạch"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
