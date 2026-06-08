import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { Wallet, CheckCircle2, Loader2, BadgeCheck, RefreshCw } from "lucide-react";
import { getContractById, confirmRefund } from "../../../contracts/api/contracts.api";
import { getDepositRefundInvoice, markRefundPaid } from "../../api/refund.api";

const METHODS = ["BANK_TRANSFER", "CASH"];

function formatVnd(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("vi-VN") + " ₫";
}

function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[calc(100%-32px)] max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function DepositRefundActions({ contractId }) {
  const { t } = useTranslation("common");
  const [status, setStatus] = useState(null);
  const [deposit, setDeposit] = useState(0);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [b1Open, setB1Open] = useState(false);
  const [b1Amount, setB1Amount] = useState("");
  const [b1Note, setB1Note] = useState("");

  const [b2Open, setB2Open] = useState(false);
  const [b2Method, setB2Method] = useState("BANK_TRANSFER");
  const [b2Note, setB2Note] = useState("");

  const load = useCallback(async () => {
    if (!contractId) return;
    try {
      const c = await getContractById(contractId);
      const s = (c?.status ?? "").toUpperCase();
      setStatus(s);
      setDeposit(Number(c?.depositAmount ?? 0) || 0);
      if (s === "DEPOSIT_REFUND_PENDING") {
        try { setInvoice(await getDepositRefundInvoice(contractId)); } catch { setInvoice(null); }
      } else {
        setInvoice(null);
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (status !== "PENDING_TERMINATION") return undefined;
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [status, load]);

  const submitB1 = async () => {
    if (busy) return;
    const amt = Number(b1Amount);
    if (!Number.isFinite(amt) || amt < 0) return;
    setBusy(true);
    try {
      await confirmRefund(contractId, { refundAmount: amt, note: b1Note });
      message.success(t("inspection.refund.confirmSuccess"));
      setB1Open(false);
      await load();
    } catch (e) {
      message.error(e?.message || t("inspection.refund.confirmError"));
    } finally {
      setBusy(false);
    }
  };

  const submitB2 = async () => {
    if (busy || !invoice?.invoiceId) return;
    setBusy(true);
    try {
      await markRefundPaid(invoice.invoiceId, { paymentMethod: b2Method, note: b2Note });
      message.success(t("inspection.refund.paidSuccess"));
      setB2Open(false);
      await load();
    } catch (e) {
      message.error(e?.message || t("inspection.refund.paidError"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;
  const s = status ?? "";
  if (!["PENDING_TERMINATION", "INSPECTION_DONE", "DEPOSIT_REFUND_PENDING", "TERMINATED"].includes(s)) {
    return null;
  }

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-5 h-5" style={{ color: "#3bb582" }} />
        <h3 className="text-base font-bold m-0" style={{ color: "#1E2D28" }}>
          {t("inspection.refund.title")}
        </h3>
      </div>

      {s === "PENDING_TERMINATION" && (
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm" style={{ color: "#5A7A6E" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("inspection.refund.waiting")}
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("inspection.refund.refreshBtn")}
          </button>
        </div>
      )}

      {s === "INSPECTION_DONE" && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm" style={{ color: "#5A7A6E" }}>
            {t("inspection.refund.readyHint")}
          </span>
          <button
            type="button"
            onClick={() => { setB1Amount(String(deposit || "")); setB1Note(""); setB1Open(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            <Wallet className="w-4 h-4" />
            {t("inspection.refund.confirmBtn")}
          </button>
        </div>
      )}

      {s === "DEPOSIT_REFUND_PENDING" && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm" style={{ color: "#5A7A6E" }}>
            <div className="font-semibold" style={{ color: "#6b21a8" }}>{t("inspection.refund.pendingLabel")}</div>
            {invoice?.refundAmount != null && (
              <div className="mt-0.5">{t("inspection.refund.refundAmountLabel")}: <strong>{formatVnd(invoice.refundAmount)}</strong></div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setB2Method("BANK_TRANSFER"); setB2Note(""); setB2Open(true); }}
            disabled={!invoice?.invoiceId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)" }}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t("inspection.refund.paidBtn")}
          </button>
        </div>
      )}

      {s === "TERMINATED" && (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(21,128,61,0.08)" }}>
          <BadgeCheck className="w-4 h-4" style={{ color: "#15803d" }} />
          <span className="text-sm font-semibold" style={{ color: "#15803d" }}>{t("inspection.refund.doneLabel")}</span>
        </div>
      )}

      {b1Open && (
        <Overlay onClose={() => !busy && setB1Open(false)}>
          <h3 className="m-0 text-base font-bold text-slate-900">{t("inspection.refund.confirmDialogTitle")}</h3>
          <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-slate-600">{t("inspection.refund.confirmDialogDesc")}</p>
          <label className="block mb-3">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">{t("inspection.refund.amountLabel")}</span>
            <input
              type="number"
              min="0"
              value={b1Amount}
              onChange={(e) => setB1Amount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">{t("inspection.refund.noteLabel")}</span>
            <textarea
              rows={3}
              value={b1Note}
              onChange={(e) => setB1Note(e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2.5">
            <button type="button" onClick={() => setB1Open(false)} disabled={busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {t("inspection.refund.cancel")}
            </button>
            <button type="button" onClick={submitB1} disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              {t("inspection.refund.confirmBtn")}
            </button>
          </div>
        </Overlay>
      )}

      {b2Open && (
        <Overlay onClose={() => !busy && setB2Open(false)}>
          <h3 className="m-0 text-base font-bold text-slate-900">{t("inspection.refund.paidDialogTitle")}</h3>
          <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-slate-600">{t("inspection.refund.paidDialogDesc")}</p>
          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
            {t("inspection.refund.refundAmountLabel")}: <strong>{formatVnd(invoice?.refundAmount)}</strong>
          </div>
          <label className="block mb-3">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">{t("inspection.refund.methodLabel")}</span>
            <select
              value={b2Method}
              onChange={(e) => setB2Method(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{t(`inspection.refund.method.${m}`)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">{t("inspection.refund.noteLabel")}</span>
            <textarea
              rows={3}
              value={b2Note}
              onChange={(e) => setB2Note(e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2.5">
            <button type="button" onClick={() => setB2Open(false)} disabled={busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {t("inspection.refund.cancel")}
            </button>
            <button type="button" onClick={submitB2} disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)" }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t("inspection.refund.paidBtn")}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}
