export default function SigningActionsSidebar({
  initiating,
  error,
  userName,
  showRejectBox,
  rejectReason,
  rejecting,
  signatureData,
  otpSent,
  showOtpModal,
  confirming,
  onStartSigning,
  onRejectClick,
  onRejectReasonChange,
  onRejectConfirm,
  onRejectCancel,
  onExit,
  onOpenSignatureModal,
  onReopenOtp,
  onResendOtp,
}) {
  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col overflow-y-auto flex-shrink-0 p-5 gap-3">
      {/* Bắt đầu ký */}
      <button
        type="button"
        onClick={onStartSigning}
        disabled={initiating || !!error}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {initiating ? (
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
            Đang khởi tạo...
          </>
        ) : (
          <>
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Bắt đầu ký
          </>
        )}
      </button>

      {/* Từ chối ký */}
      {!showRejectBox ? (
        <button
          type="button"
          onClick={onRejectClick}
          disabled={initiating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          Từ chối ký
        </button>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-red-700">
            Lý do từ chối <span className="text-red-500">*</span>
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="Nhập lý do từ chối ký..."
            className="w-full rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onRejectConfirm}
              disabled={rejecting || !rejectReason.trim()}
              className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận từ chối
            </button>
            <button
              type="button"
              onClick={onRejectCancel}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Hủy & Thoát */}
      <button
        type="button"
        onClick={onExit}
        className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition py-0.5"
      >
        Hủy &amp; Thoát
      </button>

      <div className="border-t border-slate-100" />

      {/* Chữ ký có sẵn */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Chữ ký có sẵn
        </p>
        <div className="space-y-2">
          {signatureData && (
            <div className="border-2 border-teal-400 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex w-full h-20">
                {/* Nửa trái: chữ ký */}
                <img
                  src={`data:image/png;base64,${signatureData.signatureImage}`}
                  alt="Chữ ký"
                  className="w-1/2 h-full object-contain p-1"
                />
                {/* Nửa phải: text căn trên */}
                <div className="w-1/2 flex flex-col justify-start pt-1 pr-1 text-blue-600 leading-tight" style={{ fontSize: 12 }}>
                  <div className="font-medium">{userName}</div>
                  <div>
                    {new Date().toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-center py-1.5 bg-teal-50 border-t border-teal-200">
                <span className="text-[11px] font-semibold text-teal-700">
                  Chữ ký mặc định
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={signatureData ? onOpenSignatureModal : onStartSigning}
            disabled={initiating}
            className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs font-medium">
              {signatureData ? "Tạo chữ ký mới" : "Tạo chữ ký"}
            </span>
          </button>
        </div>
      </div>

      {/* OTP reopen — hiện khi cần */}
      {otpSent && !showOtpModal && !confirming && (
        <>
          <div className="border-t border-slate-100" />
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onReopenOtp}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Mở lại nhập OTP
            </button>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={confirming}
              className="w-full text-xs text-slate-400 hover:text-teal-600 underline underline-offset-2 transition text-center py-1 disabled:opacity-50"
            >
              Gửi lại OTP mới
            </button>
          </div>
        </>
      )}

      {/* Security badge */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wide">
            Bảo mật bởi VNPT eSign
          </span>
        </div>
      </div>
    </aside>
  );
}
