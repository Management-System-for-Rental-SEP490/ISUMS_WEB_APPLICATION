import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import {
  adminSignEcontract,
  getContractById,
  getVnptDocument,
} from "../api/contracts.api";
import DragSignatureBox from "../components/signing/DragSignatureBox";
import OtpModal from "../components/signing/OtpModal";
import SignatureModal from "../components/signing/SignatureModal";
import SigningActionsSidebar from "../components/signing/SigningActionsSidebar";
import SigningProgressSidebar from "../components/signing/SigningProgressSidebar";
import { mapContractFromApi } from "../utils/mapContractFromApi";

export default function AdminSignContract() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [initiating, setInitiating] = useState(false);
  const [signingSession, setSigningSession] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [chosenPosition, setChosenPosition] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState(null);
  const [signing, setSigning] = useState(false);

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const iframeWrapperRef = useRef(null);

  // ─── Load contract ───────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        const mapped = mapContractFromApi(raw);
        if ((mapped?.status ?? "") !== "CONFIRM_BY_LANDLORD") {
          toast.error("Hợp đồng chưa được chủ nhà xác nhận để ký.");
          navigate(`/contracts/${id}`, { replace: true });
          return;
        }
        if (mounted) setContract(mapped);
      } catch (err) {
        if (mounted) setError(err?.message ?? "Không thể tải hợp đồng.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // ─── Auto-scroll to signing page ─────────────────────────────────────────────
  useEffect(() => {
    if (!signatureData || !signingSession || !iframeWrapperRef.current) return;
    const wrapper = iframeWrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const pageOffsetY = (signingSession.signingPage - 1) * 900;
    const targetY = window.scrollY + rect.top + pageOffsetY - 120;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, [signatureData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Signing session ──────────────────────────────────────────────────────────
  const ensureSigningSession = async () => {
    if (signingSession) return signingSession;
    const documentId = contract?.documentId;
    if (!documentId) throw new Error("Không tìm thấy ID tài liệu VNPT.");
    const vnptDoc = await getVnptDocument(documentId);
    const processId = vnptDoc?.waitingProcess?.id;
    if (!processId) throw new Error("Không tìm thấy tiến trình ký.");
    const signingPage = vnptDoc?.waitingProcess?.pageSign ?? 1;
    const session = { processId, signingPage };
    setSigningSession(session);
    return session;
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleInitiateSigning = async () => {
    if (initiating) return;
    setInitiating(true);
    try {
      await ensureSigningSession();
      setShowSigModal(true);
    } catch {
      toast.error("Bạn yêu cầu quá nhiều lần - vui lòng thử lại sau.");
    } finally {
      setInitiating(false);
    }
  };

  const handleRejectClick = async () => {
    if (signingSession) {
      setShowRejectBox(true);
      return;
    }
    setInitiating(true);
    try {
      await ensureSigningSession();
      setShowRejectBox(true);
    } catch {
      toast.error("Không thể khởi tạo phiên ký. Vui lòng thử lại.");
    } finally {
      setInitiating(false);
    }
  };

  const handleSignatureCreated = ({ signatureImage, displayMode }) => {
    setSignatureData({ signatureImage, displayMode });
    setChosenPosition(null);
    setOtpSent(false);
    setShowOtpModal(false);
    setShowSigModal(false);
  };

  // ─── Payload builders ─────────────────────────────────────────────────────────
  const buildPayload = (otp, posOverride = null) => {
    const pos = posOverride ?? chosenPosition;
    const [llx, lly, urx, ury] = pos.signingPosition.split(",").map(Number);
    return {
      processId: signingSession.processId,
      otp: otp ?? null,
      signatureDisplayMode: 2,
      signatureImage: (() => {
        const raw = signatureData.signatureImage ?? "";
        return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
      })(),
      signingPage: pos.page,
      signingPosition: `${llx - 12},${lly + 265},${urx - 12},${ury + 265}`,
      reason: "Admin ký hợp đồng",
      reject: false,
      confirmTermsConditions: true,
      showReason: false,
      fontSize: 9,
      signatureText: "{{Name}}\n{{SignTime}}",
    };
  };

  const buildRejectPayload = () => ({
    processId: signingSession.processId,
    otp: null,
    signatureDisplayMode: 2,
    signatureImage: "",
    signingPage: signingSession.signingPage,
    signingPosition: "0,0,0,0",
    reason: rejectReason,
    reject: true,
    confirmTermsConditions: true,
    showReason: true,
    fontSize: 9,
    signatureText: "{{Name}}\n{{SignTime}}",
  });

  // ─── API calls ────────────────────────────────────────────────────────────────
  const handlePositionSet = async ({ signingPosition, page }) => {
    const newPos = { signingPosition, page };
    setChosenPosition(newPos);
    if (!signingSession || !signatureData) return;
    setConfirming(true);
    try {
      const res = await adminSignEcontract(buildPayload(null, newPos));
      setOtpEmail(res?.data?.receiveOtpEmail ?? null);
      setOtpSent(true);
      setShowOtpModal(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Xác nhận ký thất bại.",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleResendOtp = async () => {
    if (!chosenPosition || !signingSession || !signatureData) return;
    setConfirming(true);
    try {
      const res = await adminSignEcontract(buildPayload(null));
      setOtpEmail(res?.data?.receiveOtpEmail ?? null);
      setShowOtpModal(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Gửi lại OTP thất bại.",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleFinalSign = async (otp) => {
    setSigning(true);
    try {
      await adminSignEcontract(buildPayload(otp));
      toast.success(
        "Ký hợp đồng thành công! Hợp đồng sẽ được gửi đến gmail khách hàng để tiến hành ký.",
      );
      setShowOtpModal(false);
      navigate(`/contracts/${id}`);
    } catch (err) {
      if (err?.response?.status === 500) {
        toast.error("OTP không đúng, vui lòng thử lại.");
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Ký hợp đồng thất bại.",
        );
      }
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối ký.");
      return;
    }
    setRejecting(true);
    try {
      await adminSignEcontract(buildRejectPayload());
      toast.success("Đã từ chối ký hợp đồng.");
      navigate("/contracts");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Từ chối ký thất bại.",
      );
    } finally {
      setRejecting(false);
    }
  };

  const showDragBox = !!signatureData && !chosenPosition;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-slate-100 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-30 flex-shrink-0">
        <div className="h-14 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                ISUMS
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                Ký hợp đồng điện tử
              </div>
            </div>
          </div>
          {contract && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                Mã hợp đồng
              </div>
              <div className="text-sm font-mono font-bold text-slate-700">
                #{contract.contractNumber ?? contract.name ?? id}
              </div>
            </div>
          )}
        </div>
      </header>

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

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" showLabel label="Đang tải hợp đồng..." />
          </div>
        </div>
      )}

      {/* Error */}
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

      {/* 3-column layout */}
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

          {/* Center: Contract document */}
          <main className="flex-1 overflow-auto bg-slate-100 p-5">
            {showDragBox && (
              <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">
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
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
                Kéo ô chữ ký vào vị trí mong muốn trên hợp đồng
              </div>
            )}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div ref={iframeWrapperRef} className="relative">
                <iframe
                  title="Contract Preview"
                  srcDoc={contract?.html ?? "<p>Không có nội dung</p>"}
                  className="block px-10 pt-[72px] w-full border-0"
                  sandbox="allow-same-origin"
                  referrerPolicy="no-referrer"
                  style={{ minHeight: "1200px" }}
                  onLoad={(e) => {
                    try {
                      const h =
                        e.target.contentWindow.document.documentElement
                          .scrollHeight;
                      if (h > 0) e.target.style.height = h + 200 + "px";
                    } catch {
                      /* ignore cross-origin */
                    }
                  }}
                />
                {showDragBox && (
                  <DragSignatureBox
                    containerRef={iframeWrapperRef}
                    onPositionSet={handlePositionSet}
                    signingPage={signingSession?.signingPage ?? 1}
                    signatureImage={signatureData.signatureImage}
                    disabled={false}
                  />
                )}
              </div>
            </div>
          </main>

          <SigningActionsSidebar
            initiating={initiating}
            error={error}
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
            onExit={() => navigate(-1)}
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
