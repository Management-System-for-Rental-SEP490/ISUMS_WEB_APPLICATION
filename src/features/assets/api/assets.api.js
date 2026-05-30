import api from "../../../lib/axios";
import { ASSET_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get paginated asset items list
 * @param {Object} params - { page, size, keyword, status }
 * @returns {Promise<{ items, total, totalPages, currentPage, pageSize }>}
 */
export async function getAssetItems(params = {}) {
  try {
    const response = await api.get(ASSET_ENDPOINTS.ITEMS, { params });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAssetItemById(id) {
  try {
    const response = await api.get(ASSET_ENDPOINTS.ITEM_BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function managerConfirmAsset(id, status) {
  try {
    const response = await api.put(ASSET_ENDPOINTS.MANAGER_CONFIRM(id), { status });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
