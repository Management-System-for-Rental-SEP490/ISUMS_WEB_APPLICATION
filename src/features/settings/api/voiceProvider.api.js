import api from "../../../lib/axios";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";

export async function getVoiceProvider() {
  const res = await api.get(NOTIFICATIONS_ENDPOINTS.ADMIN_VOICE_PROVIDER);
  return res?.data?.data ?? null;
}

export async function setVoiceProvider(provider) {
  const res = await api.put(NOTIFICATIONS_ENDPOINTS.ADMIN_VOICE_PROVIDER, { provider });
  return res?.data?.data ?? null;
}
