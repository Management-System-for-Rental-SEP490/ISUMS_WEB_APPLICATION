import api from "../../../lib/axios";
import { ISSSUE_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getAllIssues({ status, type } = {}) {
  try {
    const params = {};
    if (status) params.status = status;
    if (type)   params.type   = type;
    const response = await api.get(ISSSUE_ENDPOINTS.TICKETS, { params });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getIssueById(ticketId) {
  try {
    const response = await api.get(`${ISSSUE_ENDPOINTS.TICKETS}/${ticketId}`);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllResponses() {
  try {
    const response = await api.get("/issues/responses");
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function replyToIssue(ticketId, { content }) {
  try {
    const response = await api.post(`/issues/responses/${ticketId}`, { content });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
