import api from "../../../lib/axios";
import { USERS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getAllUsers() {
  try {
    const response = await api.get(USERS_ENDPOINTS.BASE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserById(id) {
  try {
    const response = await api.get(USERS_ENDPOINTS.BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getStaffs() {
  try {
    const response = await api.get(USERS_ENDPOINTS.GET_STAFF);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
