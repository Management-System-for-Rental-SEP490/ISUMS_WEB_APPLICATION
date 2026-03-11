/**
 * Contracts API Module
 * Handles all API calls related to rental contracts
 */

import api from "../../../lib/axios";
import { CONTRACTS_ENDPOINTS } from "../../../lib/api-endpoints";
import {
  extractResponseData,
  getErrorMessage,
  toISOString,
} from "../../../lib/api-helpers";

/**
 * @param {Object} payload - Raw contract data
 * @returns {Object} Transformed payload
 */
function transformContractPayload(payload) {
  return {
    isNewAccount: Boolean(payload.isNewAccount ?? false),
    name: payload.name?.trim() || "",
    email: payload.email?.trim() || "",
    phoneNumber: payload.phoneNumber?.trim() || "",
    identityNumber: payload.identityNumber?.trim() || "",
    houseId: payload.houseId?.trim() || "",
    dateOfIssue: toISOString(payload.dateOfIssue),
    placeOfIssue: payload.placeOfIssue?.trim() || "",
    tenantAddress: payload.tenantAddress?.trim() || "",
    startDate: toISOString(payload.startDate),
    endDate: toISOString(payload.endDate),
    rentAmount: Number(payload.rentAmount) || 0,
    payDate: Number(payload.payDate) || 5,
    depositAmount: Number(payload.depositAmount) || 0,
    depositDate: toISOString(payload.depositDate),
    handoverDate: toISOString(payload.handoverDate),
  };
}

/**
 * Get all contracts
 * @returns {Promise<Array>} List of contracts
 * @throws {Error} If request fails
 */
export async function getAllContracts() {
  try {
    const response = await api.get(CONTRACTS_ENDPOINTS.BASE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get contract by ID
 * @param {string} id - Contract ID
 * @returns {Promise<Object>} Contract details
 * @throws {Error} If request fails
 */
export async function getContractById(id) {
  try {
    const response = await api.get(CONTRACTS_ENDPOINTS.BY_ID(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create new contract
 * @param {Object} payload - Contract data
 * @returns {Promise<Object>} Created contract
 * @throws {Error} If request fails
 */
export async function createContract(payload) {
  try {
    const body = transformContractPayload(payload);
    const response = await api.post(CONTRACTS_ENDPOINTS.CREATE, body);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Update contract HTML content only
 * @param {string} id - Contract ID
 * @param {string} html - Full HTML document content
 * @returns {Promise<Object>} Updated contract
 * @throws {Error} If request fails
 */
export async function updateContractHtml(id, html) {
  try {
    const body = typeof html === "string" ? { html } : { html: "" };
    const response = await api.put(CONTRACTS_ENDPOINTS.UPDATE(id), body);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Delete contract
 * @param {string} id - Contract ID
 * @returns {Promise<void>}
 * @throws {Error} If request fails
 */
export async function deleteContract(id) {
  try {
    const response = await api.delete(CONTRACTS_ENDPOINTS.DELETE(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
/**
 * Mark contract as READY — manager/admin xác nhận hợp đồng để gửi cho khách thuê
 * @param {string} id - Contract ID
 * @returns {Promise<Object>}
 */
export async function readyContract(id) {
  try {
    const response = await api.put(CONTRACTS_ENDPOINTS.READY(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Confirm by admin — chủ nhà (LANDLORD) xem hợp đồng READY và xác nhận,
 * sau đó bắt đầu bước ký chính thức
 * @param {string} id - Contract ID
 * @returns {Promise<Object>}
 */
export async function confirmByAdmin(id) {
  try {
    const response = await api.put(CONTRACTS_ENDPOINTS.CONFIRM(id));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Get VNPT e-contract document detail (processId, signingPage, position…)
 * @param {string} documentId - VNPT document ID (from contract.documentId)
 * @returns {Promise<Object>} VNPT document data including waitingProcess
 * @throws {Error} If request fails
 */
export async function getVnptDocument(documentId) {
  try {
    const response = await api.get(
      CONTRACTS_ENDPOINTS.GET_VNPT_DOCUMENT(documentId),
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Submit admin signature with OTP to sign contract
 * @param {Object} payload - Signing payload
 * @returns {Promise<Object>} Signing result
 * @throws {Error} If request fails
 */
export async function adminSignEcontract(payload) {
  try {
    const response = await api.post(CONTRACTS_ENDPOINTS.ADMIN_SIGN, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
