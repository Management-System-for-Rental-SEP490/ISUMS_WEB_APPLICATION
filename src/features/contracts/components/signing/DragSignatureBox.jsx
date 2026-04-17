import { useEffect, useMemo, useRef, useState } from "react";

// Kích thước ô chữ ký mặc định (pt) — khớp với VNPT
const SIG_W_PT = 170;
const SIG_H_PT = 90;

// Chiều cao phần separator giữa các trang PDF (py-2 = 8+8px)
const SEPARATOR_H_PX = 16;

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

  const scaleX = pageWidthPt / containerWidth;
  const scaleY = pageHeightPt / pageHeightPx;

  const llx = Math.round(x * scaleX);
  const urx = Math.round(llx + SIG_W_PT);
  const ury = Math.round(pageHeightPt - yInPage * scaleY);
  const lly = Math.round(ury - SIG_H_PT);

  return `${llx},${lly},${urx},${ury}`;
}

function getClientXY(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
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
  // dragOffset lưu kèm trang — nếu trang thay đổi, offset tự bị bỏ qua khi render
  const [dragOffset, setDragOffset] = useState({ page: signingPage, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // offset thực tế: chỉ dùng nếu đúng trang đang ký
  const activeOffset = dragOffset.page === signingPage ? dragOffset : { x: 0, y: 0 };

  // Đo container width và cập nhật khi resize
  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect?.width) setContainerWidth(rect.width);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  const info = pageInfo[signingPage - 1];

  // Kích thước box (px) — tính từ pt theo tỉ lệ trang
  const boxSize = useMemo(() => {
    if (!info || !containerWidth) return { w: 170, h: 90 };
    return {
      w: Math.round(SIG_W_PT * (containerWidth / info.widthPt)),
      h: Math.round(SIG_H_PT * (info.heightPx / info.heightPt)),
    };
  }, [info, containerWidth]);

  // Vị trí mặc định: chính giữa trang ký
  const defaultPos = useMemo(() => {
    if (!info || !containerWidth) return null;
    const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
    const boxW = Math.round(SIG_W_PT * (containerWidth / info.widthPt));
    const boxH = Math.round(SIG_H_PT * (info.heightPx / info.heightPt));
    return {
      x: Math.round((containerWidth - boxW) / 2),
      y: Math.round(pageOffsetY + (info.heightPx - boxH) / 2),
    };
  }, [info, containerWidth, signingPage, pageInfo]);

  // Vị trí hiện tại = mặc định + offset drag của user
  const pos = defaultPos
    ? { x: defaultPos.x + activeOffset.x, y: defaultPos.y + activeOffset.y }
    : null;

  const handleStart = (e) => {
    if (disabled || !pos) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getClientXY(e);
    const rect = containerRef.current?.getBoundingClientRect();
    dragRef.current = {
      startMouseX: x,
      startMouseY: y,
      startOffsetX: activeOffset.x,
      startOffsetY: activeOffset.y,
      startContainerLeft: rect?.left ?? 0,
      startContainerTop: rect?.top ?? 0,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!dragRef.current || !defaultPos) return;
      e.preventDefault();
      const { x, y } = getClientXY(e);
      const {
        startMouseX, startMouseY,
        startOffsetX, startOffsetY,
        startContainerLeft, startContainerTop,
      } = dragRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      const cw = rect?.width ?? containerWidth;
      const ch = containerRef.current?.scrollHeight ?? 1200;
      const containerLeftDelta = (rect?.left ?? startContainerLeft) - startContainerLeft;
      const containerTopDelta = (rect?.top ?? startContainerTop) - startContainerTop;

      const rawX = defaultPos.x + startOffsetX + (x - startMouseX) - containerLeftDelta;
      const rawY = defaultPos.y + startOffsetY + (y - startMouseY) - containerTopDelta;
      const clampedX = Math.max(0, Math.min(rawX, cw - boxSize.w));
      const clampedY = Math.max(0, Math.min(rawY, ch - boxSize.h));

      setDragOffset({ page: signingPage, x: clampedX - defaultPos.x, y: clampedY - defaultPos.y });
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
  }, [isDragging, containerRef, boxSize, containerWidth, defaultPos, signingPage]);

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
        style={{
          left: pos.x,
          top: pos.y,
          width: boxSize.w,
          height: boxSize.h,
          cursor: disabled ? "default" : "move",
          pointerEvents: disabled ? "none" : "auto",
          touchAction: "none",
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {signatureImage ? (
          <div className="flex w-full h-full">
            <img
              src={`data:image/png;base64,${signatureImage}`}
              alt="Chữ ký"
              className="w-1/2 h-full object-contain p-1 pointer-events-none"
              draggable={false}
            />
            <div className="w-1/2 flex flex-col justify-start pt-1 pr-6 text-blue-600 leading-tight" style={{ fontSize: 12 }}>
              <span className="font-medium">{userName}</span>
              <span>
                {new Date().toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                })}
              </span>
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
