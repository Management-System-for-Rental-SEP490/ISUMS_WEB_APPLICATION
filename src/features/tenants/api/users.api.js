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

export async function createStaff({ name, email, phoneNumber, identityNumber }) {
  try {
    const response = await api.post(USERS_ENDPOINTS.CREATE_STAFF, {
      name,
      email,
      phoneNumber,
      identityNumber,
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getManagers() {
  try {
    const response = await api.get(USERS_ENDPOINTS.GET_MANAGERS);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createManager({ name, email, phoneNumber, identityNumber }) {
  try {
    const response = await api.post(USERS_ENDPOINTS.CREATE_MANAGER, {
      name,
      email,
      phoneNumber,
      identityNumber,
    });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
