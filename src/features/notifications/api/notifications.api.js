import api from "../../../lib/axios";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";
import { getErrorMessage } from "../../../lib/api-helpers";

/**
 * Lấy danh sách thông báo của manager theo trang
 * @param {number} page - Số trang (bắt đầu từ 0)
 * @param {number} size - Số item mỗi trang
 * @returns {Promise<Object>} { content, totalElements, totalPages, ... }
 */
export async function getManagerNotifications(page = 0, size = 20) {
  try {
    const response = await api.get(NOTIFICATIONS_ENDPOINTS.MANAGER_LIST, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Lấy số thông báo chưa đọc
 * @returns {Promise<number>}
 */
export async function getManagerUnreadCount() {
  try {
    const response = await api.get(NOTIFICATIONS_ENDPOINTS.MANAGER_UNREAD_COUNT);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Đánh dấu 1 thông báo đã đọc
 * @param {string|number} id
 * @returns {Promise<void>}
 */
export async function markNotificationRead(id) {
  try {
    await api.put(NOTIFICATIONS_ENDPOINTS.MANAGER_MARK_READ(id));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise<void>}
 */
export async function markAllNotificationsRead() {
  try {
    await api.put(NOTIFICATIONS_ENDPOINTS.MANAGER_MARK_ALL_READ);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
