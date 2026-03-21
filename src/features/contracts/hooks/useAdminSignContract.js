import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  adminSignEcontract,
  getContractById,
  getVnptDocument,
} from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";

export function useAdminSignContract(id) {
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
  const mainRef = useRef(null);

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
    if (
      !signatureData ||
      !signingSession ||
      !iframeWrapperRef.current ||
      !mainRef.current
    )
      return;
    const main = mainRef.current;
    const mainRect = main.getBoundingClientRect();
    const wrapperRect = iframeWrapperRef.current.getBoundingClientRect();
    const wrapperTopInMain = wrapperRect.top - mainRect.top + main.scrollTop;
    const boxInitialY =
      (signingSession.signingPage - 1) * 900 + Math.round(900 * 0.6);
    const scrollTarget = wrapperTopInMain + boxInitialY - 200;
    main.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
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
      signingPosition: `${llx - 16},${lly + 270},${urx - 16},${ury + 270}`,
      reason: "Admin ký hợp đồng",
      reject: false,
      confirmTermsConditions: true,
      showReason: false,
      fontSize: 8,
      signatureText: "\n\n\n{{Name}}\n{{SignTime}}",
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

  return {
    // state
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
    showDragBox: !!signatureData && !chosenPosition,
    // refs
    iframeWrapperRef,
    mainRef,
    // handlers
    handleInitiateSigning,
    handleRejectClick,
    handleSignatureCreated,
    handlePositionSet,
    handleResendOtp,
    handleFinalSign,
    handleReject,
    // setters
    setChosenPosition,
    setOtpSent,
    setShowOtpModal,
    setShowSigModal,
    setSigningSession,
    setShowRejectBox,
    setRejectReason,
  };
}
