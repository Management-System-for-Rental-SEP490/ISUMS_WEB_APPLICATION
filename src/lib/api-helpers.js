/**
 * API Helper utilities
 * Common utilities for API requests and responses
 */

/**
 * Extract error message from API error response
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export function getErrorMessage(error) {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data;
    return (
      data?.message ||
      data?.error ||
      data?.msg ||
      `Lỗi ${error.response.status}: ${error.response.statusText}`
    );
  } else if (error.request) {
    // Request made but no response
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  } else {
    // Something else happened
    return error.message || "Đã xảy ra lỗi không xác định.";
  }
}

/**
 * Extract data from API response
 * Handles different response formats from backend
 * @param {Object} response - Axios response object
 * @returns {any} - Extracted data
 */
export function extractResponseData(response) {
  const data = response.data;

  // If response has standard format { success, data, message }
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }

  // If response has { success, items } format
  if (data && typeof data === "object" && "items" in data) {
    return data.items;
  }

  // Return raw data
  return data;
}

/**
 * Convert date string to ISO format for API
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string|null} - ISO date string or null
 */
export function toISOString(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Convert date string to ISO datetime with timezone for API
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string|null} - ISO datetime string (YYYY-MM-DDTHH:mm:ssZ) or null
 */
export function toISODateTime(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    // Ensure time is set to 00:00:00 if only date is provided
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Format date to YYYY-MM-DD for API
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string|null} - Formatted date string or null
 */
export function toDateString(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} - Query string
 */
export function buildQueryString(params) {
  if (!params || typeof params !== "object") return "";
  
  const entries = Object.entries(params).filter(
    ([_, value]) => value !== null && value !== undefined && value !== ""
  );
  
  if (entries.length === 0) return "";
  
  const searchParams = new URLSearchParams();
  entries.forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  return `?${searchParams.toString()}`;
}

/**
 * Check if API response indicates success
 * @param {Object} response - API response
 * @returns {boolean} - True if success
 */
export function isSuccessResponse(response) {
  if (!response) return false;
  
  // Check standard success field
  if (typeof response.success === "boolean") {
    return response.success;
  }
  
  // Check HTTP status
  if (response.status >= 200 && response.status < 300) {
    return true;
  }
  
  return true; // Default to true if no clear indicator
}
