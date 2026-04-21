import api from "../../../lib/axios";
import { ISSSUE_ENDPOINTS, BANNER_ENDPOINTS } from "../../../lib/api-endpoints";

import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getAllIssues({ status, type, page, pageSize } = {}) {
  try {
    const params = {};
    if (status)   params.status   = status;
    if (type)     params.type     = type;
    if (page !== undefined)     params.page = page;
    if (pageSize !== undefined) params.size = pageSize;
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

export async function getIssueByTicketId(ticketId) {
  try {
    const response = await api.get(ISSSUE_ENDPOINTS.ISSUE_BY_TICKET_ID(ticketId));
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

export async function getResponseByTicket(ticketId) {
  try {
    const response = await api.get(ISSSUE_ENDPOINTS.RESPONSE_BY_TICKET(ticketId));
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

export async function getBanners() {
  try {
    const response = await api.get(BANNER_ENDPOINTS.BASE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createBanner({ name, price, estimateCost }) {
  try {
    const response = await api.post(BANNER_ENDPOINTS.CREATE, { name, price, estimateCost });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getQuotesByTicket(ticketId) {
  try {
    const response = await api.get(ISSSUE_ENDPOINTS.QUOTES_BY_TICKET(ticketId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateQuoteStatus(id, status) {
  try {
    const response = await api.put(ISSSUE_ENDPOINTS.QUOTE_STATUS(id), { status });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateBannerPrice(id, price) {
  try {
    const response = await api.put(BANNER_ENDPOINTS.UPDATE(id), null, { params: { price } });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getTicketImages(issueId) {
  try {
    const response = await api.get(ISSSUE_ENDPOINTS.TICKET_IMAGE(issueId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
