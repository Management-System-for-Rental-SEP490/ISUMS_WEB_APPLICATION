import DragSignatureBox from "./DragSignatureBox";

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
          Kéo ô chữ ký vào vị trí mong muốn trên hợp đồng
        </div>
      )}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div ref={iframeWrapperRef} className="relative">
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
                  e.target.contentWindow.document.documentElement.scrollHeight;
                if (h > 0) e.target.style.height = h + 200 + "px";
              } catch {
                /* ignore cross-origin */
              }
            }}
          />
          {showDragBox && (
            <DragSignatureBox
              containerRef={iframeWrapperRef}
              onPositionSet={onPositionSet}
              signingPage={signingSession?.signingPage ?? 1}
              signatureImage={signatureData.signatureImage}
              userName={userName}
              disabled={false}
            />
          )}
        </div>
      </div>
    </main>
  );
}
