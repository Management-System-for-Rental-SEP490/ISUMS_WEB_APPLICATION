# API Architecture

## Overview

This directory contains the core API infrastructure for the application, following enterprise-level best practices.

## Structure

```
src/lib/
├── axios.js           # Axios client with interceptors
├── api-endpoints.js   # Centralized endpoint definitions
├── api-helpers.js     # Common utilities for API operations
└── README_API.md      # This file
```

## Key Principles

### 1. **Single Source of Truth for Base URL**

The base URL is configured once in `axios.js` and read from environment variables:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
```

All API files use **relative paths** only, never full URLs.

### 2. **Centralized Endpoint Definitions**

All endpoints are defined in `api-endpoints.js`:

```javascript
import { HOUSES_ENDPOINTS } from "../../../lib/api-endpoints";

// Usage
api.get(HOUSES_ENDPOINTS.BASE);           // GET /houses
api.get(HOUSES_ENDPOINTS.BY_ID("123"));   // GET /houses/123
```

### 3. **Consistent Error Handling**

All API functions use `getErrorMessage()` to extract user-friendly error messages:

```javascript
try {
  const response = await api.get(endpoint);
  return extractResponseData(response);
} catch (error) {
  throw new Error(getErrorMessage(error));
}
```

### 4. **Response Data Extraction**

The `extractResponseData()` helper handles different backend response formats:

```javascript
// Backend returns { success: true, data: [...] }
// OR { success: true, items: [...] }
// OR raw array [...]
const data = extractResponseData(response);
```

## Usage Guide

### Creating a New API Module

1. **Define endpoints** in `api-endpoints.js`:

```javascript
export const MY_FEATURE_ENDPOINTS = {
  BASE: "/my-feature",
  BY_ID: (id) => `/my-feature/${id}`,
  CREATE: "/my-feature",
};
```

2. **Create API file** in `src/features/my-feature/api/my-feature.api.js`:

```javascript
/**
 * My Feature API Module
 * Description of what this API handles
 */

import api from "../../../lib/axios";
import { MY_FEATURE_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

/**
 * Get all items
 * @returns {Promise<Array>} List of items
 * @throws {Error} If request fails
 */
export async function getAllItems() {
  try {
    const response = await api.get(MY_FEATURE_ENDPOINTS.BASE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Create new item
 * @param {Object} payload - Item data
 * @returns {Promise<Object>} Created item
 * @throws {Error} If request fails
 */
export async function createItem(payload) {
  try {
    const response = await api.post(MY_FEATURE_ENDPOINTS.CREATE, payload);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
```

### Using API Functions in Components

```javascript
import { getAllItems, createItem } from "./api/my-feature.api";

// In your component or hook
async function fetchData() {
  try {
    const items = await getAllItems();
    console.log(items);
  } catch (error) {
    console.error(error.message); // User-friendly error message
  }
}

async function handleCreate(data) {
  try {
    const newItem = await createItem(data);
    console.log("Created:", newItem);
  } catch (error) {
    alert(error.message); // Show error to user
  }
}
```

## Authentication

Authentication is handled automatically by the axios interceptor in `axios.js`:

- Keycloak token is automatically refreshed if needed
- Bearer token is added to all requests
- No need to manually pass tokens to API functions

## Environment Variables

Required environment variables in `.env`:

```env
# Primary API base URL
VITE_API_BASE_URL=https://your-api.com/api

# Keycloak configuration
VITE_KEYCLOAK_URL=https://your-keycloak.com
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
```

## Common Helpers

### Date Formatting

```javascript
import { toDateString, toISOString } from "../../../lib/api-helpers";

const date = toDateString("2024-01-15"); // "2024-01-15"
const iso = toISOString("2024-01-15"); // "2024-01-15T00:00:00.000Z"
```

### Query String Building

```javascript
import { buildQueryString } from "../../../lib/api-helpers";

const params = { page: 1, limit: 10, search: "test" };
const query = buildQueryString(params); // "?page=1&limit=10&search=test"

// Use in API calls
const response = await api.get(`${endpoint}${query}`);
```

## Best Practices

1. ✅ **Always use relative paths** - Never hardcode full URLs
2. ✅ **Define endpoints in api-endpoints.js** - Central management
3. ✅ **Add JSDoc comments** - Document all functions
4. ✅ **Use try-catch blocks** - Consistent error handling
5. ✅ **Extract response data** - Handle different formats
6. ✅ **Throw user-friendly errors** - Use getErrorMessage()
7. ✅ **No manual token handling** - Let interceptor handle it

## Anti-Patterns (Don't Do This)

❌ **Don't hardcode URLs:**
```javascript
// Bad
const response = await api.get("https://api.example.com/houses");

// Good
const response = await api.get(HOUSES_ENDPOINTS.BASE);
```

❌ **Don't manually add auth headers:**
```javascript
// Bad
const response = await api.get(endpoint, {
  headers: { Authorization: `Bearer ${token}` }
});

// Good - interceptor handles this automatically
const response = await api.get(endpoint);
```

❌ **Don't access response.data directly:**
```javascript
// Bad
const items = response.data.data || response.data;

// Good
const items = extractResponseData(response);
```

## Migration Guide

If you have old API code, migrate it following these steps:

1. Move endpoint URL to `api-endpoints.js`
2. Remove all `import.meta.env` calls from API files
3. Use `extractResponseData()` for response handling
4. Use `getErrorMessage()` for error handling
5. Remove manual token passing - let interceptor handle it
6. Add JSDoc comments

Example migration:

```javascript
// Before
const HOUSES_API = import.meta.env.VITE_API_HOUSE_URL;
export async function getAllHouses(token) {
  const res = await fetch(HOUSES_API, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// After
import api from "../../../lib/axios";
import { HOUSES_ENDPOINTS } from "../../../lib/api-endpoints";
import { extractResponseData, getErrorMessage } from "../../../lib/api-helpers";

export async function getAllHouses() {
  try {
    const response = await api.get(HOUSES_ENDPOINTS.BASE);
    return extractResponseData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
```

## Support

For questions or issues with the API architecture, contact the development team.
