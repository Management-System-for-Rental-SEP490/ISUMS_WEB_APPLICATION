/**
 * Auth API Module
 * Handles all API calls related to authentication
 * Note: Most auth is handled by Keycloak, these are supplementary endpoints
 */

import api from "../../../lib/axios";
import { AUTH_ENDPOINTS, USERS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get current logged-in user info including roles from backend
 * @returns {Promise<Object>} { id, name, email, roles: string[], ... }
 * @throws {Error} If request fails
 */
export async function getMe() {
  try {
    const response = await api.get(AUTH_ENDPOINTS.ME);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 * @throws {Error} If request fails
 */
export async function getUserProfile() {
  try {
    const response = await api.get(AUTH_ENDPOINTS.PROFILE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update user profile
 * @param {Object} payload - Profile data to update
 * @returns {Promise<Object>} Updated profile
 * @throws {Error} If request fails
 */
export async function updateUserProfile(payload) {
  try {
    const response = await api.put(AUTH_ENDPOINTS.PROFILE, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Refresh authentication token
 * @returns {Promise<Object>} New token data
 * @throws {Error} If request fails
 */
export async function refreshToken() {
  try {
    const response = await api.post(AUTH_ENDPOINTS.REFRESH);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Logout user (server-side cleanup)
 * @returns {Promise<void>}
 * @throws {Error} If request fails
 */
/**
 * Update user preferred language on the server
 * @param {string} language - "vi" | "en" | "ja"
 * @returns {Promise<void>}
 */
export async function updateUserLanguage(language) {
  try {
    const response = await api.put(USERS_ENDPOINTS.LANGUAGE, { language });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function logout() {
  try {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return extractResponseData(response);
  } catch (error) {
    // Don't throw on logout errors, just log
    console.warn("Logout API call failed:", getErrorMessage(error));
  }
}
