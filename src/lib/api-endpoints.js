/**
 * API Endpoints Constants
 * Centralized endpoint definitions for the application
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  GET: "users/{email}",
  ME: "/users/me",
};

// Houses endpoints
export const HOUSES_ENDPOINTS = {
  BASE: "/houses",
  BY_ID: (id) => `/houses/${id}`,
  CREATE: "/houses",
  UPDATE: (id) => `/houses/${id}`,
  DELETE: (id) => `/houses/${id}`,
  IMAGES: (id) => `/houses/${id}/images`,
  REGIONS: "/houses/regions",
  FUNCTIONAL_AREAS: "/houses/functionalAreas",
};

export const CONTRACTS_ENDPOINTS = {
  BASE: "/econtracts",
  BY_ID: (id) => `/econtracts/${id}`,
  CREATE: "/econtracts",
  UPDATE: (id) => `/econtracts/${id}`,
  DELETE: (id) => `/econtracts/${id}`,
  READY: (id) => `/econtracts/ready/${id}`,
  CONFIRM: (id) => `/econtracts/${id}/confirm`,
  CANCEL: (id) => `/econtracts/${id}/cancel`,
  CCCD_STATUS: (id) => `/econtracts/${id}/cccd-status`,
  GET_VNPT_DOCUMENT: (documentId) => `/econtracts/vnpt-document/${documentId}`,
  ADMIN_SIGN: "/econtracts/sign-admin",
};

// Users endpoints
export const USERS_ENDPOINTS = {
  BASE: "/users",
  BY_ID: (id) => `/users/byId/${id}`,
  GET_STAFF: "/users/staffs",
};

// Tenants endpoints
export const TENANTS_ENDPOINTS = {
  BASE: "/tenants",
  BY_ID: (id) => `/tenants/${id}`,
  CREATE: "/tenants",
  UPDATE: (id) => `/tenants/${id}`,
  DELETE: (id) => `/tenants/${id}`,
};

// Utilities endpoints
export const UTILITIES_ENDPOINTS = {
  BASE: "/utilities",
  BY_ID: (id) => `/utilities/${id}`,
  ELECTRICITY: "/utilities/electricity",
  WATER: "/utilities/water",
  GAS: "/utilities/gas",
};

// Reports endpoints
export const REPORTS_ENDPOINTS = {
  BASE: "/reports",
  MONTHLY: "/reports/monthly",
  YEARLY: "/reports/yearly",
  EXPORT: "/reports/export",
};

// Notifications endpoints
export const NOTIFICATIONS_ENDPOINTS = {
  BASE: "/notifications",
  BY_ID: (id) => `/notifications/${id}`,
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/read-all",
  // Manager-specific
  MANAGER_STREAM: "/notifications/manager/stream",
  MANAGER_LIST: "/notifications/manager",
  MANAGER_UNREAD_COUNT: "/notifications/manager/unread-count",
  MANAGER_MARK_READ: (id) => `/notifications/manager/${id}/read`,
  MANAGER_MARK_ALL_READ: "/notifications/manager/read-all",
};

// Maintenance endpoints
export const MAINTENANCE_ENDPOINTS = {
  PLANS: "/maintenances/plans",
  PLANS_BY_ID: (planId) => `/maintenances/plans/${planId}`,
  PLANS_HOUSES: (planId) => `/maintenances/plans/houses/${planId}`,
  JOBS: "/maintenances/jobs",
  JOBS_BY_ID: (jobId) => `/maintenances/jobs/${jobId}`,
  JOBS_BY_STATUS: "/maintenances/jobs",
  JOBS_GENERATE: "/maintenances/jobs/generate",
};

// Schedule endpoints
export const SCHEDULE_ENDPOINTS = {
  WORK_SLOTS: "/schedules/work_slots/confirm",
  WORK_SLOTS_CURRENT: "/schedules/work_slots/current",
  WORK_SLOTS_CONFIRM_MAINTENANCE: "/schedules/work_slots/confirm-maintenance",
  WORK_SLOTS_MANAGER_CONFIRM: (jobId) =>
    `/schedules/work_slots/manager/confirm-issue/${jobId}`,
  WORK_SLOTS_SLOTS: "/schedules/work_slots/slots",
  WORK_SLOTS_SLOTS_STAFF: "/schedules/work_slots/slots/staff",
  WORK_SLOTS_MANUAL: "/schedules/work_slots/manual",
  TEMPLATES_CURRENT: (date) => `/schedules/templates/current/${date}`,
};
export const ISSSUE_ENDPOINTS = {
  BASE: "/issues",
  TICKETS: "/issues/tickets",
  ISSUE_BY_TICKET_ID: (ticketId) => `/issues/tickets/${ticketId}`,
  CREATE: "/issues",
  TICKET_IMAGE: (issueId) => `/issues/tickets/${issueId}/images`,
  RESPONSE_BY_TICKET: (ticketId) => `/issues/responses/tickets/${ticketId}`,
  QUOTES_BY_TICKET: (ticketId) => `/issues/quotes/ticket/${ticketId}`,
  QUOTE_STATUS: (id) => `/issues/quotes/${id}/status`,
};
export const ASSET_ENDPOINTS = {
  BASE: "/assets",
  ASSET_BY_ID: (id) => `/assets/${id}`,
  ITEM_BY_ID: (id) => `/assets/items/${id}`,
  BY_HOUSE: (houseId) => `/assets/items/house/${houseId}`,
  CREATE: "/assets",
  UPDATE: (id) => `/assets/${id}`,
  DELETE: (id) => `/assets/${id}`,
  ASSET_CHANGE_DETAIS: (jobId) => `/assets/items/job/${jobId}`,
};
export const BANNER_ENDPOINTS = {
  BASE: "issues/banners",
  CREATE: "issues/banners",
  UPDATE: (id) => `issues/banners/${id}/price`,
};
export const INSPECTION_ENDPOINTS = {
  BASE: "maintenances/inspections",
  CREATE: "maintenances/inspections",
  GET: (id) => `maintenances/inspections/${id}`,
  UPDATE: (id) => `maintenances/inspections/${id}/status`,
  ASSET_EVENTS_BY_JOB: (jobId) => `assets/events/job/${jobId}`,
};
