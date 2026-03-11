/**
 * Map raw user from API to UI model
 * @param {Object} item
 * @returns {Object}
 */
export function mapUserFromApi(item) {
  if (!item) return null;

  const displayName = isLikelyCccd(item.name)
    ? (item.email?.split("@")[0] ?? item.name)
    : (item.name ?? "—");

  return {
    id: item.id,
    name: item.name ?? "—",
    displayName,
    email: item.email ?? "—",
    phone: isValidPhone(item.identityNumber) ? item.identityNumber : "Chưa có",
  };
}

function isLikelyCccd(str) {
  if (!str || typeof str !== "string") return false;
  return /^\d{9,12}$/.test(str.trim());
}

function isValidPhone(str) {
  if (!str || typeof str !== "string") return false;
  return str.trim().length > 0 && str.trim() !== "—";
}
