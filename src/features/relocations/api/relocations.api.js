import api from "../../../lib/axios";
import { CONTRACTS_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getRelocationRequests() {
  try {
    const response = await api.get(CONTRACTS_ENDPOINTS.RELOCATION_REQUESTS);
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function reviewRelocationRequest(id, payload) {
  try {
    const response = await api.patch(
      CONTRACTS_ENDPOINTS.REVIEW_RELOCATION(id),
      payload,
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function searchSignedContracts(keyword = "") {
  try {
    const params = {
      page: 1,
      size: 20,
      status: "COMPLETED",
      sorts: "createdAt:DESC",
    };
    if (keyword?.trim()) params.keyword = keyword.trim();
    const response = await api.get(CONTRACTS_ENDPOINTS.BASE, { params });
    const data = extractResponseData(response);
    return Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function reportLandlordFaultRelocation(payload) {
  try {
    const formData = new FormData();
    formData.append("contractNumber", payload.contractNumber);
    formData.append("reportReason", payload.reportReason);
    if (payload.recommendedHouseId) {
      formData.append("recommendedHouseId", payload.recommendedHouseId);
    }
    (payload.evidenceFiles ?? []).forEach((file) => {
      formData.append("evidenceFiles", file);
    });

    const response = await api.post(
      CONTRACTS_ENDPOINTS.REPORT_LANDLORD_FAULT_RELOCATION,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createReplacementContract(id) {
  try {
    const response = await api.post(
      CONTRACTS_ENDPOINTS.CREATE_RELOCATION_REPLACEMENT(id),
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
export async function cancelRelocationByManager(id) {
  try {
    const response = await api.post(
      CONTRACTS_ENDPOINTS.CANCEL_RELOCATION_BY_MANAGER(id),
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function confirmRelocationHandover(id) {
  try {
    const response = await api.post(
      CONTRACTS_ENDPOINTS.CONFIRM_RELOCATION_HANDOVER(id),
    );
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getContractRelocationLink(contractId) {
  if (!contractId) return null;
  try {
    const response = await api.get(
      CONTRACTS_ENDPOINTS.CONTRACT_RELOCATION_LINK(contractId),
    );
    return extractResponseData(response) ?? null;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw new Error(getErrorMessage(error));
  }
}
