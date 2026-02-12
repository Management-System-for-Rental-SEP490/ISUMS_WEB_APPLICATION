/**
 * Houses API Module
 * Handles all API calls related to houses/properties
 */

import api from "../../../lib/axios";
import { HOUSES_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get all houses
 * @returns {Promise<Array>} List of houses
 * @throws {Error} If request fails
 */
export async function getAllHouses() {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.BASE);
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
