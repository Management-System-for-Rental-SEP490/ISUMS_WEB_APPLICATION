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
import { mapContractFromApi } from "../utils/mapContractFromApi";

function StepCircle({ number, done, active }) {
  if (done) {
    return (
      <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={[
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border",
        active
          ? "bg-teal-600 text-white border-teal-600"
          : "bg-slate-100 text-slate-400 border-slate-200",
      ].join(" ")}
    >
      {number}
    </div>
  );
}

export default function AdminSignContract() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Contract
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flow state
  const [initiating, setInitiating] = useState(false);
  const [signingSession, setSigningSession] = useState(null); // { processId, signingPage }
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null); // { signatureImage, displayMode }
  const [chosenPosition, setChosenPosition] = useState(null); // { signingPosition, page }
  const [confirming, setConfirming] = useState(false); // first API call (otp null)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [signing, setSigning] = useState(false); // second API call (with OTP)

  const iframeWrapperRef = useRef(null);

  // Load contract
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        const mapped = mapContractFromApi(raw);
        if ((mapped?.status ?? "") !== "READY") {
          toast.error("Hợp đồng không ở trạng thái sẵn sàng để ký.");
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

  // Step 1: Load VNPT document info + open signature creation modal
  const handleInitiateSigning = async () => {
    if (initiating) return;
    setInitiating(true);
    try {
      const documentId = contract?.documentId;
      if (!documentId) throw new Error("Không tìm thấy ID tài liệu VNPT.");
      const vnptDoc = await getVnptDocument(documentId);
      const processId = vnptDoc?.waitingProcess?.id;
      if (!processId) throw new Error("Không tìm thấy tiến trình ký.");
      const signingPage = vnptDoc?.waitingProcess?.pageSign ?? 1;
      setSigningSession({ processId, signingPage });
      setShowSigModal(true);
    } catch (err) {
      toast.error(err?.message ?? "Không thể khởi tạo phiên ký.");
    } finally {
      setInitiating(false);
    }
  };

  // Step 2: Signature created → show draggable box on contract
  const handleSignatureCreated = ({ signatureImage, displayMode }) => {
    setSignatureData({ signatureImage, displayMode });
    setChosenPosition(null);
    setShowOtpModal(false);
    setShowSigModal(false);
  };

  // Auto-scroll to signing page when DragSignatureBox appears
  useEffect(() => {
    if (!signatureData || !signingSession || !iframeWrapperRef.current) return;
    const wrapper = iframeWrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const pageOffsetY = (signingSession.signingPage - 1) * 900;
    const targetY = window.scrollY + rect.top + pageOffsetY - 120;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, [signatureData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build signing payload — accepts optional posOverride (needed for auto-confirm right after setChosenPosition)
  const buildPayload = (otp, posOverride = null) => {
    const pos = posOverride ?? chosenPosition;
    const [llx, lly, urx, ury] = pos.signingPosition.split(",").map(Number);
    const adjustedPosition = `${llx - 25},${lly + 265},${urx - 25},${ury + 265}`;
    return {
      processId: signingSession.processId,
      otp: otp ?? null,
      signatureDisplayMode: 2,
      signatureImage: (() => {
        const raw = signatureData.signatureImage ?? "";
        return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
      })(),
      signingPage: pos.page,
      signingPosition: adjustedPosition,
      reason: "Admin ký hợp đồng",
      reject: false,
      confirmTermsConditions: true,
      showReason: false,
      fontSize: 9,
      signatureText: "{{Name}}\n{{SignTime}}",
    };
  };

  // Step 3: Position confirmed → auto-trigger first API call (OTP email)
  const handlePositionSet = async ({ signingPosition, page }) => {
    const newPos = { signingPosition, page };
    setChosenPosition(newPos);
    if (!signingSession || !signatureData) return;
    setConfirming(true);
    try {
      await adminSignEcontract(buildPayload(null, newPos));
      setShowOtpModal(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Xác nhận ký thất bại.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  // Step 4: Second API call with OTP → done
  const handleFinalSign = async (otp) => {
    setSigning(true);
    try {
      await adminSignEcontract(buildPayload(otp));
      toast.success("Ký hợp đồng thành công!");
      setShowOtpModal(false);
      navigate(`/contracts/${id}`);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Ký hợp đồng thất bại.";
      toast.error(msg);
    } finally {
      setSigning(false);
    }
  };

  const showDragBox = !!signatureData && !chosenPosition;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-200 flex items-center justify-center text-teal-600 border border-teal-300/80 flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  Ký hợp đồng
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Chờ ký
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <span className="truncate">
                  {contract?.contractNumber ?? contract?.name ?? id}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/contracts/${id}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-[13px] font-semibold text-slate-600 bg-white hover:bg-slate-50 transition flex-shrink-0"
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
            Hủy
          </button>
        </div>
      </header>

      <LoadingOverlay
        open={confirming || signing}
        label={confirming ? "Đang gửi yêu cầu ký..." : "Đang ký hợp đồng..."}
      />

      <main className="px-6 pb-10 pt-6 max-w-7xl mx-auto">
        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" showLabel label="Đang tải hợp đồng..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mb-4 bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3 shadow-sm">
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
        )}

        {!loading && contract && (
          <>
            {/* Instruction banner */}
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-[13px] font-medium text-blue-700 mb-5">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Nhấn <strong>Bắt đầu ký</strong> → Tạo chữ ký → Kéo ô chữ ký
                chọn vị trí → Xác nhận ký → Nhập OTP.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
              {/* Left: Step panel */}
              <div className="space-y-3">
                {/* Step 1: Tạo chữ ký */}
                <div
                  className={[
                    "rounded-xl border p-4 bg-white transition",
                    signatureData
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <StepCircle
                      number={1}
                      done={!!signatureData}
                      active={!signingSession && !signatureData}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Tạo chữ ký
                    </span>
                  </div>

                  {!signingSession && !signatureData ? (
                    /* Haven't started yet */
                    <button
                      type="button"
                      onClick={handleInitiateSigning}
                      disabled={initiating || !!error}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                  ) : signatureData ? (
                    /* Signature created — show preview + redraw button */
                    <div className="space-y-2">
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={`data:image/png;base64,${signatureData.signatureImage}`}
                          alt="Chữ ký"
                          className="h-16 w-full object-contain p-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSigModal(true)}
                        className="w-full text-xs text-slate-500 hover:text-teal-600 underline underline-offset-2 transition text-center py-1"
                      >
                        Vẽ lại chữ ký
                      </button>
                    </div>
                  ) : (
                    /* Session loaded, modal should be open */
                    <button
                      type="button"
                      onClick={() => setShowSigModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
                    >
                      Tạo chữ ký
                    </button>
                  )}
                </div>

                {/* Step 2: Chọn vị trí */}
                <div
                  className={[
                    "rounded-xl border p-4 bg-white transition",
                    !signatureData ? "opacity-40" : "",
                    chosenPosition
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <StepCircle
                      number={2}
                      done={!!chosenPosition}
                      active={!!signatureData && !chosenPosition}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Chọn vị trí chữ ký
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-9">
                    {chosenPosition
                      ? "Vị trí đã xác nhận"
                      : "Kéo ô chữ ký trên hợp đồng sang vị trí mong muốn"}
                  </p>
                  {chosenPosition && (
                    <button
                      type="button"
                      onClick={() => setChosenPosition(null)}
                      className="text-xs text-slate-400 hover:text-teal-600 underline underline-offset-2 transition mt-1.5 pl-9 block"
                    >
                      Chọn lại vị trí
                    </button>
                  )}
                </div>

                {/* Step 3: Xác nhận ký — tự động sau khi xác nhận vị trí */}
                <div
                  className={[
                    "rounded-xl border p-4 bg-white transition",
                    !chosenPosition ? "opacity-40" : "border-slate-200",
                    showOtpModal ? "border-emerald-200 bg-emerald-50/50" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <StepCircle
                      number={3}
                      done={showOtpModal}
                      active={!!chosenPosition && !showOtpModal}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      Nhập OTP xác nhận
                    </span>
                  </div>
                  <p className="text-xs pl-9 text-slate-500">
                    {showOtpModal
                      ? "OTP đã gửi — kiểm tra email để nhập mã"
                      : confirming
                        ? "Đang gửi OTP..."
                        : "Tự động gửi OTP sau khi xác nhận vị trí"}
                  </p>
                </div>
              </div>

              {/* Right: Contract iframe + DragSignatureBox */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-slate-700">
                      Nội dung hợp đồng
                    </span>
                  </div>
                  {showDragBox && (
                    <span className="text-xs text-teal-600 font-medium animate-pulse">
                      Kéo ô chữ ký để chọn vị trí →
                    </span>
                  )}
                </div>

                <div ref={iframeWrapperRef} className="relative pb-48">
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
            </div>
          </>
        )}
      </main>

      {/* Signature creation modal */}
      <SignatureModal
        open={showSigModal}
        onClose={() => {
          setShowSigModal(false);
          // If closed without creating sig and session just started, reset session
          if (!signatureData) setSigningSession(null);
        }}
        onSubmit={handleSignatureCreated}
      />

      {/* OTP confirmation modal */}
      <OtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleFinalSign}
        loading={signing}
      />
    </div>
  );
}
