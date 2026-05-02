import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import DragSignatureBox from "./DragSignatureBox";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function normalizeSigningPage(rawPage, totalPages) {
  const parsed = Number(rawPage);
  const page = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
  return totalPages ? Math.min(page, totalPages) : page;
}

export default function ContractDocumentViewer({
  mainRef,
  iframeWrapperRef,
  contract,
  showDragBox,
  signingSession,
  signatureData,
  userName,
  onPositionSet,
}) {
  const { t } = useTranslation("common");
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(null);
  // pageInfo[i] = { heightPx, widthPt, heightPt } — kích thước thực tế từ react-pdf
  const [pageInfo, setPageInfo] = useState([]);
  const hasScrolledRef = useRef(false);
  const signingPage = normalizeSigningPage(signingSession?.signingPage, numPages);

  // Đo width thực của iframeWrapperRef để Page fill đúng
  useEffect(() => {
    const el = iframeWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPageWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [iframeWrapperRef]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  // Auto-scroll đến vị trí ô chữ ký sau khi vẽ xong và pageInfo đã sẵn sàng
  useEffect(() => {
    if (!showDragBox) {
      hasScrolledRef.current = false;
      return;
    }
    if (hasScrolledRef.current) return;

    const main = mainRef.current;
    const wrapper = iframeWrapperRef.current;
    if (!main || !wrapper) return;

    const signingPageIdx = signingPage - 1;
    const fallbackHeightPx = Math.max(wrapper.scrollHeight || wrapper.clientHeight || 0, 900);
    const info = pageInfo[signingPageIdx] ?? {
      heightPx: fallbackHeightPx,
      widthPt: 595,
      heightPt: 842,
    };

    // Tính Y của ô chữ ký trong iframeWrapper — ưu tiên vị trí VNPT nếu có
    const SEPARATOR_H_PX = 16;
    let pageOffsetY = 0;
    for (let i = 0; i < signingPageIdx; i++) {
      pageOffsetY += (pageInfo[i]?.heightPx ?? 0) + SEPARATOR_H_PX;
    }
    let boxY;
    const vnptPos = signingSession?.vnptPosition;
    if (vnptPos) {
      const parts = vnptPos.split(",").map(Number);
      if (parts.length === 4) {
        const [, , , ury] = parts;
        // Convert ury (pt, bottom-left origin) → px (top-left origin)
        const scaleY = info.heightPx / info.heightPt;
        const yInPage = Math.round((info.heightPt - ury) * scaleY);
        boxY = pageOffsetY + yInPage;
      }
    }
    if (boxY == null) boxY = pageOffsetY + Math.round(info.heightPx * 0.6);

    // Tính offset của iframeWrapper so với top của main (scroll container)
    const mainRect = main.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperTopInMain = wrapperRect.top - mainRect.top + main.scrollTop;

    // Scroll để ô chữ ký hiện ra giữa màn hình
    const scrollTarget = wrapperTopInMain + boxY - main.clientHeight / 2;
    main.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
    hasScrolledRef.current = true;
  }, [showDragBox, pageInfo, signingSession, signingPage, mainRef, iframeWrapperRef]);

  const pdfUrl = contract?.pdfUrl ?? null;

  return (
    <main ref={mainRef} className="flex-1 overflow-auto bg-slate-100 p-5">
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
          {t("contracts.progress.step2Drag")}
        </div>
      )}

      {/* iframeWrapperRef bọc ĐÚNG phần PDF → DragSignatureBox bị giới hạn trong này */}
      <div className="mx-auto max-w-[860px] bg-white rounded-xl shadow-md overflow-hidden">
        <div ref={iframeWrapperRef} className="relative">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-[800px]">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <svg
                      className="w-8 h-8 animate-spin"
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span className="text-sm">
                      {t("contracts.pdf.loading")}
                    </span>
                  </div>
                </div>
              }
            >
              {numPages &&
                pageWidth &&
                Array.from({ length: numPages }, (_, i) => (
                  <div key={i}>
                    <Page
                      pageNumber={i + 1}
                      width={pageWidth}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onLoadSuccess={(page) => {
                        // page.originalWidth / originalHeight là kích thước PDF tính bằng pt (điểm)
                        const widthPt = page.originalWidth;
                        const heightPt = page.originalHeight;
                        const heightPx = Math.round(
                          heightPt * (pageWidth / widthPt),
                        );
                        setPageInfo((prev) => {
                          const next = [...prev];
                          next[i] = { heightPx, widthPt, heightPt };
                          return next;
                        });
                      }}
                    />
                    {i < numPages - 1 && (
                      <div className="flex items-center gap-3 py-2 px-4 bg-slate-100">
                        <div className="flex-1 h-px bg-slate-300" />
                        <span className="text-[11px] text-slate-400 font-medium">
                          {i + 2} / {numPages}
                        </span>
                        <div className="flex-1 h-px bg-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
            </Document>
          ) : (
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
          )}

          {showDragBox && (
            <DragSignatureBox
              containerRef={iframeWrapperRef}
              onPositionSet={onPositionSet}
              signingPage={signingPage}
              signatureImage={signatureData.signatureImage}
              userName={userName}
              disabled={false}
              pageInfo={pageInfo}
              pageCount={numPages}
              defaultVnptPosition={signingSession?.vnptPosition ?? null}
            />
          )}
        </div>
      </div>
    </main>
  );
}
