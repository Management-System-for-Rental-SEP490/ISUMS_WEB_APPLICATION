export function mapHouseToHouseCard(house, imageUrl = null) {
  const addressParts = [house?.address, house?.ward, house?.commune, house?.city].filter(Boolean);
  return {
    id: house?.id,
    name: house?.name ?? house?.title ?? "",
    title: house?.name ?? house?.title ?? "",
    address: addressParts.length ? addressParts.join(", ") : "",
    description: house?.description ?? "",
    status: house?.status ?? "",
    unit: house?.unit ?? "",
    rentPrice: house?.rentPrice ?? house?.rent ?? null,
    functionalAreas: Array.isArray(house?.functionalAreas) ? house.functionalAreas : [],
    imageUrl,
  };
}
