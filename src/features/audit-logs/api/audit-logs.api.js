import api from "../../../lib/axios";
import { AUDIT_LOG_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getAuditLogs({ actorUserId, action, resourceType, resourceId, traceId, requestId, serviceName, status, page = 0, size = 10 } = {}) {
  try {
    const params = { page, size };
    if (actorUserId) params.actorUserId = actorUserId;
    if (action) params.action = action;
    if (resourceType) params.resourceType = resourceType;
    if (resourceId) params.resourceId = resourceId;
    if (traceId) params.traceId = traceId;
    if (requestId) params.requestId = requestId;
    if (serviceName) params.serviceName = serviceName;
    if (status) params.status = status;

    const response = await api.get(AUDIT_LOG_ENDPOINTS.LIST, { params });
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAuditLogByEventId(eventId) {
  try {
    const response = await api.get(AUDIT_LOG_ENDPOINTS.BY_EVENT_ID(eventId));
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
