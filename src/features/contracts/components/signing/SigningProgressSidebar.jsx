function StepCircle({ number, done, active }) {
  if (done) {
    return (
      <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div className={[
      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border",
      active ? "bg-teal-600 text-white border-teal-600" : "bg-slate-100 text-slate-400 border-slate-200",
    ].join(" ")}>
      {number}
    </div>
  );
}

export default function SigningProgressSidebar({
  signatureData,
  signingSession,
  chosenPosition,
  showOtpModal,
  otpSent,
  confirming,
  onResetPosition,
  onReopenOtp,
}) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-y-auto flex-shrink-0">
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
          Tiến trình ký
        </p>

        <div>
          {/* Step 1: Tạo chữ ký */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <StepCircle number={1} done={!!signatureData} active={!signingSession && !signatureData} />
              <div className="w-px flex-1 bg-slate-200 my-1.5" style={{ minHeight: 32 }} />
            </div>
            <div className="pb-5">
              <p className={["text-sm font-semibold leading-tight", signatureData ? "text-emerald-600" : "text-slate-700"].join(" ")}>
                Tạo chữ ký
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {signatureData ? "Hoàn thành" : !signingSession ? "Chưa bắt đầu" : "Đang chờ"}
              </p>
            </div>
          </div>

          {/* Step 2: Vị trí chữ ký */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <StepCircle number={2} done={!!chosenPosition} active={!!signatureData && !chosenPosition} />
              <div className="w-px flex-1 bg-slate-200 my-1.5" style={{ minHeight: 32 }} />
            </div>
            <div className="pb-5">
              <p className={["text-sm font-semibold leading-tight", chosenPosition ? "text-emerald-600" : "text-slate-700"].join(" ")}>
                Vị trí chữ ký
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {chosenPosition ? "Đã xác nhận" : signatureData ? "Kéo ô chữ ký vào hợp đồng" : "Bước tiếp theo"}
              </p>
              {chosenPosition && (
                <button
                  type="button"
                  onClick={onResetPosition}
                  className="text-[11px] text-slate-400 hover:text-teal-600 underline underline-offset-2 transition mt-1 block"
                >
                  Chọn lại vị trí
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Xác nhận OTP */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <StepCircle number={3} done={otpSent && !showOtpModal} active={!!chosenPosition} />
            </div>
            <div>
              <p className={["text-sm font-semibold leading-tight", otpSent && !showOtpModal ? "text-emerald-600" : "text-slate-700"].join(" ")}>
                Xác nhận OTP
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {showOtpModal ? "Đang nhập OTP..." : otpSent ? "OTP đã gửi" : confirming ? "Đang gửi OTP..." : "Bước tiếp theo"}
              </p>
              {otpSent && !showOtpModal && !confirming && (
                <button
                  type="button"
                  onClick={onReopenOtp}
                  className="text-[11px] text-teal-600 hover:text-teal-700 underline underline-offset-2 transition mt-1 block"
                >
                  Mở lại nhập OTP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 mx-4 my-3" />

      {/* Hướng dẫn */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hướng dẫn</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Xem kỹ nội dung hợp đồng. Nhấn{" "}
          <strong className="text-slate-700">Bắt đầu ký</strong> để tạo chữ ký,
          sau đó kéo ô chữ ký vào vị trí mong muốn. Nhập OTP để hoàn tất.
        </p>
      </div>
    </aside>
  );
}
