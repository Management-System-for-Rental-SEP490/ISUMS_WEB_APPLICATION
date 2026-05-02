import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Kích thước ô chữ ký mặc định (pt) — khớp với VNPT
const SIG_W_PT = 170;
const SIG_H_PT = 90;

// Chiều cao phần separator giữa các trang PDF (py-2 = 8+8px)
const SEPARATOR_H_PX = 16;
const FALLBACK_PAGE_W_PT = 595;
const FALLBACK_PAGE_H_PT = 842;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function normalizeSigningPage(page, pageCount) {
  const parsed = Number(page);
  const normalized = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
  return pageCount ? Math.min(normalized, pageCount) : normalized;
}

function createFallbackPageInfo(containerWidth, containerHeight) {
  const widthPx = Math.max(containerWidth || 0, FALLBACK_PAGE_W_PT);
  const heightPx = Math.max(containerHeight || 0, FALLBACK_PAGE_H_PT);
  const scale = widthPx / FALLBACK_PAGE_W_PT;
  return {
    heightPx,
    widthPt: FALLBACK_PAGE_W_PT,
    heightPt: Math.max(Math.round(heightPx / scale), FALLBACK_PAGE_H_PT),
    fallback: true,
  };
}

function getPageInfo(signingPage, pageInfo, containerWidth, containerHeight) {
  return pageInfo[signingPage - 1] ?? createFallbackPageInfo(containerWidth, containerHeight);
}

function getPageOffsetY(signingPage, pageInfo, fallbackHeightPx) {
  let offset = 0;
  for (let i = 0; i < signingPage - 1; i++) {
    offset += (pageInfo[i]?.heightPx ?? fallbackHeightPx) + SEPARATOR_H_PX;
  }
  return offset;
}

function parseVnptPosition(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  const [llx, lly, urx, ury] = parts;
  return { llx, lly, urx, ury };
}

function signatureImageSrc(value) {
  if (!value) return "";
  return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
}

/**
 * Chuyển vị trí box (px trong container) sang tọa độ PDF (pt trong trang).
 * Format: "llx,lly,urx,ury" — gốc tọa độ ở góc dưới-trái trang.
 */
function toSigningPosition(x, y, containerWidth, signingPage, pageInfo) {
  const info = pageInfo[signingPage - 1];
  if (!info) {
    console.warn(
      "[DragSignatureBox] pageInfo chưa sẵn sàng cho trang",
      signingPage,
    );
    return "0,0,0,0";
  }
  const {
    heightPx: pageHeightPx,
    widthPt: pageWidthPt,
    heightPt: pageHeightPt,
  } = info;
  const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
  const yInPage = y - pageOffsetY;

  const scaleX = info.widthPt / containerWidth;
  const scaleY = info.heightPt / info.heightPx;

  const llx = clamp(Math.round(x * scaleX), 0, Math.max(info.widthPt - SIG_W_PT, 0));
  const urx = Math.round(llx + SIG_W_PT);
  const ury = clamp(Math.round(info.heightPt - yInPage * scaleY), SIG_H_PT, info.heightPt);
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
  pageCount = null,
  disabled = false,
  signatureImage,
  userName = "",
  pageInfo = [],
  defaultVnptPosition = null,
}) {
  const signatureSrc = signatureImage
    ? signatureImage.startsWith("data:")
      ? signatureImage
      : `data:image/png;base64,${signatureImage}`
    : "";
  const [containerWidth, setContainerWidth] = useState(0);
  // dragOffset lưu kèm trang — nếu trang thay đổi, offset tự bị bỏ qua khi render
  const [dragOffset, setDragOffset] = useState({
    page: signingPage,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const containerHeightRef = useRef(1200);

  // offset thực tế: chỉ dùng nếu đúng trang đang ký
  const activeOffset =
    dragOffset.page === signingPage ? dragOffset : { x: 0, y: 0 };

  // Đo container để vẫn render được ô chữ ký khi preview là HTML/iframe hoặc PDF chưa có pageInfo.
  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect?.width) setContainerWidth(rect.width);
      const scrollHeight = containerRef.current?.scrollHeight;
      if (scrollHeight) containerHeightRef.current = scrollHeight;
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  const info = useMemo(
    () => getPageInfo(activePage, pageInfo, containerSize.width, containerSize.height),
    [activePage, containerSize.height, containerSize.width, pageInfo],
  );

  const pageOffsetY = useMemo(
    () => getPageOffsetY(activePage, pageInfo, info.heightPx),
    [activePage, info.heightPx, pageInfo],
  );

  const boxSize = useMemo(() => {
    if (!containerSize.width) return { w: 170, h: 90 };
    return {
      w: Math.round(SIG_W_PT * (containerSize.width / info.widthPt)),
      h: Math.round(SIG_H_PT * (info.heightPx / info.heightPt)),
    };
  }, [containerSize.width, info]);

  const defaultPos = useMemo(() => {
    if (!containerWidth) return null;
    if (!info) {
      const boxW = 170;
      const boxH = 90;
      const containerHeight = containerHeightRef.current || 1200;
      return {
        x: Math.max(0, Math.round((containerWidth - boxW) / 2)),
        y: Math.max(0, Math.round((containerHeight - boxH) / 2)),
      };
    }
    const pageOffsetY = getPageOffsetY(signingPage, pageInfo);
    const boxW = Math.round(SIG_W_PT * (containerWidth / info.widthPt));
    const boxH = Math.round(SIG_H_PT * (info.heightPx / info.heightPt));
    return {
      x: Math.round((containerSize.width - boxSize.w) / 2),
      y: Math.round(pageOffsetY + (info.heightPx - boxSize.h) / 2),
    };
  }, [boxSize.h, boxSize.w, containerSize.width, defaultVnptPosition, info, pageOffsetY]);

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
    if (!isDragging) return undefined;

    const handleMove = (e) => {
      if (!dragRef.current || !defaultPos) return;
      e.preventDefault();
      const { x, y } = getClientXY(e);
      const {
        startMouseX,
        startMouseY,
        startOffsetX,
        startOffsetY,
        startContainerLeft,
        startContainerTop,
      } = dragRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      const cw = rect?.width ?? containerWidth;
      const ch = containerRef.current?.scrollHeight ?? 1200;
      const containerLeftDelta =
        (rect?.left ?? startContainerLeft) - startContainerLeft;
      const containerTopDelta =
        (rect?.top ?? startContainerTop) - startContainerTop;

      const rawX =
        defaultPos.x + startOffsetX + (x - startMouseX) - containerLeftDelta;
      const rawY =
        defaultPos.y + startOffsetY + (y - startMouseY) - containerTopDelta;
      const clampedX = Math.max(0, Math.min(rawX, cw - boxSize.w));
      const clampedY = Math.max(0, Math.min(rawY, ch - boxSize.h));

      setDragOffset({
        page: signingPage,
        x: clampedX - defaultPos.x,
        y: clampedY - defaultPos.y,
      });
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
  }, [
    isDragging,
    containerRef,
    boxSize,
    containerWidth,
    defaultPos,
    signingPage,
  ]);

  const handleConfirm = () => {
    const rectWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    const effectiveWidth = containerWidth || rectWidth;
    if (!pos || !effectiveWidth) return;
    const signingPosition = toSigningPosition(
      pos.x,
      pos.y,
      effectiveWidth,
      signingPage,
      pageInfo,
    );
    onPositionSet({ signingPosition, page: signingPage });
  };

  if (!pos) return null;

  return (
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
            Sau đó bấm &quot;Xác nhận vị trí&quot; — trang ký:{" "}
            <strong>{signingPage}</strong>
          </p>
        </div>
      </div>

      <div
        className="absolute select-none overflow-hidden rounded-lg border-2 border-teal-500 bg-white/95 shadow-xl"
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
          <div className="flex h-full w-full">
            <img
              src={signatureSrc}
              alt="Chữ ký"
              className="w-1/2 h-full object-contain p-1 pointer-events-none"
              draggable={false}
            />
            <div
              className="w-1/2 flex flex-col justify-start pt-1 pr-6 text-blue-600 leading-tight"
              style={{ fontSize: 12 }}
            >
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
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-700"
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
            {t("contracts.dragSignature.confirm")}
          </button>
        </div>
      )}
    </div>
  );
}
