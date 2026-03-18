/**
 * Map contract from API response to UI format
 * @param {Object} item - Raw contract from API
 * @returns {Object} Mapped contract for list/detail views
 */
export function mapContractFromApi(item) {
  if (!item) return null;
  const status = (item.status ?? "").toString().toUpperCase();
  return {
    ...item,        // raw fields trước
    // override bằng giá trị đã chuẩn hóa
    id: item.id,
    contractNumber: item.name ?? item.contractNumber ?? item.id,
    tenant: extractTenantFromName(item.name) ?? item.name ?? "—",
    property: item.property ?? item.houseName ?? "—",
    unit: item.unit ?? "—",
    startDate: item.startDate ?? item.startAt ?? item.createdAt ?? null,
    endDate: item.endDate ?? item.endAt ?? null,
    rent: item.rentAmount ?? item.rent ?? 0,
    deposit: item.depositAmount ?? item.deposit ?? 0,
    status,         // luôn UPPERCASE, không bị ghi đè
    paymentType: item.paymentType ?? "monthly",
    autoRenew: item.autoRenew ?? false,
    html: item.html,
    createdAt: item.createdAt,
  };
}

function extractTenantFromName(name) {
  if (!name || typeof name !== "string") return null;
  const match = name.match(/EContract_(.+?)_\d+/);
  return match ? match[1].trim() : null;
}
