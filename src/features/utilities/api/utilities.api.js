import api from "../../../lib/axios";
import { UTILITY_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Fetch the fleet-wide utility-alerts snapshot for the authenticated
 * landlord/manager. BE composes forecast + thresholds + live alerts
 * and returns one envelope per (metric, month) pair:
 *
 *   { metric, unit, month, items: [ {houseId, currentUsage, monthlyLimit, status, ...} ], summary: {...} }
 *
 * The server scope-filters by JWT sub — no userId parameter here.
 *
 * @param {"electricity"|"water"} metric
 */
export async function getUtilityAlerts(metric = "electricity") {
  try {
    const res = await api.get(UTILITY_ENDPOINTS.ALERTS, {
      params: { metric },
    });
    return extractResponseData(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Per-house alerts — for the drawer that opens when a landlord clicks
 * a tile. The BE endpoint is paginated with a cursor; we expose one
 * page at a time and let the caller manage pagination state.
 *
 * @param {string} houseId
 * @param {object} [options]
 * @param {number} [options.limit=20]
 * @param {string} [options.cursor]
 * @param {"WARNING"|"CRITICAL"} [options.level]
 */
export async function getHouseAlerts(houseId, { limit = 20, cursor, level } = {}) {
  try {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    if (level) params.level = level;
    const res = await api.get(UTILITY_ENDPOINTS.HOUSE_ALERTS(houseId), { params });
    return extractResponseData(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Upsert the monthly consumption cap for a house + metric. Landlord-
 * only — the FE deep-links here from the "Set limit →" CTA on the
 * NO_DATA / WARNING tile. Metric must be the threshold key
 * ("electricity_monthly_kwh" or "water_monthly_m3") to match BE.
 *
 * Body shape matches the existing IotHouseThresholdController:
 *   { maxVal: number, enabled?: boolean, severity?: "WARNING"|"CRITICAL" }
 */
export async function upsertMonthlyLimit(houseId, metric, { maxVal, enabled = true, severity = "WARNING" }) {
  try {
    const res = await api.put(
      UTILITY_ENDPOINTS.HOUSE_THRESHOLD_BY_METRIC(houseId, metric),
      { maxVal, enabled, severity },
    );
    return extractResponseData(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
