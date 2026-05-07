import api from "../../../lib/axios";
import { CONTRACTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData } from "../../../lib/api-helpers";

export async function getMyLandlordProfile() {
  const response = await api.get(CONTRACTS_ENDPOINTS.LANDLORD_PROFILE_ME);
  return extractResponseData(response);
}

export async function upsertMyLandlordProfile(payload) {
  const response = await api.put(CONTRACTS_ENDPOINTS.LANDLORD_PROFILE_ME, payload);
  return extractResponseData(response);
}
