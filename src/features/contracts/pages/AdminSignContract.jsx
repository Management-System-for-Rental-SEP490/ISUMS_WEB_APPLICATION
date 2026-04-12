import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../auth/store/auth.store";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import OtpModal from "../components/signing/OtpModal";
import SignatureModal from "../components/signing/SignatureModal";
import SigningActionsSidebar from "../components/signing/SigningActionsSidebar";
import SigningProgressSidebar from "../components/signing/SigningProgressSidebar";
import SignContractHeader from "../components/signing/SignContractHeader";
import ContractDocumentViewer from "../components/signing/ContractDocumentViewer";
import { useAdminSignContract } from "../hooks/useAdminSignContract";

export default function AdminSignContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userName = useAuthStore((s) => s.profile?.name ?? "");

  const {
    contract,
    loading,
    error,
    initiating,
    signingSession,
    showSigModal,
    signatureData,
    chosenPosition,
    confirming,
    showOtpModal,
    otpSent,
    otpEmail,
    signing,
    showRejectBox,
    rejectReason,
    rejecting,
    showDragBox,
    iframeWrapperRef,
    mainRef,
    handleInitiateSigning,
    handleRejectClick,
    handleSignatureCreated,
    handlePositionSet,
    handleResendOtp,
    handleFinalSign,
    handleReject,
    setChosenPosition,
    setOtpSent,
    setShowOtpModal,
    setShowSigModal,
    setSigningSession,
    setShowRejectBox,
    setRejectReason,
  } = useAdminSignContract(id);

  return (
    <div className="h-screen bg-slate-100 font-sans flex flex-col overflow-hidden">
      <SignContractHeader contract={contract} id={id} />

      <LoadingOverlay
        open={confirming || signing || rejecting}
        label={
          confirming
            ? "Đang gửi yêu cầu ký..."
            : rejecting
              ? "Đang gửi từ chối ký..."
              : "Đang ký hợp đồng..."
        }
      />

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" showLabel label="Đang tải hợp đồng..." />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-red-200 px-6 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && contract && (
        <div className="flex flex-1 overflow-hidden">
          <SigningProgressSidebar
            signatureData={signatureData}
            signingSession={signingSession}
            chosenPosition={chosenPosition}
            showOtpModal={showOtpModal}
            otpSent={otpSent}
            confirming={confirming}
            onResetPosition={() => {
              setChosenPosition(null);
              setOtpSent(false);
            }}
            onReopenOtp={() => setShowOtpModal(true)}
          />

          <ContractDocumentViewer
            mainRef={mainRef}
            iframeWrapperRef={iframeWrapperRef}
            contract={contract}
            showDragBox={showDragBox}
            signingSession={signingSession}
            signatureData={signatureData}
            userName={userName}
            onPositionSet={handlePositionSet}
          />

          <SigningActionsSidebar
            initiating={initiating}
            error={error}
            userName={userName}
            showRejectBox={showRejectBox}
            rejectReason={rejectReason}
            rejecting={rejecting}
            signatureData={signatureData}
            otpSent={otpSent}
            showOtpModal={showOtpModal}
            confirming={confirming}
            onStartSigning={handleInitiateSigning}
            onRejectClick={handleRejectClick}
            onRejectReasonChange={setRejectReason}
            onRejectConfirm={handleReject}
            onRejectCancel={() => {
              setShowRejectBox(false);
              setRejectReason("");
            }}
            onExit={() =>
              navigate("/contracts/pending", { replace: true })
            }
            onOpenSignatureModal={() => setShowSigModal(true)}
            onReopenOtp={() => setShowOtpModal(true)}
            onResendOtp={handleResendOtp}
          />
        </div>
      )}

      <SignatureModal
        open={showSigModal}
        onClose={() => {
          setShowSigModal(false);
          if (!signatureData) setSigningSession(null);
        }}
        onSubmit={handleSignatureCreated}
      />

      <OtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleFinalSign}
        onResend={handleResendOtp}
        loading={signing}
        otpEmail={otpEmail}
      />
    </div>
  );
}
