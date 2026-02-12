/**
 * API Endpoints Constants
 * Centralized endpoint definitions for the application
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/profile",
};

// Houses endpoints
export const HOUSES_ENDPOINTS = {
  BASE: "/houses",
  BY_ID: (id) => `/houses/${id}`,
  CREATE: "/houses",
  UPDATE: (id) => `/houses/${id}`,
  DELETE: (id) => `/houses/${id}`,
};

export const CONTRACTS_ENDPOINTS = {
  BASE: "/econtracts",
  BY_ID: (id) => `/econtracts/${id}`,
  CREATE: "/econtracts",
  UPDATE: (id) => `/econtracts/${id}`,
  DELETE: (id) => `/econtracts/${id}`,
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
