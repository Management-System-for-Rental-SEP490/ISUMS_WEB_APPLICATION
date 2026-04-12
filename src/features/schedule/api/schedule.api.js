import api from "../../../lib/axios";
import {
  MAINTENANCE_ENDPOINTS,
  SCHEDULE_ENDPOINTS,
} from "../../../lib/api-endpoints";
import {
  extractResponseData,
  getErrorMessage,
  throwApiError,
} from "../../../lib/api-helpers";

/**
 * Get all slots within a date range (used by week view).
 * @param {string} startDate - "YYYY-MM-DD"
 * @param {string} endDate   - "YYYY-MM-DD"
 * @returns {Promise<Array>} Raw slot list
 */
export async function getSlotsByWeek(startDate, endDate) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.BY_WEEK, {
      params: { startDate, endDate },
    });
    console.log(response);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all slots within a month (used by month view).
 * @param {number} year  - e.g. 2024
 * @param {number} month - 1-indexed (1=January … 12=December)
 * @returns {Promise<Array>} Raw slot list
 */
export async function getSlotsByMonth(year, month) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.BY_MONTH, {
      params: { year, month },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get a single slot by ID (including its jobs).
 * @param {string} id
 * @returns {Promise<Object>} Raw slot with jobs
 */
export async function getSlotById(id) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.SLOT_BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a new time slot.
 * @param {{ scheduledDate: string, scheduledTime: string, propertyId?: string }} payload
 * @returns {Promise<Object>} Created slot
 */
export async function createSlot(payload) {
  try {
    const response = await api.post(MAINTENANCE_ENDPOINTS.SLOTS, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a time slot.
 * @param {string} id
 */
export async function deleteSlot(id) {
  try {
    const response = await api.delete(MAINTENANCE_ENDPOINTS.SLOT_BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update a maintenance job (title, assignee, status, note, etc.).
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>} Updated job
 */
export async function updateJob(id, payload) {
  try {
    const response = await api.put(
      MAINTENANCE_ENDPOINTS.JOBS_BY_ID(id),
      payload,
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete a maintenance job.
 * @param {string} id
 */
export async function deleteJob(id) {
  try {
    const response = await api.delete(MAINTENANCE_ENDPOINTS.JOBS_BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all work slots within a date range (new schedule API).
 * @param {string} start - "YYYY-MM-DD"
 * @param {string} end   - "YYYY-MM-DD"
 * @returns {Promise<Array>} Raw work slot list
 */
export async function getWorkSlotsInRange(start, end) {
  try {
    const response = await api.get(SCHEDULE_ENDPOINTS.WORK_SLOTS_CURRENT, {
      params: { start, end },
    });
    console.log("[schedule] getWorkSlotsInRange →", response.data);
    return extractResponseData(response);
  } catch (error) {
    console.error("[schedule] getWorkSlotsInRange failed →", error);
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create a new work slot.
 * @param {{ staffId: string, jobId: string, jobType: string, startTime: string }} payload
 * @returns {Promise<Object>} Created work slot
 */
export async function createWorkSlot(payload) {
  try {
    const response = await api.post(SCHEDULE_ENDPOINTS.WORK_SLOTS, payload);
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Auto-assign maintenance job (MAINTENANCE type).
 * @param {{ jobId: string, startTime: string }} payload - startTime: "YYYY-MM-DDTHH:MM:SS"
 */
export async function confirmStaffWorkSlot(payload) {
  try {
    const response = await api.post(
      SCHEDULE_ENDPOINTS.WORK_SLOTS_CONFIRM_MAINTENANCE,
      payload,
    );
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Auto-assign issue job (ISSUE type).
 * @param {string} jobId
 */
export async function confirmIssueWorkSlot(jobId) {
  try {
    const response = await api.post(
      SCHEDULE_ENDPOINTS.WORK_SLOTS_MANAGER_CONFIRM(jobId),
    );
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Manually assign a staff to any job type.
 * @param {{ jobId: string, staffId: string, startTime: string, jobType: string }} payload
 */
export async function createManualWorkSlot(payload) {
  try {
    const response = await api.post(SCHEDULE_ENDPOINTS.WORK_SLOTS_MANUAL, payload);
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Get available work slots for a specific job and date.
 * Returns list of slots with availableStaffCount.
 * @param {string} jobId - UUID of the job
 * @param {string} date  - "YYYY-MM-DD"
 * @returns {Promise<Array<{ startTime: string, endTime: string, status: string, availableStaffCount: number }>>}
 */
export async function getAvailableSlotsByJob(jobId, date) {
  try {
    const response = await api.get(SCHEDULE_ENDPOINTS.WORK_SLOTS_SLOTS, {
      params: { jobId, date },
    });
    const data = extractResponseData(response);
    // API trả về data: [{ date, slots: [...] }]
    const dayList = Array.isArray(data) ? data : [];
    return dayList.flatMap((day) => day.slots ?? []);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get available staff IDs for a specific job slot.
 * @param {string} jobId     - UUID of the job
 * @param {string} date      - "YYYY-MM-DD"
 * @param {string} startTime - "HH:MM:SS"
 * @returns {Promise<string[]>} Array of staff UUIDs
 */
export async function getAvailableStaffForSlot(jobId, date, startTime) {
  try {
    const response = await api.get(SCHEDULE_ENDPOINTS.WORK_SLOTS_SLOTS_STAFF, {
      params: { jobId, date, startTime },
    });
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get the work schedule template for a given date (working days + time slot config).
 * @param {string} date - "YYYY-MM-DD"
 * @returns {Promise<Object>} Template config
 */
export async function getWorkTemplate(date) {
  try {
    const response = await api.get(SCHEDULE_ENDPOINTS.TEMPLATES_CURRENT(date));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
