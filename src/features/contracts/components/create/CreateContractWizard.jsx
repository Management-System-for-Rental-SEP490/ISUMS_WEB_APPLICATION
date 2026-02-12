import React, { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import StepGeneralInfo from "./StepGeneralInfo";
import StepHouseAndMoney from "./StepHouseAndMoney";

const STEPS = [
  { id: 1, title: "Thông tin người thuê", component: StepGeneralInfo },
  { id: 2, title: "Nhà và chi phí liên quan", component: StepHouseAndMoney },
];

export default function CreateContractWizard({
  initialForm,
  onCancel,
  onCreated,
  houses = [],
  disabled = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(1);

  const update = useCallback(
    (key) => (e) => {
      const value =
        e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const canProceedStep1 =
    form.startDate &&
    form.endDate &&
    String(form.name ?? "").trim() &&
    String(form.phoneNumber ?? "").trim() &&
    String(form.email ?? "").trim() &&
    String(form.identityNumber ?? "").trim() &&
    String(form.tenantAddress ?? "").trim();

  const canSubmitStep2 =
    String(form.houseId ?? "").trim() && String(form.rentAmount ?? "").trim();

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep !== STEPS.length || !canSubmitStep2) return;
    onCreated?.(form);
  };

  const StepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : isPast
                      ? "bg-teal-100 text-teal-800"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                <span>{step.id}.</span>
                <span>{step.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-200 rounded" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form
        id="create-contract-wizard-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {currentStep === 1 ? (
          <StepGeneralInfo form={form} update={update} />
        ) : (
          <StepHouseAndMoney form={form} update={update} houses={houses} />
        )}

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : handleBack}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? "Quay lại danh sách" : "Bước trước"}
            </button>
            {currentStep < STEPS.length && (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceedStep1}
                className="px-4 py-2 bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 disabled:hover:bg-teal-300 transition"
              >
                Tiếp theo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {currentStep === STEPS.length && (
            <button
              type="submit"
              disabled={!canSubmitStep2 || disabled}
              className="px-4 py-2 bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 disabled:hover:bg-teal-300 transition"
            >
              <Save className="w-4 h-4" />
              {disabled ? "Đang lưu..." : "Lưu hợp đồng"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
