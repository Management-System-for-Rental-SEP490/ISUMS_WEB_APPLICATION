import { useEffect, useRef, useState } from "react";

// VNPT sử dụng tọa độ landscape: width=752pt, height=595pt
// (a,b) = góc dưới trái, (c,d) = góc trên phải
const VNPT_PAGE_W_PT = 752;
const VNPT_PAGE_H_PT = 595;

// Kích thước ô chữ ký mặc định (pt) — khớp với default VNPT
const SIG_W_PT = 170;
const SIG_H_PT = 90;

// Ước tính chiều cao 1 trang PDF khi render trong iframe wrapper (px).
// Điều chỉnh hằng số này nếu trang bị lệch.
const ESTIMATED_PAGE_HEIGHT_PX = 900;

/**
 * Chuyển vị trí box (px trong container) sang tọa độ VNPT (pt trong trang).
 * VNPT format: "llx,lly,urx,ury" — gốc tọa độ ở góc dưới-trái trang.
 */
function toSigningPosition(x, y, cw, signingPage) {
  // Trừ offset các trang trước
  const pageOffsetY = (signingPage - 1) * ESTIMATED_PAGE_HEIGHT_PX;
  const yInPage = y - pageOffsetY;

  // Scale px → pt dựa trên chiều rộng container
  const scaleX = VNPT_PAGE_W_PT / cw;

  const llx = Math.round(x * scaleX);
  const urx = Math.round(llx + SIG_W_PT);

  // VNPT Y gốc ở đáy → đảo ngược
  const scaleY = VNPT_PAGE_H_PT / ESTIMATED_PAGE_HEIGHT_PX;
  const ury = Math.round(VNPT_PAGE_H_PT - yInPage * scaleY);
  const lly = Math.round(ury - SIG_H_PT);

  const result = `${llx},${lly},${urx},${ury}`;

  console.log("[DragSignatureBox] 📍 Vị trí ký:", {
    "Trang ký (signingPage)": signingPage,
    "Box px (x,y trong container)": { x: Math.round(x), y: Math.round(y) },
    "Container width px": Math.round(cw),
    "Y trong trang px": Math.round(yInPage),
    "VNPT coords (pt)": { llx, lly, urx, ury },
    "signingPosition string": result,
    "VNPT page size": `${VNPT_PAGE_W_PT}x${VNPT_PAGE_H_PT}pt (landscape)`,
    "Ước tính chiều cao trang px": ESTIMATED_PAGE_HEIGHT_PX,
  });

  return result;
}

function getClientXY(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// Tính kích thước box theo px từ pt, dựa vào container width
function getBoxSizePx(containerWidth) {
  const scaleX = VNPT_PAGE_W_PT / containerWidth;
  const scaleY = VNPT_PAGE_H_PT / ESTIMATED_PAGE_HEIGHT_PX;
  return {
    w: Math.round(SIG_W_PT / scaleX),
    h: Math.round(SIG_H_PT / scaleY),
  };
}

export default function DragSignatureBox({
  containerRef,
  onPositionSet,
  signingPage = 1,
  disabled = false,
  signatureImage,
  userName = "",
}) {
  const [pos, setPos] = useState(() => ({
    x: 40,
    y:
      (signingPage - 1) * ESTIMATED_PAGE_HEIGHT_PX +
      Math.round(ESTIMATED_PAGE_HEIGHT_PX * 0.6),
  }));
  const [boxSize, setBoxSize] = useState({ w: 170, h: 90 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // Cập nhật kích thước box khi container resize
  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect?.width) setBoxSize(getBoxSizePx(rect.width));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  // Log thông tin trang
  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    console.log("[DragSignatureBox] 📄 Thông tin trang ký:", {
      signingPage: signingPage,
      "VNPT page size (pt)": `${VNPT_PAGE_W_PT} x ${VNPT_PAGE_H_PT}`,
      "Ước tính chiều cao trang (px)": ESTIMATED_PAGE_HEIGHT_PX,
      "Container width (px)": Math.round(rect?.width ?? 0),
      "Container height (px)": Math.round(rect?.height ?? 0),
      "Y offset của trang ký (px)":
        (signingPage - 1) * ESTIMATED_PAGE_HEIGHT_PX,
    });
  }, [signingPage, containerRef]);

  const handleStart = (e) => {
    if (disabled) return;
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
      e.preventDefault(); // chỉ preventDefault khi đang drag
      const { x, y } = getClientXY(e);
      const {
        startMouseX, startMouseY,
        startBoxX, startBoxY,
        startContainerLeft, startContainerTop,
      } = dragRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      const cw = rect?.width ?? 800;
      const ch = containerRef.current?.scrollHeight ?? 1200;
      // Bù trừ container dịch chuyển do scroll trong <main>
      const containerLeftDelta = (rect?.left ?? startContainerLeft) - startContainerLeft;
      const containerTopDelta  = (rect?.top  ?? startContainerTop)  - startContainerTop;
      const newX = Math.max(
        0,
        Math.min(startBoxX + (x - startMouseX) - containerLeftDelta, cw - boxSize.w),
      );
      const newY = Math.max(
        0,
        Math.min(startBoxY + (y - startMouseY) - containerTopDelta, ch - boxSize.h),
      );
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
  }, [isDragging, containerRef, boxSize]);

  const handleConfirm = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const signingPosition = toSigningPosition(
      pos.x,
      pos.y,
      rect.width,
      signingPage,
    );
    onPositionSet({ signingPosition, page: signingPage });
  };

  // Trang hiện tại của box (ước tính để hiển thị)
  const currentPageEstimate = Math.floor(pos.y / ESTIMATED_PAGE_HEIGHT_PX) + 1;
  const onCorrectPage = currentPageEstimate === signingPage;

  return (
    // wrapper: pointer-events none → scroll vẫn hoạt động
    <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }}>
      {/* Instruction banner */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-white/95 border border-teal-300 rounded-xl px-4 py-2 shadow-md text-center">
          <p className="text-xs font-semibold text-teal-700">
            Kéo ô chữ ký đến vị trí mong muốn
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sau đó bấm &quot;Xác nhận vị trí&quot;
          </p>
          <div className="mt-1.5">
            <span
              className={[
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                onCorrectPage
                  ? "bg-teal-100 text-teal-700"
                  : "bg-amber-100 text-amber-700",
              ].join(" ")}
            >
              {onCorrectPage
                ? `✓ Đang ở trang ký: ${signingPage}`
                : `Trang hiện tại: ~${currentPageEstimate} | Cần ký trang: ${signingPage}`}
            </span>
          </div>
        </div>
      </div>

      {/* Đường phân trang ước tính */}
      {Array.from({ length: 8 }).map((_, i) => {
        const lineY = (i + 1) * ESTIMATED_PAGE_HEIGHT_PX;
        return (
          <div
            key={i}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: lineY, pointerEvents: "none" }}
          >
            <div className="flex-1 border-t border-dashed border-slate-300/50" />
            <span className="mx-2 text-[9px] text-slate-400 bg-slate-50/90 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
              Trang {i + 2}
            </span>
            <div className="flex-1 border-t border-dashed border-slate-300/50" />
          </div>
        );
      })}

      {/* Draggable box — pointer-events auto CHỈ trên box */}
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
            {/* Nửa trái: chữ ký */}
            <img
              src={`data:image/png;base64,${signatureImage}`}
              alt="Chữ ký"
              className="w-1/2 h-full object-contain p-1 pointer-events-none"
              draggable={false}
            />
            {/* Nửa phải: text căn trên */}
            <div className="w-1/2 flex flex-col justify-start pt-1 pr-6 text-blue-600 leading-tight" style={{ fontSize: 12 }}>
              <span className="font-medium">{userName}</span>
              <span>
                {new Date().toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-teal-600 font-semibold">
            Chữ ký
          </div>
        )}
        <div className="absolute top-1 right-1 bg-teal-600/80 rounded p-0.5 pointer-events-none">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </div>
      </div>

      {/* Confirm button — fixed so it's always visible when scrolling */}
      {!disabled && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "40px",
            zIndex: 50,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            className={[
              "px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition flex items-center gap-2",
              onCorrectPage
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-amber-500 hover:bg-amber-600",
            ].join(" ")}
          >
            <svg
              className="w-4 h-4"
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
            Xác nhận vị trí
            {!onCorrectPage && (
              <span className="text-[10px] opacity-80">(khác trang ký)</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
