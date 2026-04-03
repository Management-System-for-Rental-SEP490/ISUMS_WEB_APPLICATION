import { useEffect, useRef, useState } from "react";

// Kích thước ô chữ ký mặc định (pt) — khớp với VNPT
const SIG_W_PT = 170;
const SIG_H_PT = 90;

// Chiều cao phần separator giữa các trang PDF (py-2 = 8+8px)
const SEPARATOR_H_PX = 16;

/**
 * Tính Y offset (px) của trang signingPage trong container,
 * dựa vào chiều cao thực tế của từng trang.
 * pageInfo[i] = { heightPx, widthPt, heightPt }
 */
function getPageOffsetY(signingPage, pageInfo) {
  let offset = 0;
  for (let i = 0; i < signingPage - 1; i++) {
    offset += (pageInfo[i]?.heightPx ?? 0) + SEPARATOR_H_PX;
  }
  return offset;
}

/**
 * Chuyển vị trí box (px trong container) sang tọa độ PDF (pt trong trang).
 * Format: "llx,lly,urx,ury" — gốc tọa độ ở góc dưới-trái trang.
 * Dùng kích thước pt thực tế của trang (từ page.originalWidth/Height của react-pdf).
 */
function toSigningPosition(x, y, containerWidth, signingPage, pageInfo) {
  const info = pageInfo[signingPage - 1];
  if (!info) {
    console.warn("[DragSignatureBox] pageInfo chưa sẵn sàng cho trang", signingPage);
    return "0,0,0,0";
  }
  const { heightPx: pageHeightPx, widthPt: pageWidthPt, heightPt: pageHeightPt } = info;
  const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
  const yInPage = y - pageOffsetY;

  // Scale: px → pt dựa trên kích thước thực tế của trang PDF
  const scaleX = pageWidthPt / containerWidth;
  const scaleY = pageHeightPt / pageHeightPx;

  const llx = Math.round(x * scaleX);
  const urx = Math.round(llx + SIG_W_PT);
  const ury = Math.round(pageHeightPt - yInPage * scaleY);
  const lly = Math.round(ury - SIG_H_PT);

  const result = `${llx},${lly},${urx},${ury}`;

  console.log("[DragSignatureBox] 📍 Vị trí ký:", {
    "Trang ký (signingPage)": signingPage,
    "Box px (x,y trong container)": { x: Math.round(x), y: Math.round(y) },
    "Container width px": Math.round(containerWidth),
    "Kích thước trang px": `${containerWidth}x${Math.round(pageHeightPx)}`,
    "Kích thước trang pt (thực tế PDF)": `${pageWidthPt}x${pageHeightPt}`,
    "Page offset Y px": Math.round(pageOffsetY),
    "Y trong trang px": Math.round(yInPage),
    "PDF coords (pt)": { llx, lly, urx, ury },
    "signingPosition string": result,
  });

  return result;
}

function getClientXY(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function getBoxSizePx(containerWidth, pageWidthPt, pageHeightPx, pageHeightPt) {
  return {
    w: Math.round(SIG_W_PT * (containerWidth / pageWidthPt)),
    h: Math.round(SIG_H_PT * (pageHeightPx / pageHeightPt)),
  };
}

export default function DragSignatureBox({
  containerRef,
  onPositionSet,
  signingPage = 1,
  disabled = false,
  signatureImage,
  userName = "",
  pageInfo = [],
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [boxSize, setBoxSize] = useState({ w: 170, h: 90 });
  const [pos, setPos] = useState(null); // khởi tạo sau khi biết containerWidth
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // Đo container width và cập nhật khi resize
  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect?.width) return;
      setContainerWidth(rect.width);
      setPos((prev) => prev ?? { x: 40, y: 200 });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  // Cập nhật kích thước box và vị trí mặc định khi pageInfo sẵn sàng
  useEffect(() => {
    const info = pageInfo[signingPage - 1];
    if (!info || !containerWidth) return;
    setBoxSize(getBoxSizePx(containerWidth, info.widthPt, info.heightPx, info.heightPt));
    const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
    setPos((prev) => {
      if (prev && prev.y !== 200) return prev;
      return { x: 40, y: pageOffsetY + Math.round(info.heightPx * 0.6) };
    });
  }, [pageInfo, signingPage, containerWidth]);

  // Log thông tin trang
  useEffect(() => {
    if (!containerWidth) return;
    const info = pageInfo[signingPage - 1];
    const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
    console.log("[DragSignatureBox] 📄 Thông tin trang ký:", {
      signingPage,
      "Container width (px)": Math.round(containerWidth),
      "Kích thước trang pt (thực tế PDF)": info ? `${info.widthPt}x${info.heightPt}` : "chưa sẵn sàng",
      "Page height px (thực tế)": info ? Math.round(info.heightPx) : "chưa sẵn sàng",
      "Y offset của trang ký (px)": Math.round(pageOffsetY),
    });
  }, [signingPage, containerWidth, pageInfo]);

  const handleStart = (e) => {
    if (disabled || !pos) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getClientXY(e);
    const rect = containerRef.current?.getBoundingClientRect();
    dragRef.current = {
      startMouseX: x,
      startMouseY: y,
      startBoxX: pos.x,
      startBoxY: pos.y,
      startContainerLeft: rect?.left ?? 0,
      startContainerTop: rect?.top ?? 0,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const { x, y } = getClientXY(e);
      const { startMouseX, startMouseY, startBoxX, startBoxY, startContainerLeft, startContainerTop } = dragRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      const cw = rect?.width ?? containerWidth;
      const ch = containerRef.current?.scrollHeight ?? 1200;
      const containerLeftDelta = (rect?.left ?? startContainerLeft) - startContainerLeft;
      const containerTopDelta = (rect?.top ?? startContainerTop) - startContainerTop;
      const newX = Math.max(0, Math.min(startBoxX + (x - startMouseX) - containerLeftDelta, cw - boxSize.w));
      const newY = Math.max(0, Math.min(startBoxY + (y - startMouseY) - containerTopDelta, ch - boxSize.h));
      setPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, containerRef, boxSize, containerWidth]);

  const handleConfirm = () => {
    if (!pos || !containerWidth) return;
    const signingPosition = toSigningPosition(pos.x, pos.y, containerWidth, signingPage, pageInfo);
    onPositionSet({ signingPosition, page: signingPage });
  };

  if (!pos) return null;

  return (
    <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }}>
      {/* Instruction banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap" style={{ pointerEvents: "none" }}>
        <div className="bg-white/95 border border-teal-300 rounded-xl px-4 py-2 shadow-md text-center">
          <p className="text-xs font-semibold text-teal-700">Kéo ô chữ ký đến vị trí mong muốn</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sau đó bấm &quot;Xác nhận vị trí&quot; — trang ký: <strong>{signingPage}</strong></p>
        </div>
      </div>

      {/* Draggable box */}
      <div
        className="absolute border-2 border-teal-500 rounded-lg bg-white/95 shadow-xl overflow-hidden select-none"
        style={{ left: pos.x, top: pos.y, width: boxSize.w, height: boxSize.h, cursor: disabled ? "default" : "move", pointerEvents: disabled ? "none" : "auto", touchAction: "none" }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {signatureImage ? (
          <div className="flex w-full h-full">
            <img src={`data:image/png;base64,${signatureImage}`} alt="Chữ ký" className="w-1/2 h-full object-contain p-1 pointer-events-none" draggable={false} />
            <div className="w-1/2 flex flex-col justify-start pt-1 pr-6 text-blue-600 leading-tight" style={{ fontSize: 12 }}>
              <span className="font-medium">{userName}</span>
              <span>{new Date().toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-teal-600 font-semibold">Chữ ký</div>
        )}
        <div className="absolute top-1 right-1 bg-teal-600/80 rounded p-0.5 pointer-events-none">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>

      {/* Confirm button */}
      {!disabled && (
        <div style={{ position: "fixed", bottom: "24px", right: "40px", zIndex: 50, pointerEvents: "auto" }}>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Xác nhận vị trí
          </button>
        </div>
      )}
    </div>
  );
}
