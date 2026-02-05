import { useSyncExternalStore } from "react";
import keycloak, { getKeycloakRoles } from "../../../keycloak";

function hasEnv() {
  return (
    Boolean(import.meta.env.VITE_KEYCLOAK_URL) &&
    Boolean(import.meta.env.VITE_KEYCLOAK_REALM) &&
    Boolean(import.meta.env.VITE_KEYCLOAK_CLIENT_ID)
  );
}

function cleanupCallbackUrl() {
  const qs = window.location.search || "";
  if (
    qs.includes("code=") ||
    qs.includes("state=") ||
    qs.includes("session_state=") ||
    qs.includes("iss=")
  ) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

let state = {
  isReady: false,
  isAuthenticated: false,
  roles: [],
  profile: null,
};

const listeners = new Set();
function emit() {
  for (const l of listeners) l();
}
function setState(partial) {
  state = { ...state, ...partial, isReady: true };
  emit();
}

// chặn init chạy nhiều lần
let initPromise = null;

export const authActions = {
  async init() {
    if (!hasEnv()) {
      setState({ isAuthenticated: false, roles: [], profile: null });
      return false;
    }
    if (initPromise) return initPromise;

    state = { ...state, isReady: false };
    emit();

    initPromise = (async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
          checkLoginIframe: false,
          responseMode: "query",
        });

        // nếu đang ở /login?code=... thì dọn URL sau khi keycloak-js consume
        cleanupCallbackUrl();

        const roles = authenticated ? getKeycloakRoles() : [];
        setState({
          isAuthenticated: Boolean(authenticated),
          roles,
          profile: authenticated
            ? {
                username: keycloak?.tokenParsed?.preferred_username,
                email: keycloak?.tokenParsed?.email,
                name: keycloak?.tokenParsed?.name,
              }
            : null,
        });

        return Boolean(authenticated);
      } catch (e) {
        cleanupCallbackUrl();
        setState({ isAuthenticated: false, roles: [], profile: null });
        return false;
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  },

  async login() {
    if (!hasEnv()) return;

    // callback về /login (bạn có thể đổi sang /dashboard nếu thích)
    const redirectUri = new URL("/login", window.location.origin).toString();
    await keycloak.login({ redirectUri });
  },

  async logout() {
    const redirectUri = new URL("/login", window.location.origin).toString();
    try {
      await keycloak.logout({ redirectUri });
    } finally {
      try {
        keycloak.clearToken();
      } catch {}
      setState({ isAuthenticated: false, roles: [], profile: null });
    }
  },

  // cho API call: refresh token trước khi dùng
  async getValidAccessToken(minValidity = 30) {
    if (!keycloak?.authenticated) return null;
    await keycloak.updateToken(minValidity);
    return keycloak.token;
  },
};

export function useAuthStore(selector) {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );

  return typeof selector === "function" ? selector(snapshot) : snapshot;
}
