/**
 * API Helper utilities
 * Common utilities for API requests and responses
 */

/**
 * Extract error message from API error response
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
const STATUS_MESSAGES = {
  400: "Dữ liệu gửi lên không hợp lệ.",
  401: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy tài nguyên yêu cầu.",
  409: "Dữ liệu đã tồn tại hoặc xung đột.",
  422: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
  500: "Lỗi máy chủ nội bộ, vui lòng thử lại sau.",
  502: "Máy chủ tạm thời không khả dụng.",
  503: "Dịch vụ đang bảo trì, vui lòng thử lại sau.",
};

/**
 * Throw a standardized API error that preserves HTTP status.
 * Usage: catch (error) { throwApiError(error); }
 * Caller can check: e.status === 500
 */
export function throwApiError(error) {
  const err = new Error(getErrorMessage(error));
  err.status = error.response?.status ?? null;
  throw err;
}

export function getErrorMessage(error) {
  if (error.response) {
    const { status, data } = error.response;
    // Ưu tiên errors[0].message → message → fallback status
    const serverMsg =
      data?.errors?.[0]?.message ||
      data?.message ||
      data?.error ||
      data?.msg;
    return serverMsg || STATUS_MESSAGES[status] || `Lỗi ${status}: ${error.response.statusText}`;
  } else if (error.request) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  } else {
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
