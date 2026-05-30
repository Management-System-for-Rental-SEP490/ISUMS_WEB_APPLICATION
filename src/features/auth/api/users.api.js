import api from "../../../lib/axios";
import { USERS_ENDPOINTS } from "../../../lib/api-endpoints";
import { getErrorMessage } from "../../../lib/api-helpers";

/**
 * User-service helpers used outside of the auth flow itself —
 * staff/manager directory lookups for FE pickers (e.g. notification
 * escalation target).
 */

export async function getAllStaffs() {
  try {
    const { data } = await api.get(USERS_ENDPOINTS.GET_STAFF);
    return data?.data ?? data ?? [];
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getAllManagers() {
  try {
    const { data } = await api.get(USERS_ENDPOINTS.GET_MANAGERS);
    return data?.data ?? data ?? [];
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function createManager(payload) {
  // payload: { name, email, phoneNumber, identityNumber? }
  try {
    const { data } = await api.post(USERS_ENDPOINTS.CREATE_MANAGER, payload);
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getUserById(userId) {
  try {
    const { data } = await api.get(USERS_ENDPOINTS.BY_ID(userId));
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

/**
 * Update the calling user's phone number. BE validates against the
 * Vietnamese mobile pattern (0xxxxxxxxx or 84xxxxxxxxx). Throws on
 * validation error so the caller can surface the message to the user.
 */
export async function updateMyPhone(phoneNumber) {
  try {
    const { data } = await api.put(USERS_ENDPOINTS.PHONE, { phoneNumber });
    return data?.data ?? data;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}
