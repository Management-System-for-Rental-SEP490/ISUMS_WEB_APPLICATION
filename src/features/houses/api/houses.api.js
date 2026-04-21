/**
 * Houses API Module
 * Handles all API calls related to houses/properties
 */

import api from "../../../lib/axios";
import { HOUSES_ENDPOINTS, ASSET_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get all houses with optional server-side filtering/pagination
 * @param {Object} params - Query params: page, size, keyword, sortBy, sortDir, status
 * @returns {Promise<Object>} Paginated response { items, total, totalPages, currentPage, pageSize }
 * @throws {Error} If request fails
 */
export async function getAllHouses(params = {}) {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.BASE, { params });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get house by ID
 * @param {string} id - House ID
 * @returns {Promise<Object>} House details
 * @throws {Error} If request fails
 */
export async function getHouseById(id) {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create new house
 * @param {Object} payload - House data
 * @returns {Promise<Object>} Created house
 * @throws {Error} If request fails
 */
export async function createHouse(payload) {
  try {
    const response = await api.post(HOUSES_ENDPOINTS.CREATE, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update house
 * @param {string} id - House ID
 * @param {Object} payload - Updated house data
 * @returns {Promise<Object>} Updated house
 * @throws {Error} If request fails
 */
export async function updateHouse(id, payload) {
  try {
    const response = await api.put(HOUSES_ENDPOINTS.UPDATE(id), payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete house
 * @param {string} id - House ID
 * @returns {Promise<void>}
 * @throws {Error} If request fails
 */
export async function deleteHouse(id) {
  try {
    const response = await api.delete(HOUSES_ENDPOINTS.DELETE(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all regions (khu vực quản lý)
 * @returns {Promise<Array>} List of regions [{ id, name, description, managerId, technicalStaffIds }]
 */
export async function getRegions() {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.REGIONS);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Upload images for a house (multipart/form-data)
 * @param {string} houseId - House ID
 * @param {File[]} files - Array of File objects
 * @returns {Promise<Object>}
 * @throws {Error} If request fails
 */
export async function uploadHouseImages(houseId, files) {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post(HOUSES_ENDPOINTS.IMAGES(houseId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}


/**
 * Get all assets belonging to a house
 * @param {string} houseId
 * @returns {Promise<Array>} List of assets
 */
export async function getAssetsByHouse(houseId) {
  try {
    const response = await api.get(ASSET_ENDPOINTS.BY_HOUSE(houseId));
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a functional area inside a house
 * @param {Object} payload - { house, name, areaType, floorNo, description }
 * @returns {Promise<Object>}
 */
export async function createFunctionalArea(payload) {
  try {
    const response = await api.post(HOUSES_ENDPOINTS.FUNCTIONAL_AREAS, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get assets by functional area
 * @param {string} houseId
 * @param {string} areaId
 * @returns {Promise<Array>}
 */
export async function getAssetsByFunctionArea(houseId, areaId) {
  try {
    const response = await api.get(ASSET_ENDPOINTS.BY_FUNCTION_AREA(houseId, areaId));
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get house activity history
 * @param {string} houseId
 * @returns {Promise<Array>}
 */
export async function getHouseHistory(houseId) {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.HISTORY(houseId));
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get asset categories
 * @returns {Promise<Array>}
 */
export async function getAssetCategories() {
  try {
    const response = await api.get(ASSET_ENDPOINTS.CATEGORY);
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a new asset item
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createAsset(payload) {
  try {
    const response = await api.post(ASSET_ENDPOINTS.CREATE_ITEM, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Upload images for an asset
 * @param {string} assetId
 * @param {File[]} files
 * @returns {Promise<Object>}
 */
export async function uploadAssetImages(assetId, files) {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post(ASSET_ENDPOINTS.ITEM_IMAGES(assetId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update house translations
 * @param {string} houseId
 * @param {Object} payload - { nameTranslations, addressTranslations, wardTranslations, communeTranslations, cityTranslations, descriptionTranslations }
 * @returns {Promise<Object>}
 */
export async function updateHouseTranslations(houseId, payload) {
  try {
    const response = await api.patch(HOUSES_ENDPOINTS.TRANSLATIONS(houseId), payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get single asset detail by ID
 * @param {string} assetId
 * @returns {Promise<Object>}
 */
export async function getAssetById(assetId) {
  try {
    const response = await api.get(ASSET_ENDPOINTS.ITEM_BY_ID(assetId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
