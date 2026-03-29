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
  BY_ID: (id) => `/users/${id}`,
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
};

// Maintenance endpoints
export const MAINTENANCE_ENDPOINTS = {
  PLANS: "/maintenances/plans",
  PLANS_BY_ID: (planId) => `/maintenances/plans/${planId}`,
  PLANS_HOUSES: (planId) => `/maintenances/plans/houses/${planId}`,
  JOBS: "/maintenances/jobs",
  JOBS_BY_ID: (jobId) => `/maintenances/jobs/${jobId}`,
  JOBS_BY_STATUS: "/maintenances/jobs/status",
  // SLOT_JOBS: (id) => `/maintenance/slots/${id}/jobs`,
  // JOB_BY_ID: (id) => `/maintenance/jobs/${id}`,
  // BY_WEEK: "/maintenance/slots/week",
  // BY_MONTH: "/maintenance/slots/month",
};

// Schedule endpoints
export const SCHEDULE_ENDPOINTS = {
  WORK_SLOTS: "/schedules/work_slots",
  WORK_SLOTS_CURRENT: "/schedules/work_slots/current",
  TEMPLATES_CURRENT: (date) => `/schedules/templates/current/${date}`,
};
export const ISSSUE_ENDPOINTS = {
  BASE: "/issues",
  ISSUE_BY_ID: (id) => `/issues/${id}`,
  CREATE: "/issues",
  ISSUES: "/issues",
};
export const ASSET_ENDPOINTS = {
  BASE: "/assets",
  ASSET_BY_ID: (id) => `/assets/${id}`,
  CREATE: "/assets",
  UPDATE: (id) => `/assets/${id}`,
  DELETE: (id) => `/assets/${id}`,
};
