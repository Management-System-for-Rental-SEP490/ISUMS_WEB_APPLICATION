import api from "../../../lib/axios";
import { SIGN_TERMS_ENDPOINTS } from "../../../lib/api-endpoints";

export async function getMySignTermsAll() {
  const res = await api.get(SIGN_TERMS_ENDPOINTS.ME_ALL);
  return res?.data?.data ?? [];
}

export async function getMySignTermsByLocale(locale) {
  const res = await api.get(SIGN_TERMS_ENDPOINTS.ME_BY_LOCALE(locale));
  return res?.data?.data ?? null;
}

export async function upsertSignTerms(locale, content) {
  const res = await api.put(SIGN_TERMS_ENDPOINTS.UPDATE, { locale, content });
  return res?.data?.data ?? null;
}

export async function resetSignTermsToDefault(locale) {
  await api.delete(SIGN_TERMS_ENDPOINTS.RESET(locale));
}
