import api from "../../../lib/axios";
import { PAYMENTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getDepositRefundInvoice(contractId) {
  try {
    const response = await api.get(PAYMENTS_ENDPOINTS.DEPOSIT_REFUND_INVOICE(contractId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function markRefundPaid(invoiceId, payload) {
  try {
    const response = await api.put(PAYMENTS_ENDPOINTS.MARK_REFUND_PAID(invoiceId), {
      paymentMethod: payload.paymentMethod,
      note: payload.note?.trim() || null,
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
