import api from "../../../lib/axios";
import { TENANT_ALERTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getTenantAlertsFeed({ severity, status, lifeSafety, daysBack, limit } = {}) {
  try {
    const response = await api.get(TENANT_ALERTS_ENDPOINTS.FEED, {
      params: { severity, status, lifeSafety, daysBack, limit },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function acknowledgeTenantAlert(houseId, alertId, note) {
  try {
    const response = await api.post(
      TENANT_ALERTS_ENDPOINTS.ACKNOWLEDGE(houseId, alertId),
      { note: note || null }
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
