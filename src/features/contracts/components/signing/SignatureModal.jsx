import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

function extractBase64(dataUrl) {
  if (!dataUrl) return "";
  return dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
}

// Merge two image data-URLs side by side into a single PNG data-URL
function mergeImages(leftDataUrl, rightDataUrl) {
  return new Promise((resolve) => {
    const img1 = new Image();
    const img2 = new Image();
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;
      const W = 600;
      const H = 180;
      const half = W / 2 - 2;
      const offscreen = document.createElement("canvas");
      offscreen.width = W;
      offscreen.height = H;
      const ctx = offscreen.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      // Left image (fit within half width, full height, centered)
      const scale1 = Math.min(half / img1.naturalWidth, H / img1.naturalHeight);
      const w1 = img1.naturalWidth * scale1;
      const h1 = img1.naturalHeight * scale1;
      ctx.drawImage(img1, (half - w1) / 2, (H - h1) / 2, w1, h1);
      // Divider
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 10);
      ctx.lineTo(W / 2, H - 10);
      ctx.stroke();
      // Right image
      const scale2 = Math.min(half / img2.naturalWidth, H / img2.naturalHeight);
      const w2 = img2.naturalWidth * scale2;
      const h2 = img2.naturalHeight * scale2;
      ctx.drawImage(img2, W / 2 + 2 + (half - w2) / 2, (H - h2) / 2, w2, h2);
      resolve(offscreen.toDataURL("image/png"));
    };
    img1.onload = onLoad;
    img2.onload = onLoad;
    img1.src = leftDataUrl;
    img2.src = rightDataUrl;
  });
}

function ModeButton({ mode, current, label, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={[
        "flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition",
        current === mode
          ? "bg-teal-600 text-white border-teal-600"
          : "bg-white text-slate-600 border-slate-200 hover:border-teal-400",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// onSubmit({ signatureImage, displayMode }) — no OTP, parent handles next step
export default function SignatureModal({ open, onClose, onSubmit }) {
  const [displayMode, setDisplayMode] = useState(1);
  const [canvasData, setCanvasData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [swapped, setSwapped] = useState(false);
  const [merging, setMerging] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (open) {
      setDisplayMode(1);
      setCanvasData(null);
      setUploadedImage(null);
      setSwapped(false);
    }
  }, [open]);

  // Canvas high-DPI setup
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [displayMode, open]);

  const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / (window.devicePixelRatio || 1);
    const scaleY = canvas.height / rect.height / (window.devicePixelRatio || 1);
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasStart = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getCanvasPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawing.current = true;
  }, []);

  const handleCanvasMove = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    const pos = getCanvasPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, []);

  const handleCanvasEnd = useCallback(() => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCanvasData(canvas.toDataURL("image/png"));
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, (rect.width / dpr) * dpr, (rect.height / dpr) * dpr);
    setCanvasData(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setUploadedImage(evt.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleModeChange = (mode) => {
    setDisplayMode(mode);
    setCanvasData(null);
    setUploadedImage(null);
    setSwapped(false);
  };

  const handleConfirm = async () => {
    const needsCanvas = displayMode === 1 || displayMode === 2;
    const needsUpload = displayMode === 2 || displayMode === 3;
    if (needsCanvas && !canvasData) {
      toast.error("Vui lòng vẽ chữ ký trước.");
      return;
    }
    if (needsUpload && !uploadedImage) {
      toast.error("Vui lòng tải lên ảnh chữ ký.");
      return;
    }

    let signatureImage;
    if (displayMode === 2) {
      setMerging(true);
      try {
        const left = swapped ? uploadedImage : canvasData;
        const right = swapped ? canvasData : uploadedImage;
        const merged = await mergeImages(left, right);
        signatureImage = extractBase64(merged);
      } catch {
        toast.error("Không thể kết hợp ảnh, vui lòng thử lại.");
        setMerging(false);
        return;
      }
      setMerging(false);
    } else {
      signatureImage = extractBase64(displayMode === 3 ? uploadedImage : canvasData);
    }

    onSubmit({ signatureImage, displayMode });
  };

  const showCanvas = displayMode === 1 || displayMode === 2;
  const showUpload = displayMode === 2 || displayMode === 3;
  const showSwapPreview = displayMode === 2 && !!canvasData && !!uploadedImage;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Tạo chữ ký</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn hình thức và tạo chữ ký của bạn
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Mode selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Hình thức chữ ký</p>
            <div className="flex gap-2">
              <ModeButton mode={1} current={displayMode} label="Vẽ tay" onClick={handleModeChange} />
              <ModeButton mode={2} current={displayMode} label="Vẽ tay + ảnh" onClick={handleModeChange} />
              <ModeButton mode={3} current={displayMode} label="Ảnh chữ ký" onClick={handleModeChange} />
            </div>
          </div>

          {/* Canvas */}
          {showCanvas && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-slate-500">Vẽ chữ ký</p>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
              </div>
              <canvas
                ref={canvasRef}
                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 touch-none"
                style={{ display: "block" }}
                onMouseDown={handleCanvasStart}
                onMouseMove={handleCanvasMove}
                onMouseUp={handleCanvasEnd}
                onMouseLeave={handleCanvasEnd}
                onTouchStart={handleCanvasStart}
                onTouchMove={handleCanvasMove}
                onTouchEnd={handleCanvasEnd}
              />
              {!canvasData && (
                <p className="text-center text-xs text-slate-400 mt-1.5">
                  Dùng chuột hoặc ngón tay để vẽ chữ ký
                </p>
              )}
            </div>
          )}

          {/* Image upload */}
          {showUpload && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">
                {displayMode === 2 ? "Tải lên ảnh con dấu / logo" : "Tải lên ảnh chữ ký"}
              </p>
              {uploadedImage ? (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={uploadedImage} alt="Ảnh chữ ký" className="w-full h-28 object-contain" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-500 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition">
                  <svg className="w-6 h-6 text-slate-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-slate-500">Nhấn để chọn ảnh (PNG, JPG)</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Swap preview — only for mode 2 when both inputs are ready */}
          {showSwapPreview && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-slate-500">
                  Xem trước bố cục
                </p>
                <button
                  type="button"
                  onClick={() => setSwapped((s) => !s)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-2.5 py-1 hover:bg-teal-50 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Đổi vị trí
                </button>
              </div>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex-1 flex items-center justify-center h-20 p-2 bg-slate-50">
                  <img
                    src={swapped ? uploadedImage : canvasData}
                    alt={swapped ? "Ảnh" : "Chữ ký"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="w-px self-stretch bg-slate-200" />
                <div className="flex-1 flex items-center justify-center h-20 p-2 bg-slate-50">
                  <img
                    src={swapped ? canvasData : uploadedImage}
                    alt={swapped ? "Chữ ký" : "Ảnh"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                {swapped ? "Ảnh | Chữ ký vẽ tay" : "Chữ ký vẽ tay | Ảnh"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={merging}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {merging ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  Tiếp tục
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
