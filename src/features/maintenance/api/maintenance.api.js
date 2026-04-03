import api from "../../../lib/axios";
import { MAINTENANCE_ENDPOINTS, SCHEDULE_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage, throwApiError } from "../../../lib/api-helpers";

/**
 * Add houses to an existing maintenance plan.
 * @param {string} planId
 * @param {string[]} houseIds
 * @returns {Promise<Object>}
 */
export async function addHousesToPlan(planId, houseIds) {
  try {
    const response = await api.post(MAINTENANCE_ENDPOINTS.PLANS_HOUSES(planId), { houseIds });
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Create a new maintenance plan.
 * @param {{ name: string, frequencyType: string, frequencyValue: number, effectiveFrom: string, effectiveTo: string, nextRunAt: string }} payload
 * @returns {Promise<Object>} Created plan
 */
export async function createMaintenancePlan(payload) {
  try {
    const response = await api.post(MAINTENANCE_ENDPOINTS.PLANS, payload);
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}

/**
 * Get a maintenance plan by ID.
 * @param {string} planId
 * @returns {Promise<Object>}
 */
export async function getMaintenancePlanById(planId) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.PLANS_BY_ID(planId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all maintenance plans.
 * @returns {Promise<Array>} List of plans
 */
export async function getMaintenancePlans() {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.PLANS);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Generate maintenance jobs from existing plans.
 * POST /maintenances/jobs/generate
 * @returns {Promise<Array>} List of generated jobs
 */
export async function generateMaintenanceJobs() {
  try {
    const response = await api.post(MAINTENANCE_ENDPOINTS.JOBS_GENERATE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get maintenance jobs filtered by status.
 * @param {string} status - e.g. "CREATED"
 * @returns {Promise<Array>}
 */
export async function getMaintenanceJobsByStatus(status) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.JOBS_BY_STATUS, {
      params: { status },
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get all maintenance jobs.
 * @returns {Promise<Array>}
 */
export async function getMaintenanceJobs() {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.JOBS);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get a maintenance job by ID.
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export async function getJobById(jobId) {
  try {
    const response = await api.get(MAINTENANCE_ENDPOINTS.JOBS_BY_ID(jobId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Manager confirms a work slot by jobId (path param).
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export async function confirmManagerWorkSlot(jobId) {
  try {
    const response = await api.post(SCHEDULE_ENDPOINTS.WORK_SLOTS_MANAGER_CONFIRM(jobId));
    return extractResponseData(response);
  } catch (error) {
    throwApiError(error);
  }
}
