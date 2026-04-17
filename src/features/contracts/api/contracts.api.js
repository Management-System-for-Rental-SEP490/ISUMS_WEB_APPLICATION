/**
 * Contracts API Module
 * Handles all API calls related to rental contracts
 */

import api from "../../../lib/axios";
import { CONTRACTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, toISOString } from "../../../lib/api-helpers";

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
    dateOfIssue: toISOString(payload.dateOfIssue),
    placeOfIssue: payload.placeOfIssue?.trim() || "",
    tenantAddress: payload.tenantAddress?.trim() || "",
    houseId: payload.houseId?.trim() || "",
    startDate: toISOString(payload.startDate),
    endDate: toISOString(payload.endDate),
    rentAmount: Number(payload.rentAmount) || 0,
    payDate: Number(payload.payDate) || 5,
    payCycle: payload.payCycle?.trim() || "monthly",
    depositAmount: Number(payload.depositAmount) || 0,
    depositDate: toISOString(payload.depositDate),
    depositRefundDays: Number(payload.depositRefundDays) || 0,
    handoverDate: toISOString(payload.handoverDate),
    lateDays: Number(payload.lateDays) || 0,
    latePenaltyPercent: Number(payload.latePenaltyPercent) || 0,
    maxLateDays: Number(payload.maxLateDays) || 0,
    cureDays: Number(payload.cureDays) || 0,
    earlyTerminationPenalty: payload.earlyTerminationPenalty?.trim() || "",
    landlordBreachCompensation: payload.landlordBreachCompensation?.trim() || "",
    renewNoticeDays: Number(payload.renewNoticeDays) || 0,
    landlordNoticeDays: Number(payload.landlordNoticeDays) || 0,
    forceMajeureNoticeHours: Number(payload.forceMajeureNoticeHours) || 0,
    disputeDays: Number(payload.disputeDays) || 0,
    disputeForum: payload.disputeForum?.trim() || "",
    copies: Number(payload.copies) || 2,
    eachKeep: Number(payload.eachKeep) || 1,
    purpose: payload.purpose?.trim() || "",
    area: payload.area?.trim() || "",
    structure: payload.structure?.trim() || "",
    ownershipDocs: payload.ownershipDocs?.trim() || "",
    taxFeeNote: payload.taxFeeNote?.trim() || "",
  };
}

export async function getAllContracts(params) {
  const response = await api.get(CONTRACTS_ENDPOINTS.BASE, { params });
  return extractResponseData(response);
}

export async function getContractById(id) {
  const response = await api.get(CONTRACTS_ENDPOINTS.BY_ID(id));
  return extractResponseData(response);
}

export async function createContract(payload) {
  const body = transformContractPayload(payload);
  const response = await api.post(CONTRACTS_ENDPOINTS.CREATE, body);
  return extractResponseData(response);
}

export async function updateContractHtml(id, html) {
  const body = typeof html === "string" ? { html } : { html: "" };
  const response = await api.put(CONTRACTS_ENDPOINTS.UPDATE(id), body);
  return extractResponseData(response);
}

export async function deleteContract(id) {
  const response = await api.delete(CONTRACTS_ENDPOINTS.DELETE(id));
  return extractResponseData(response);
}

/**
 * @deprecated READY được trigger tự động khi tenant upload CCCD.
 */
export async function readyContract(id) {
  const response = await api.put(CONTRACTS_ENDPOINTS.READY(id));
  return extractResponseData(response);
}

export async function confirmByAdmin(id) {
  const response = await api.put(CONTRACTS_ENDPOINTS.CONFIRM(id));
  return extractResponseData(response);
}

export async function cancelContract(id) {
  const response = await api.put(CONTRACTS_ENDPOINTS.CANCEL(id));
  return extractResponseData(response);
}

export async function getVnptDocument(documentId) {
  const response = await api.get(CONTRACTS_ENDPOINTS.GET_VNPT_DOCUMENT(documentId));
  return extractResponseData(response);
}

export async function adminSignEcontract(payload) {
  const response = await api.post(CONTRACTS_ENDPOINTS.ADMIN_SIGN, payload);
  return extractResponseData(response);
}
