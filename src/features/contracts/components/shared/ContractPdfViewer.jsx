import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * @param {{ pdfUrl: string }} props
 */
export default function ContractPdfViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoadError(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
        Chưa có file PDF cho hợp đồng này.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-xl border border-red-200 bg-red-50 text-sm text-red-500">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Không thể tải file PDF. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full rounded-xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-[800px]">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm">Đang tải PDF...</span>
            </div>
          </div>
        }
      >
        {numPages && containerWidth &&
          Array.from({ length: numPages }, (_, i) => (
            <div key={i}>
              <Page
                pageNumber={i + 1}
                width={containerWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
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
    </div>
  );
}
