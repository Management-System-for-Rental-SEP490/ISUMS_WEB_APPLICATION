import api from "../../../lib/axios";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";
import { getErrorMessage } from "../../../lib/api-helpers";

/**
 * Subscription plan catalogue API. Public listing returns active rows
 * only (for the tenant upgrade picker); admin listing includes
 * deactivated entries so the operator can re-enable historical plans.
 */

export async function listActivePlans() {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.PLANS_PUBLIC);
    return data?.data ?? data ?? [];
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function listAllPlans() {
  try {
    const { data } = await api.get(NOTIFICATIONS_ENDPOINTS.PLANS_ADMIN);
    return data?.data ?? data ?? [];
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function createPlan(payload) {
  try {
    const { data } = await api.post(NOTIFICATIONS_ENDPOINTS.PLANS_PUBLIC, payload);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function updatePlan(id, payload) {
  try {
    const { data } = await api.put(NOTIFICATIONS_ENDPOINTS.PLANS_BY_ID(id), payload);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function deactivatePlan(id) {
  try {
    const { data } = await api.delete(NOTIFICATIONS_ENDPOINTS.PLANS_BY_ID(id));
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}
