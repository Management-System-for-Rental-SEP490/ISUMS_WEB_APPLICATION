import api from "../../../lib/axios";
import { FINANCE_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getFinanceDashboard({ from, to, compare = false, regionId = null } = {}) {
  try {
    const response = await api.get(FINANCE_ENDPOINTS.DASHBOARD, {
      params: { from, to, compare, ...(regionId ? { regionId } : {}) },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
