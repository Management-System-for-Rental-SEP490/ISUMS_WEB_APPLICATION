import api from "../../../lib/axios";
import { INSPECTION_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get inspection detail by ID
 * @param {string} inspectionId
 * @returns {Promise<Object>} { status, inspectionNotes, deductionAmount, photoUrls, completedAt, jobId, ... }
 */
export async function getInspectionById(inspectionId) {
  try {
    const response = await api.get(INSPECTION_ENDPOINTS.GET(inspectionId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update inspection status
 * @param {string} inspectionId
 * @param {string} status - e.g. "APPROVED"
 */
export async function updateInspectionStatus(inspectionId, status) {
  try {
    const response = await api.put(INSPECTION_ENDPOINTS.UPDATE(inspectionId), { status });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get asset events recorded by staff for a job
 * @param {string} jobId
 * @returns {Promise<Array>} [{ assetId, assetName, conditionPercent, note, eventType }]
 */
export async function getAssetEventsByJob(jobId) {
  try {
    const response = await api.get(INSPECTION_ENDPOINTS.ASSET_EVENTS_BY_JOB(jobId));
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
