import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Hook around POST /api/ai/translate. Returns:
 *   - translate({ text, sourceLanguage, targetLanguages, resourceType, intent })
 *     → { translations, statuses, provider, errors }
 *   - loading: bool
 *   - error: string | null
 *
 * Auth header is propagated by the global axios interceptor (Keycloak token);
 * we do not attach it here so this hook stays usable in tests.
 */
export function useAutoTranslate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function translate({
    text,
    sourceLanguage,
    targetLanguages,
    resourceType,
    intent = "CUSTOMER_FACING_UI",
    customerFacing,
  }) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/ai/translate`, {
        text,
        sourceLanguage,
        targetLanguages,
        resourceType,
        intent,
        customerFacing,
      });
      return data;
    } catch (ex) {
      const msg =
        ex?.response?.data?.message ||
        ex?.response?.data?.error ||
        ex?.message ||
        "Translation request failed";
      setError(msg);
      throw ex;
    } finally {
      setLoading(false);
    }
  }

  return { translate, loading, error };
}

export default useAutoTranslate;
