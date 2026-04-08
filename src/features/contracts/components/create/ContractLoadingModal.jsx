import { useState, useEffect } from "react";

export default function ContractLoadingModal({
  isOpen,
  isApiDone,
  isError,
  errorMessage,
  onSuccess,
  onRetry,
  onClose,
}) {
  const [timePassed, setTimePassed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset khi modal đóng/mở lại
  useEffect(() => {
    if (!isOpen) {
      setTimePassed(0);
      setIsComplete(false);
      return;
    }
    const timer = setInterval(() => {
      setTimePassed((prev) => prev + 50);
    }, 50);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Đánh dấu complete khi đủ 9s VÀ API done (chỉ set 1 lần)
  useEffect(() => {
    if (timePassed >= 9000 && isApiDone && !isError && !isComplete) {
      setIsComplete(true);
    }
  }, [timePassed, isApiDone, isError, isComplete]);

  // Khi isComplete → đợi 600ms rồi gọi onSuccess (deps ổn định, không bị clear sớm)
  useEffect(() => {
    if (!isComplete) return;
    const t = setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 600);
    return () => clearTimeout(t);
  }, [isComplete, onSuccess]);

  if (!isOpen) return null;

  // --- State: ERROR ---
  if (isError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white w-full max-w-[460px] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="h-36 bg-gradient-to-b from-[#c0392b] to-[#e74c3c] flex items-center justify-center relative">
            <svg
              className="w-16 h-16 text-white/20 absolute"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center z-10">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="pt-8 px-8 pb-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Tạo hợp đồng thất bại
            </h2>
            <p className="text-slate-500 text-[14px] text-center mb-6 px-2 leading-relaxed">
              {errorMessage || "Đã có lỗi xảy ra, vui lòng thử lại."}
            </p>
            <div className="w-full flex flex-col gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full py-3 bg-[#357792] hover:bg-[#2d6f8a] text-white font-semibold rounded-xl transition-colors"
                >
                  Thử lại
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#F8F9FA] py-3.5 flex items-center justify-center gap-2 mt-auto">
            <span className="w-2 h-2 rounded-full bg-[#8E9A68]"></span>
            <span className="text-[11px] font-bold text-slate-600 tracking-wider">
              ISUMS Hệ thống quản lý nhà cho thuê thông minh
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Logic step & progress ---
  let currentStep = 1;
  let progress = 0;

  if (timePassed < 3000) {
    currentStep = 1;
    progress = (timePassed / 9000) * 100;
  } else if (timePassed < 6000) {
    currentStep = 2;
    progress = (timePassed / 9000) * 100;
  } else if (timePassed < 9000) {
    currentStep = 3;
    progress = (timePassed / 9000) * 100;
  } else {
    if (isApiDone) {
      currentStep = 4;
      progress = 100;
    } else {
      currentStep = 4;
      progress = 90 + Math.min(9.5, (timePassed - 9000) / 2000);
    }
  }

  const steps = [
    { title: "Bước 1: Đang xử lý thông tin" },
    { title: "Bước 2: Đang khởi tạo bản thảo" },
    { title: "Bước 3: Hoàn tất" },
  ];

  const renderStepIcon = (index) => {
    const stepNumber = index + 1;
    const isCompleted =
      currentStep > stepNumber ||
      (currentStep === stepNumber && isApiDone && timePassed >= 9000);
    const isCurrent =
      currentStep === stepNumber && !(isApiDone && timePassed >= 9000);

    if (isCompleted) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#BBEB5B] flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-[#386600]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }

    if (isCurrent) {
      return (
        <div className="w-10 h-10 rounded-[14px] bg-[#E8F3F8] border border-[#C5E1ED] flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-[#357792] animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-[14px] bg-[#F4F5F7] border border-slate-100 flex items-center justify-center shrink-0">
        <div className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]"></div>
      </div>
    );
  };

  const getStepStatusText = (index) => {
    const stepNumber = index + 1;
    if (
      currentStep > stepNumber ||
      (currentStep === stepNumber && isApiDone && timePassed >= 9000)
    )
      return "HOÀN TẤT";
    if (currentStep === stepNumber) return "ĐANG THỰC HIỆN";
    return "CHỜ XỬ LÝ";
  };

  const getStepStatusColor = (index) => {
    const stepNumber = index + 1;
    if (
      currentStep > stepNumber ||
      (currentStep === stepNumber && isApiDone && timePassed >= 9000)
    )
      return "text-[#5C8C24]";
    if (currentStep === stepNumber) return "text-[#357792]";
    return "text-slate-400";
  };

  // --- State: LOADING / SUCCESS ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-[460px] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Banner */}
        <div className="h-36 bg-gradient-to-b from-[#2d6f8a] to-[#3a7c98] flex items-center justify-center relative">
          <svg
            className="w-16 h-16 text-white/20 absolute"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        </div>

        {/* Content */}
        <div className="pt-8 px-8 pb-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Đang khởi tạo hợp đồng
          </h2>
          <p className="text-slate-600 text-[14px] text-center mb-8 px-2 leading-relaxed">
            Vui lòng đợi trong giây lát, chúng tôi đang chuẩn bị tài liệu cho
            bạn.
          </p>

          {/* Progress Bar */}
          <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-[#357792] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Steps List */}
          <div className="w-full flex flex-col gap-5 px-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 transition-opacity duration-300 ${
                  currentStep < index + 1 ? "opacity-50" : "opacity-100"
                }`}
              >
                {renderStepIcon(index)}
                <div className="flex flex-col">
                  <span
                    className={`text-[15px] font-semibold ${
                      currentStep === index + 1 &&
                      !(isApiDone && timePassed >= 9000)
                        ? "text-[#357792]"
                        : "text-slate-700"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[11px] font-bold tracking-wide mt-0.5 uppercase ${getStepStatusColor(index)}`}
                  >
                    {getStepStatusText(index)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] py-3.5 flex items-center justify-center gap-2 mt-auto">
          <span className="w-2 h-2 rounded-full bg-[#8E9A68]"></span>
          <span className="text-[11px] font-bold text-slate-600 tracking-wider">
            ISUMS Hệ thống quản lý nhà cho thuê thông minh
          </span>
        </div>
      </div>
    </div>
  );
}
