import api from "../../../lib/axios";
import { DASHBOARD_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Lấy thống kê tổng hợp dashboard.
 * @param {"6M"|"1Y"} period
 * @returns {Promise<{ propertyStats, contractTimeSeries, contractStatusBreakdown }>}
 */
export async function getDashboardStats(period = "6M") {
  try {
    const response = await api.get(DASHBOARD_ENDPOINTS.BASE, { params: { period } });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
