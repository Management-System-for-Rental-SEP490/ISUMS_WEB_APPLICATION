import api from "../lib/axios";
import { AUTH_ENDPOINTS } from "../lib/api-endpoints";
import { getErrorMessage } from "../lib/api-helpers";
export async function getUserByEmail(email) {
  try {
    const response = await api.get(
      AUTH_ENDPOINTS.GET.replace("{email}", email),
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
