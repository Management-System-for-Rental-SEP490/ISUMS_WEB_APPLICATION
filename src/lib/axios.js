import axios from "axios";
import { toast } from "react-toastify";
import keycloak from "../keycloak";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "";
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak?.authenticated) {
      try {
        await keycloak.updateToken(30);
        const token = keycloak.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Failed to refresh Keycloak token:", error);
      }
    }

    // Add custom headers
    config.headers["ngrok-skip-browser-warning"] = "true";

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url ?? "";
    const isNotificationApi = requestUrl.includes("/notifications");

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.warn("Unauthorized - token may be expired");
          break;
        case 403:
          if (!isNotificationApi)
            toast.error("Bạn không có quyền truy cập vào trang này.");
          console.warn("Forbidden - insufficient permissions");
          break;
        case 404:
          console.warn("Resource not found");
          break;
        case 500:
          if (!isNotificationApi)
            toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
          console.error("Internal server error");
          break;
        default:
          console.error(`API error ${status}:`, error.response.data);
      }
    } else if (error.request) {
      console.error("Network error - no response received:", error.message);
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
