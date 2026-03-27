import { useSyncExternalStore } from "react";
import keycloak from "../../../keycloak";
import { getMe } from "../api/auth.api";

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

let initPromise = null;

export const authActions = {
  async init() {
    // ============================================================
    // [DEV BYPASS]
    if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
      setState({
        isAuthenticated: true,
        roles: ["ADMIN"],
        profile: { id: "dev-user", name: "Dev User", email: "dev@local.test" },
      });
      return true;
    }
    // ============================================================
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
        cleanupCallbackUrl();

        if (authenticated) {
          console.log("[Keycloak] ✅ Authenticated");
          console.log("[Keycloak] token:", keycloak.token);
          console.log("[Keycloak] tokenParsed:", keycloak.tokenParsed);

          try {
            const me = await getMe();
            setState({
              isAuthenticated: true,
              roles: Array.isArray(me?.roles) ? me.roles : [],
              profile: {
                id: me?.id ?? null,
                name: me?.name ?? keycloak?.tokenParsed?.name,
                email: me?.email ?? keycloak?.tokenParsed?.email,
              },
            });
          } catch {
            setState({
              isAuthenticated: true,
              roles: [],
              profile: {
                name: keycloak?.tokenParsed?.name,
                email: keycloak?.tokenParsed?.email,
              },
            });
          }
        } else {
          setState({ isAuthenticated: false, roles: [], profile: null });
        }

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
      } catch {
        // ignore
      }
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
