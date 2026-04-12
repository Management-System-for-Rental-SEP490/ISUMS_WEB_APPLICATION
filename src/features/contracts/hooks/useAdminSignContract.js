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
        if ((mapped?.status ?? "") !== "READY") {
          toast.error("Hợp đồng chưa được chủ nhà xác nhận để ký.");
          navigate(`/contracts/${id}`, { replace: true });
          return;
        }
        if (mounted) setContract(mapped);
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          status === 403 ? "Bạn không có quyền xem hợp đồng này." :
          status === 404 ? "Không tìm thấy hợp đồng." :
          "Không thể tải hợp đồng, vui lòng thử lại.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

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
      // signingPosition: `${llx - 48},${lly + 270 + 107},${urx - 48},${ury + 270 + 107}`,
      signingPosition: `${llx},${lly},${urx},${ury}`,
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
      const payload = buildPayload(null, newPos);
      const res = await adminSignEcontract(payload);
      setOtpEmail(res?.data?.receiveOtpEmail ?? null);
      setOtpSent(true);
      setShowOtpModal(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400 ? "Hợp đồng chưa ở trạng thái sẵn sàng để ký hoặc có lỗi từ hệ thống VNPT." :
        status === 403 ? "Bạn không có quyền ký hợp đồng này." :
        "Xác nhận ký thất bại, vui lòng thử lại.";
      toast.error(msg);
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
      const status = err?.response?.status;
      const msg =
        status === 400 ? "Không thể gửi lại OTP, hợp đồng không ở trạng thái hợp lệ." :
        status === 403 ? "Bạn không có quyền thực hiện thao tác này." :
        "Gửi lại OTP thất bại, vui lòng thử lại.";
      toast.error(msg);
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
      const status = err?.response?.status;
      const msg =
        status === 400 ? "Hợp đồng chưa ở trạng thái sẵn sàng để ký hoặc có lỗi từ hệ thống VNPT." :
        status === 403 ? "Bạn không có quyền ký hợp đồng này (chỉ chủ nhà mới được ký)." :
        "Ký hợp đồng thất bại, vui lòng thử lại.";
      toast.error(msg);
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
      const status = err?.response?.status;
      const msg =
        status === 403 ? "Bạn không có quyền từ chối ký hợp đồng này." :
        "Từ chối ký thất bại, vui lòng thử lại.";
      toast.error(msg);
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
