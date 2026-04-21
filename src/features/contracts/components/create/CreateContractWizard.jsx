import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import StepGeneralInfo from "./StepGeneralInfo";
import StepHouseAndMoney from "./StepHouseAndMoney";
import StepContractClauses from "./StepContractClauses";

const STEP_KEYS = ["contracts.wizard.step1", "contracts.wizard.step2", "contracts.wizard.step3"];

export default function CreateContractWizard({
  initialForm,
  onCancel,
  onCreated,
  houses = [],
  disabled = false,
}) {
  const { t } = useTranslation("common");
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

    if (!currentForm.startDate) newErrors.startDate = t("contracts.validation.required");
    if (!currentForm.endDate)   newErrors.endDate   = t("contracts.validation.required");
    if (currentForm.startDate && currentForm.endDate && currentForm.startDate > currentForm.endDate) {
      newErrors.endDate = t("contracts.validation.endDateAfterStart");
    }

    if (!safeTrim(currentForm.name)) newErrors.name = t("contracts.validation.required");

    const phone = safeTrim(currentForm.phoneNumber);
    if (!phone) {
      newErrors.phoneNumber = t("contracts.validation.required");
    } else if (!/^\d{9,11}$/.test(phone)) {
      newErrors.phoneNumber = t("contracts.validation.invalidPhone");
    }

    const email = safeTrim(currentForm.email);
    if (!email) {
      newErrors.email = t("contracts.validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("contracts.validation.invalidEmail");
    } else if (!currentForm.emailChecked) {
      newErrors.email = t("contracts.validation.checkEmailFirst");
    }

    const identityNumber = safeTrim(currentForm.identityNumber);
    if (!identityNumber) {
      newErrors.identityNumber = t("contracts.validation.required");
    } else if (!/^\d{9,12}$/.test(identityNumber)) {
      newErrors.identityNumber = t("contracts.validation.invalidId");
    }

    if (currentForm.dateOfIssue) {
      if (currentForm.dateOfIssue > todayIso) {
        newErrors.dateOfIssue = t("contracts.validation.idIssueFuture");
      }
      if (currentForm.startDate && currentForm.dateOfIssue > currentForm.startDate) {
        newErrors.dateOfIssue = t("contracts.validation.idIssueAfterStart");
      }
    }

    if (!safeTrim(currentForm.tenantAddress)) newErrors.tenantAddress = t("contracts.validation.required");

    return newErrors;
  };

  const validateStep2 = (currentForm) => {
    const newErrors = {};
    const safeTrim = (v) => String(v ?? "").trim();

    if (!safeTrim(currentForm.houseId)) newErrors.houseId = t("contracts.validation.selectHouse");

    const rentRaw = safeTrim(currentForm.rentAmount);
    const rent = Number(rentRaw);
    if (!rentRaw) {
      newErrors.rentAmount = t("contracts.validation.enterRent");
    } else if (Number.isNaN(rent) || rent <= 0) {
      newErrors.rentAmount = t("contracts.validation.invalidRent");
    }

    const depositRaw = safeTrim(currentForm.depositAmount);
    if (!depositRaw) {
      newErrors.depositAmount = t("contracts.validation.enterDeposit");
    } else {
      const deposit = Number(depositRaw);
      if (Number.isNaN(deposit) || deposit < 0) {
        newErrors.depositAmount = t("contracts.validation.invalidDeposit");
      } else {
        const r = Number(safeTrim(currentForm.rentAmount));
        if (r > 0 && (deposit < r || deposit > r * 3)) {
          newErrors.depositAmount = t("contracts.validation.depositRange");
        }
      }
    }

    if (!safeTrim(currentForm.depositDate))  newErrors.depositDate  = t("contracts.validation.selectDepositDate");
    if (!safeTrim(currentForm.handoverDate)) newErrors.handoverDate = t("contracts.validation.selectHandoverDate");

    const payDateNumber = Number(currentForm.payDate);
    if (!Number.isFinite(payDateNumber) || payDateNumber < 1 || payDateNumber > 28) {
      newErrors.payDate = t("contracts.validation.payDateRange");
    }

    if (currentForm.depositDate && currentForm.startDate && currentForm.depositDate < currentForm.startDate) {
      newErrors.depositDate = t("contracts.validation.depositBeforeStart");
    }

    if (currentForm.handoverDate) {
      if (currentForm.startDate && currentForm.handoverDate < currentForm.startDate) {
        newErrors.handoverDate = t("contracts.validation.handoverBeforeStart");
      }
      if (currentForm.endDate && currentForm.handoverDate > currentForm.endDate) {
        newErrors.handoverDate = t("contracts.validation.handoverAfterEnd");
      }
    }

    return newErrors;
  };

  const validateStep3 = (currentForm) => {
    const newErrors = {};
    const safeTrim = (v) => String(v ?? "").trim();

    if (!safeTrim(currentForm.area))          newErrors.area          = t("contracts.validation.required");
    if (!safeTrim(currentForm.structure))     newErrors.structure     = t("contracts.validation.required");
    if (!safeTrim(currentForm.ownershipDocs)) newErrors.ownershipDocs = t("contracts.validation.required");

    const numericFields = [
      "lateDays", "maxLateDays", "cureDays", "renewNoticeDays",
      "landlordNoticeDays", "forceMajeureNoticeHours", "disputeDays",
    ];
    for (const key of numericFields) {
      const raw = safeTrim(currentForm[key]);
      if (!raw) {
        newErrors[key] = t("contracts.validation.required");
      } else if (Number.isNaN(Number(raw)) || Number(raw) < 0) {
        newErrors[key] = t("contracts.validation.required");
      }
    }

    const eachKeepRaw = safeTrim(currentForm.eachKeep);
    if (!eachKeepRaw) {
      newErrors.eachKeep = t("contracts.validation.required");
    } else if (Number.isNaN(Number(eachKeepRaw)) || Number(eachKeepRaw) < 1) {
      newErrors.eachKeep = t("contracts.validation.required");
    }

    if (!safeTrim(currentForm.disputeForum)) newErrors.disputeForum = t("contracts.validation.required");

    const penaltyRaw = safeTrim(currentForm.latePenaltyPercent);
    if (!penaltyRaw) {
      newErrors.latePenaltyPercent = t("contracts.validation.required");
    } else {
      const penalty = Number(penaltyRaw);
      if (Number.isNaN(penalty) || penalty < 0 || penalty > 100) {
        newErrors.latePenaltyPercent = t("contracts.validation.penaltyRange");
      }
    }

    const copiesRaw = safeTrim(currentForm.copies);
    if (!copiesRaw) {
      newErrors.copies = t("contracts.validation.required");
    } else if (Number.isNaN(Number(copiesRaw)) || Number(copiesRaw) < 1) {
      newErrors.copies = t("contracts.validation.copiesMin");
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
    if (currentStep < STEP_KEYS.length) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep !== STEP_KEYS.length) return;

    const combinedErrors = {
      ...validateStep1(form),
      ...validateStep2(form),
      ...validateStep3(form),
    };
    setErrors(combinedErrors);
    if (Object.keys(combinedErrors).length > 0 || !canSubmitStep2) return;

    onCreated?.(form);
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEP_KEYS.map((titleKey, idx) => {
          const stepId = idx + 1;
          const isActive = stepId === currentStep;
          const isPast   = stepId < currentStep;
          return (
            <React.Fragment key={titleKey}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-teal-600 text-white" : isPast ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-500"
                }`}
              >
                <span>{stepId}.</span>
                <span>{t(titleKey)}</span>
              </div>
              {idx < STEP_KEYS.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-200 rounded" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form id="create-contract-wizard-form" onSubmit={handleSubmit} className="space-y-6">
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
              {currentStep === 1 ? t("contracts.wizard.backToList") : t("contracts.wizard.prevStep")}
            </button>
            {currentStep < STEP_KEYS.length && (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 disabled:hover:bg-teal-300 transition"
              >
                {t("contracts.wizard.nextStep")}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {currentStep === STEP_KEYS.length && (
            <button
              type="submit"
              disabled={!canSubmitStep2 || disabled}
              className="px-4 py-2 bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 disabled:hover:bg-teal-300 transition"
            >
              <Save className="w-4 h-4" />
              {disabled ? t("contracts.wizard.saving") : t("contracts.wizard.save")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
