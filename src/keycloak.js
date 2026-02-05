import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;

export function getKeycloakRoles() {
  const tp = keycloak?.tokenParsed;
  const realmRoles = tp?.realm_access?.roles ?? [];

  // nếu bạn có client roles thì thêm:
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
  const clientRoles = tp?.resource_access?.[clientId]?.roles ?? [];

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}
