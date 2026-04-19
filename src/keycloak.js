import Keycloak from "keycloak-js";

// Preserve the Keycloak instance across Vite HMR re-evaluations so the
// adapter (set by keycloak.init()) is not lost when this module reloads.
if (!window.__kc_instance) {
  window.__kc_instance = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  });
}

const keycloak = window.__kc_instance;

export default keycloak;

export function getKeycloakRoles() {
  const tp = keycloak?.tokenParsed;
  const realmRoles = tp?.realm_access?.roles ?? [];

  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
  const clientRoles = tp?.resource_access?.[clientId]?.roles ?? [];

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}
