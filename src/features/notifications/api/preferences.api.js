import api from "../../../lib/axios";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";
import { getErrorMessage } from "../../../lib/api-helpers";

/**
 * Notification preferences + subscription + voice call history APIs.
 * Wires the Settings tab "Notifications" to the new BE endpoints
 * introduced for the multi-channel routing system.
 */

export async function getMyPreferences() {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.PREFERENCES_ME);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

/**
 * Partial update — only fields you pass are touched on the server.
 * Range/validation is enforced by the BE; UI should mirror caps so the
 * user gets feedback before submit.
 */
export async function updateMyPreferences(patch) {
  try {
    const { data } = await api.put(NOTIFICATIONS_ENDPOINTS.PREFERENCES_ME, patch);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getMySubscription() {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.PREFERENCES_SUBSCRIPTION);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getMyQuota() {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.PREFERENCES_QUOTA);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function fireTestVoiceCall() {
  try {
    const { data } = await api.post(NOTIFICATIONS_ENDPOINTS.TEST_VOICE);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getMyCallHistory(page = 0, size = 20) {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.CALLS_ME, {
      params: { page, size },
    });
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

/** Self-upgrade — returns payment intent ref the BE hands off to Payment-Service. */
export async function upgradeToPremium(months = 1) {
  try {
    const { data } = await api.post(NOTIFICATIONS_ENDPOINTS.SUBSCRIPTIONS_UPGRADE, { months });
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}
