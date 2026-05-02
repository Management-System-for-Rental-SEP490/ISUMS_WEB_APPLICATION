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
function toSigningPosition(x, y, containerWidth, signingPage, pageInfo, info) {
  const pageOffsetY = getPageOffsetY(signingPage, pageInfo, info.heightPx);
  const yInPage = clamp(y - pageOffsetY, 0, info.heightPx);

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
  const { t } = useTranslation("common");
  const activePage = normalizeSigningPage(signingPage, pageCount);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dragOffset, setDragOffset] = useState({ page: activePage, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const activeOffset = dragOffset.page === activePage ? dragOffset : { x: 0, y: 0 };

  // Đo container để vẫn render được ô chữ ký khi preview là HTML/iframe hoặc PDF chưa có pageInfo.
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      const rect = el?.getBoundingClientRect();
      if (!rect?.width) return;
      setContainerSize({
        width: rect.width,
        height: Math.max(el.scrollHeight || 0, rect.height || 0),
      });
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
    if (!containerSize.width || !info) return null;

    const maxX = Math.max(containerSize.width - boxSize.w, 0);
    const minY = pageOffsetY;
    const maxY = Math.max(pageOffsetY + info.heightPx - boxSize.h, minY);
    const vnptPos = parseVnptPosition(defaultVnptPosition);

    if (vnptPos) {
      const scaleX = containerSize.width / info.widthPt;
      const scaleY = info.heightPx / info.heightPt;
      return {
        x: clamp(Math.round(vnptPos.llx * scaleX), 0, maxX),
        y: clamp(Math.round(pageOffsetY + (info.heightPt - vnptPos.ury) * scaleY), minY, maxY),
      };
    }

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
      const cw = rect?.width ?? containerSize.width;
      const containerLeftDelta = (rect?.left ?? startContainerLeft) - startContainerLeft;
      const containerTopDelta = (rect?.top ?? startContainerTop) - startContainerTop;

      const rawX = defaultPos.x + startOffsetX + (x - startMouseX) - containerLeftDelta;
      const rawY = defaultPos.y + startOffsetY + (y - startMouseY) - containerTopDelta;
      const minY = pageOffsetY;
      const maxY = Math.max(pageOffsetY + info.heightPx - boxSize.h, minY);
      const clampedX = clamp(rawX, 0, Math.max(cw - boxSize.w, 0));
      const clampedY = clamp(rawY, minY, maxY);

      setDragOffset({
        page: activePage,
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
    activePage,
    boxSize.h,
    boxSize.w,
    containerRef,
    containerSize.width,
    defaultPos,
    info.heightPx,
    isDragging,
    pageOffsetY,
  ]);

  const handleConfirm = () => {
    if (!pos || !containerSize.width) return;
    const signingPosition = toSigningPosition(
      pos.x,
      pos.y,
      containerSize.width,
      activePage,
      pageInfo,
      info,
    );
    onPositionSet({ signingPosition, page: activePage });
  };

  if (!pos) return null;

  return (
    <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }}>
      <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap" style={{ pointerEvents: "none" }}>
        <div className="rounded-xl border border-teal-300 bg-white/95 px-4 py-2 text-center shadow-md">
          <p className="text-xs font-semibold text-teal-700">{t("contracts.dragSignature.title")}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {t("contracts.dragSignature.hint", { page: activePage })}
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
              src={signatureImageSrc(signatureImage)}
              alt={t("contracts.dragSignature.alt")}
              className="h-full w-1/2 object-contain p-1 pointer-events-none"
              draggable={false}
            />
            <div className="flex w-1/2 flex-col justify-start pr-6 pt-1 leading-tight text-blue-600" style={{ fontSize: 12 }}>
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
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-teal-600">
            {t("contracts.dragSignature.alt")}
          </div>
        )}
        <div className="pointer-events-none absolute right-1 top-1 rounded bg-teal-600/80 p-0.5">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>

      {!disabled && (
        <div style={{ position: "fixed", bottom: "24px", right: "40px", zIndex: 50, pointerEvents: "auto" }}>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t("contracts.dragSignature.confirm")}
          </button>
        </div>
      )}
    </div>
  );
}
