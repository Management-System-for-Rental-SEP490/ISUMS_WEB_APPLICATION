import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Wallet, Printer, X, AlertCircle } from "lucide-react";
import {
  confirmCashDeposit,
  downloadCashDepositReceiptPdf,
} from "../../api/contracts.api";

function formatVnd(value) {
  if (value == null || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

function parseVndInput(text) {
  if (!text) return "";
  return String(text).replace(/[^\d]/g, "");
}

function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cash-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function openPdfInNewTab(blob, filename) {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function CashDepositConfirmModal({
  open,
  onClose,
  contractId,
  contractNumber,
  tenantName,
  expectedAmount,
  onConfirmed,
}) {
  const { t } = useTranslation("common");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(null);
  const [issued, setIssued] = useState(null);

  useEffect(() => {
    if (!open) return;
    setAmountStr(expectedAmount != null ? String(expectedAmount) : "");
    setNote("");
    setAcknowledged(false);
    setSubmitting(false);
    setIssued(null);
    setIdempotencyKey(generateIdempotencyKey());
  }, [open, expectedAmount]);

  const amountNumber = useMemo(() => {
    const raw = parseVndInput(amountStr);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [amountStr]);

  const amountMatches =
    expectedAmount != null && amountNumber != null && amountNumber === expectedAmount;

  const submitDisabled =
    submitting || !acknowledged || amountNumber == null || amountNumber <= 0 || !amountMatches;

  const handleSubmit = async () => {
    if (submitDisabled) return;
    setSubmitting(true);
    try {
      const dto = await confirmCashDeposit(
        contractId,
        { amount: amountNumber, note: note.trim() || null },
        idempotencyKey,
      );
      setIssued(dto);
      toast.success(t("contracts.cashDeposit.toast.success", { number: dto?.receiptNumber }));
      if (typeof onConfirmed === "function") onConfirmed(dto);
    } catch (err) {
      const status = err?.response?.status;
      const apiMessage = err?.response?.data?.message;
      const fallback =
        status === 400
          ? t("contracts.cashDeposit.toast.error400")
          : status === 403
            ? t("contracts.cashDeposit.toast.error403")
            : status === 404
              ? t("contracts.cashDeposit.toast.error404")
              : status === 409
                ? t("contracts.cashDeposit.toast.error409")
                : t("contracts.cashDeposit.toast.errorDefault");
      toast.error(apiMessage || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!issued?.receiptNumber) return;
    try {
      const blob = await downloadCashDepositReceiptPdf(contractId, issued.receiptNumber);
      await openPdfInNewTab(blob, `${issued.receiptNumber}.pdf`);
    } catch {
      toast.error(t("contracts.cashDeposit.toast.pdfError"));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={() => (submitting ? null : onClose())}
    >
      <div
        className="w-[calc(100%-32px)] max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/70 bg-emerald-50 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="m-0 text-base font-bold text-slate-900">
              {t("contracts.cashDeposit.modal.title")}
            </h3>
            <p className="mt-1 text-[12px] text-slate-500">
              {t("contracts.cashDeposit.modal.subtitle")}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!issued && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-[13px]">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  {t("contracts.cashDeposit.modal.contract")}
                </div>
                <div className="font-semibold text-slate-800">
                  {contractNumber || contractId?.slice(0, 8) || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  {t("contracts.cashDeposit.modal.tenant")}
                </div>
                <div className="font-semibold text-slate-800">{tenantName || "—"}</div>
              </div>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">
                {t("contracts.cashDeposit.modal.amountLabel")}
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatVnd(amountStr)}
                  onChange={(e) => setAmountStr(parseVndInput(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-[15px] font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  disabled={submitting}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] font-semibold text-slate-500">
                  ₫
                </span>
              </div>
              {expectedAmount != null && !amountMatches && amountNumber != null && (
                <p className="mt-1 flex items-center gap-1 text-[12px] text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("contracts.cashDeposit.modal.amountMismatch", {
                    expected: formatVnd(expectedAmount),
                  })}
                </p>
              )}
            </label>

            <label className="mb-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-700">
                {t("contracts.cashDeposit.modal.noteLabel")}
              </span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={submitting}
                maxLength={500}
                placeholder={t("contracts.cashDeposit.modal.notePlaceholder")}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            <label className="mb-5 flex items-start gap-2 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={submitting}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{t("contracts.cashDeposit.modal.acknowledge")}</span>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("contracts.cashDeposit.modal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("contracts.cashDeposit.modal.submit")}
              </button>
            </div>
          </>
        )}

        {issued && (
          <div>
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-[12px] uppercase tracking-wide text-emerald-700">
                {t("contracts.cashDeposit.modal.issuedTitle")}
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {issued.receiptNumber}
              </div>
              <div className="mt-1 text-[13px] text-emerald-800">
                {formatVnd(issued.amount)} ₫ · {t("contracts.cashDeposit.modal.method")}
              </div>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-slate-600">
              {t("contracts.cashDeposit.modal.issuedHint")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("contracts.cashDeposit.modal.close")}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:shadow-lg"
              >
                <Printer className="h-4 w-4" />
                {t("contracts.cashDeposit.modal.printPdf")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
