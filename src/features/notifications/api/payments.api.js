import api from "../../../lib/axios";
import { PAYMENTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { getErrorMessage } from "../../../lib/api-helpers";

/**
 * PREMIUM subscription upgrade — POSTs to Payment-Service which builds
 * a signed VNPay URL and returns it as the response body. The FE opens
 * that URL in a new tab; tier flip happens via VNPay IPN to BE
 * (independent of whether the user actually returns to the FE).
 *
 * Payment-Service already owns VNPay signing, IPN verification, and
 * the {@code payments} table — we just add a new {@code SUBSCRIPTION}
 * reference type instead of duplicating any of that here.
 */
export async function createSubscriptionPaymentLink(months = 1, opts = {}) {
  try {
    const { data } = await api.post(PAYMENTS_ENDPOINTS.VNPAY_SUBSCRIPTION, {
      months,
      bankCode: opts.bankCode || null,
      locale:   opts.locale   || "vn",
    });
    // Payment-Service returns the URL as the wrapped string body.
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}
