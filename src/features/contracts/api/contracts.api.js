/**
 * Contracts API Module
 * Handles all API calls related to rental contracts
 */

import api from "../../../lib/axios";
import { CONTRACTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, toISOString, toVietnamDateStartISOString } from "../../../lib/api-helpers";

/**
 * @param {Object} payload - Raw contract data
 * @returns {Object} Transformed payload
 */
function transformContractPayload(payload) {
  const isoDate = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    return s || null;
  };

  const meterReadings = [payload.meterElectric, payload.meterWater, payload.meterNote]
    .some((v) => v !== "" && v != null)
      ? {
          electricKwh: payload.meterElectric !== "" ? Number(payload.meterElectric) : null,
          waterM3: payload.meterWater !== "" ? Number(payload.meterWater) : null,
          note: payload.meterNote?.trim() || null,
        }
      : null;

  const coTenants = Array.isArray(payload.coTenants)
    ? payload.coTenants
        .filter((c) => c?.fullName && c?.identityNumber && c?.relationship)
        .map((c) => ({
          fullName: c.fullName.trim(),
          identityNumber: c.identityNumber.trim().toUpperCase(),
          identityType: c.identityType || "CCCD",
          dateOfBirth: isoDate(c.dateOfBirth),
          gender: c.gender || null,
          nationality: c.nationality || null,
          relationship: c.relationship.trim(),
          phoneNumber: c.phoneNumber || null,
        }))
    : [];

  const hasPassport = Boolean(payload.passportNumber?.trim());
  const hasCccd = Boolean(payload.identityNumber?.trim());
  const inferredTenantType = payload.tenantType
    || (hasPassport ? "FOREIGNER" : (hasCccd ? "VIETNAMESE" : null));
  if (!inferredTenantType) {
    throw new Error(
      "Loại người thuê (tenantType) không xác định: vui lòng chọn 'Người Việt' hoặc 'Người nước ngoài' và nhập đúng giấy tờ tương ứng."
    );
  }
  const inferredLanguage = payload.contractLanguage
    || (inferredTenantType === "FOREIGNER" ? "VI_EN" : "VI");

  return {
    isNewAccount: Boolean(payload.isNewAccount ?? false),
    tenantType: inferredTenantType,
    contractLanguage: inferredLanguage,
    name: payload.name?.trim() || "",
    email: payload.email?.trim() || "",
    phoneNumber: payload.phoneNumber ? payload.phoneNumber.replace(/[\s\-().]/g, "") : "",

    // VN identity
    identityNumber: payload.identityNumber?.trim() || null,
    dateOfIssue: toISOString(payload.dateOfIssue),
    placeOfIssue: payload.placeOfIssue?.trim() || "",

    // Passport
    passportNumber: payload.passportNumber?.trim() || null,
    passportIssueDate: isoDate(payload.passportIssueDate),
    passportIssuePlace: payload.passportIssuePlace?.trim() || null,
    passportExpiryDate: isoDate(payload.passportExpiryDate),
    nationality: payload.nationality?.trim() || null,
    visaType: payload.visaType?.trim() || null,
    visaExpiryDate: isoDate(payload.visaExpiryDate),

    // Personal
    dateOfBirth: isoDate(payload.dateOfBirth),
    gender: payload.gender || null,
    occupation: payload.occupation?.trim() || null,
    permanentAddress: payload.permanentAddress?.trim() || null,
    tenantAddress: payload.tenantAddress?.trim() || "",

    // House — GCN/area/structure pulled from house-service at render time.
    houseId: payload.houseId?.trim() || "",

    // Dates + money
    startDate: toVietnamDateStartISOString(payload.startDate),
    endDate: toVietnamDateStartISOString(payload.endDate),
    rentAmount: Number(payload.rentAmount) || 0,
    payDate: Number(payload.payDate) || 5,
    payCycle: payload.payCycle?.trim() || "monthly",
    depositAmount: Number(payload.depositAmount) || 0,
    depositDate: null,
    depositRefundDays: Number(payload.depositRefundDays) || 0,
    handoverDate: toVietnamDateStartISOString(payload.handoverDate || payload.startDate),
    lateDays: Number(payload.lateDays) || 0,
    latePenaltyPercent: Number(payload.latePenaltyPercent) || 0,
    maxLateDays: Number(payload.maxLateDays) || 0,
    cureDays: Number(payload.cureDays) || 0,
    earlyTerminationPenalty: payload.earlyTerminationPenalty?.trim() || "",
    landlordBreachCompensation: payload.landlordBreachCompensation?.trim() || "",
    renewNoticeDays: Number(payload.renewNoticeDays) || 0,
    landlordNoticeDays: Number(payload.landlordNoticeDays) || 0,
    forceMajeureNoticeHours: payload.forceMajeureNoticeHours != null
      ? Number(payload.forceMajeureNoticeHours) : null,
    disputeDays: Number(payload.disputeDays) || 0,
    disputeForum: payload.disputeForum?.trim() || "",
    taxFeeNote: payload.taxFeeNote?.trim() || "",

    // Rules
    petPolicy: payload.petPolicy || null,
    smokingPolicy: payload.smokingPolicy || null,
    subleasePolicy: payload.subleasePolicy || null,
    visitorPolicy: payload.visitorPolicy || null,
    tempResidenceRegisterBy: payload.tempResidenceRegisterBy || null,
    taxResponsibility: payload.taxResponsibility || null,

    // Handover
    meterReadingsStart: meterReadings,

    // Co-tenants (server persists atomically with contract)
    coTenants,
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

/**
 * Partial-update structured contract fields (rent, deposit, policies, passport,
 * etc.) without touching the rendered HTML. Matches BE `UpdateEContractRequest`
 * which applies null-safe patching at the mapper layer.
 */
export async function updateContractFields(id, partial) {
  // Strip undefined; null is intentional (caller may want to clear a field).
  const body = Object.fromEntries(
    Object.entries(partial ?? {}).filter(([, v]) => v !== undefined),
  );
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

export async function getCccdStatus(id) {
  const response = await api.get(CONTRACTS_ENDPOINTS.CCCD_STATUS(id));
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

export async function resendTenantSignatureEmail(contractId) {
  const response = await api.post(CONTRACTS_ENDPOINTS.RESEND_TENANT_SIGNATURE(contractId));
  return extractResponseData(response);
}

export async function resendPaymentEmail(contractId, overrideEmail) {
  const body = overrideEmail ? { tenantEmail: overrideEmail } : {};
  const response = await api.post(CONTRACTS_ENDPOINTS.RESEND_PAYMENT_EMAIL(contractId), body);
  return extractResponseData(response);
}

export async function cancelContractAndReleaseHouse(contractId) {
  const response = await api.post(CONTRACTS_ENDPOINTS.CANCEL_AND_RELEASE(contractId));
  return extractResponseData(response);
}

export async function getDepositBookableHouses() {
  const response = await api.get(CONTRACTS_ENDPOINTS.MARKETPLACE_BOOKABLE);
  return extractResponseData(response);
}

export async function confirmCashDeposit(contractId, payload, idempotencyKey) {
  const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {};
  const response = await api.post(
    CONTRACTS_ENDPOINTS.CASH_DEPOSIT_CONFIRM(contractId),
    payload,
    { headers },
  );
  return extractResponseData(response);
}

export async function getActiveCashDepositReceipt(contractId) {
  const response = await api.get(CONTRACTS_ENDPOINTS.CASH_DEPOSIT_ACTIVE(contractId));
  return extractResponseData(response);
}

export async function downloadCashDepositReceiptPdf(contractId, receiptNumber) {
  const response = await api.get(
    CONTRACTS_ENDPOINTS.CASH_DEPOSIT_PDF(contractId, receiptNumber),
    { responseType: "blob" },
  );
  return response.data;
}

export async function getLockedHouseIds() {
  const response = await api.get(CONTRACTS_ENDPOINTS.MARKETPLACE_LOCKED);
  return extractResponseData(response);
}

export async function previewContractDemo(params) {
  const response = await api.get(CONTRACTS_ENDPOINTS.DEMO_PREVIEW, { params });
  return extractResponseData(response);
}

export async function runContractDemo(payload) {
  const response = await api.post(CONTRACTS_ENDPOINTS.DEMO_RUN, payload);
  return extractResponseData(response);
}

export async function getActiveContractDemo(contractId) {
  const response = await api.get(CONTRACTS_ENDPOINTS.DEMO_ACTIVE, {
    params: { contractId },
  });
  return extractResponseData(response);
}

export async function cancelContractDemo(contractId) {
  const response = await api.delete(CONTRACTS_ENDPOINTS.DEMO_ACTIVE, {
    params: { contractId },
  });
  return extractResponseData(response);
}

// -----------------------------------------------------------------------------
// Passport flow (for foreign tenants)
// -----------------------------------------------------------------------------
export async function uploadPassport(contractId, passportFile, contractToken) {
  const formData = new FormData();
  formData.append("passportImage", passportFile);
  const response = await api.put(`/econtracts/${contractId}/passport`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-Contract-Token": contractToken,
    },
  });
  return extractResponseData(response);
}

export async function getPassportStatus(contractId) {
  const response = await api.get(`/econtracts/${contractId}/passport-status`);
  return extractResponseData(response);
}

// -----------------------------------------------------------------------------
// Co-tenants CRUD
// -----------------------------------------------------------------------------
export async function listCoTenants(contractId) {
  const response = await api.get(`/econtracts/${contractId}/co-tenants`);
  return extractResponseData(response);
}

export async function addCoTenant(contractId, coTenant) {
  const response = await api.post(`/econtracts/${contractId}/co-tenants`, coTenant);
  return extractResponseData(response);
}

export async function updateCoTenant(contractId, coTenantId, coTenant) {
  const response = await api.put(
    `/econtracts/${contractId}/co-tenants/${coTenantId}`,
    coTenant,
  );
  return extractResponseData(response);
}

export async function deleteCoTenant(contractId, coTenantId) {
  const response = await api.delete(`/econtracts/${contractId}/co-tenants/${coTenantId}`);
  return extractResponseData(response);
}

export async function replaceAllCoTenants(contractId, coTenants) {
  const response = await api.put(`/econtracts/${contractId}/co-tenants`, coTenants);
  return extractResponseData(response);
}

export async function fetchNationalities() {
  const response = await api.get(CONTRACTS_ENDPOINTS.NATIONALITIES, { timeout: 8000 });
  const items = response?.data?.data ?? [];
  return items
    .filter((c) => c?.code && (c.nameVi || c.nameEn || c.name))
    .map((c) => ({
      code: c.code,
      labelVi: c.nameVi ?? c.name ?? c.nameEn ?? c.code,
      labelEn: c.nameEn ?? c.description ?? c.nameVi ?? c.code,
      labelJa: c.nameJa ?? c.nameEn ?? c.description ?? c.nameVi ?? c.code,
    }))
    .sort((a, b) => a.labelVi.localeCompare(b.labelVi, "vi"));
}
