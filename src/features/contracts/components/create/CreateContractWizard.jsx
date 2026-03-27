import React, { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import StepGeneralInfo from "./StepGeneralInfo";
import StepHouseAndMoney from "./StepHouseAndMoney";
import StepContractClauses from "./StepContractClauses";

const STEPS = [
  { id: 1, title: "Thông tin người thuê" },
  { id: 2, title: "Nhà & chi phí" },
  { id: 3, title: "Điều khoản" },
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
  const [errors, setErrors] = useState({});

  const update = useCallback(
    (key) => (e) => {
      const value =
        e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev || !prev[key]) return prev;
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  const canSubmitStep2 =
    String(form.houseId ?? "").trim() && String(form.rentAmount ?? "").trim();

  const validateStep1 = (currentForm) => {
    const newErrors = {};
    const safeTrim = (v) => String(v ?? "").trim();
    const todayIso = new Date().toISOString().slice(0, 10);

    if (!currentForm.startDate) {
      newErrors.startDate = "Thông tin không được trống";
    }
    if (!currentForm.endDate) {
      newErrors.endDate = "Thông tin không được trống";
    }
    if (
      currentForm.startDate &&
      currentForm.endDate &&
      currentForm.startDate > currentForm.endDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (!safeTrim(currentForm.name)) {
      newErrors.name = "Thông tin không được trống";
    }

    const phone = safeTrim(currentForm.phoneNumber);
    if (!phone) {
      newErrors.phoneNumber = "Thông tin không được trống";
    } else if (!/^\d{9,11}$/.test(phone)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    const email = safeTrim(currentForm.email);
    if (!email) {
      newErrors.email = "Thông tin không được trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    } else if (!currentForm.emailChecked) {
      newErrors.email = "Vui lòng bấm “Kiểm tra” Gmail trước khi tiếp tục";
    }

    const identityNumber = safeTrim(currentForm.identityNumber);
    if (!identityNumber) {
      newErrors.identityNumber = "Thông tin không được trống";
    } else if (!/^\d{9,12}$/.test(identityNumber)) {
      newErrors.identityNumber = "Số CCCD không hợp lệ";
    }

    if (currentForm.dateOfIssue) {
      if (currentForm.dateOfIssue > todayIso) {
        newErrors.dateOfIssue =
          "Ngày cấp CCCD phải trước hoặc bằng ngày hôm nay";
      }
      if (
        currentForm.startDate &&
        currentForm.dateOfIssue > currentForm.startDate
      ) {
        newErrors.dateOfIssue =
          "Ngày cấp CCCD không được sau ngày bắt đầu hợp đồng";
      }
    }

    if (!safeTrim(currentForm.tenantAddress)) {
      newErrors.tenantAddress = "Thông tin không được trống";
    }

    return newErrors;
  };

  const validateStep2 = (currentForm) => {
    const newErrors = {};
    const safeTrim = (v) => String(v ?? "").trim();

    if (!safeTrim(currentForm.houseId)) {
      newErrors.houseId = "Vui lòng chọn hoặc nhập mã nhà";
    }

    const rentRaw = safeTrim(currentForm.rentAmount);
    const rent = Number(rentRaw);
    if (!rentRaw) {
      newErrors.rentAmount = "Vui lòng nhập tiền thuê";
    } else if (Number.isNaN(rent) || rent <= 0) {
      newErrors.rentAmount = "Tiền thuê phải là số lớn hơn 0";
    }

    const depositRaw = safeTrim(currentForm.depositAmount);
    if (depositRaw) {
      const deposit = Number(depositRaw);
      if (Number.isNaN(deposit) || deposit < 0) {
        newErrors.depositAmount = "Tiền cọc phải là số không âm";
      }
    }

    const payDateNumber = Number(currentForm.payDate);
    if (
      !Number.isFinite(payDateNumber) ||
      payDateNumber < 1 ||
      payDateNumber > 28
    ) {
      newErrors.payDate = "Ngày thanh toán phải từ 1 đến 30";
    }

    if (
      currentForm.depositDate &&
      currentForm.startDate &&
      currentForm.depositDate < currentForm.startDate
    ) {
      newErrors.depositDate =
        "Ngày đặt cọc không được trước ngày bắt đầu hợp đồng";
    }

    if (currentForm.handoverDate) {
      if (
        currentForm.startDate &&
        currentForm.handoverDate < currentForm.startDate
      ) {
        newErrors.handoverDate =
          "Ngày bàn giao không được trước ngày bắt đầu hợp đồng";
      }
      if (
        currentForm.endDate &&
        currentForm.handoverDate > currentForm.endDate
      ) {
        newErrors.handoverDate =
          "Ngày bàn giao không được sau ngày kết thúc hợp đồng";
      }
    }

    return newErrors;
  };

  const validateStep3 = (currentForm) => {
    const newErrors = {};
    const penalty = Number(currentForm.latePenaltyPercent);
    if (
      String(currentForm.latePenaltyPercent ?? "").trim() &&
      (Number.isNaN(penalty) || penalty < 0 || penalty > 100)
    ) {
      newErrors.latePenaltyPercent = "Phần trăm phạt phải từ 0 đến 100";
    }
    const copies = Number(currentForm.copies);
    if (String(currentForm.copies ?? "").trim() && (Number.isNaN(copies) || copies < 1)) {
      newErrors.copies = "Số bản hợp đồng phải ít nhất là 1";
    }
    return newErrors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const stepErrors = validateStep1(form);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length > 0) return;
    }
    if (currentStep === 2) {
      const stepErrors = validateStep2(form);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length > 0) return;
    }
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep !== STEPS.length) return;

    const step1Errors = validateStep1(form);
    const step2Errors = validateStep2(form);
    const step3Errors = validateStep3(form);
    const combinedErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    setErrors(combinedErrors);
    if (Object.keys(combinedErrors).length > 0 || !canSubmitStep2) {
      return;
    }

    onCreated?.(form);
  };

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
        {currentStep === 1 && <StepGeneralInfo form={form} update={update} errors={errors} />}
        {currentStep === 2 && <StepHouseAndMoney form={form} update={update} houses={houses} errors={errors} />}
        {currentStep === 3 && <StepContractClauses form={form} update={update} errors={errors} />}

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
