import { useState } from "react";
import { api } from "../lib/axios";

/**
 * Hook around POST /api/ai/translate. Reuses the global authenticated axios
 * instance (`lib/axios.js`) so Keycloak Bearer + Accept-Language are attached
 * automatically. No need to inject either here.
 *
 *   const { translate, loading, error } = useAutoTranslate();
 *   const result = await translate({
 *     text: "Xin chào",
 *     sourceLanguage: "vi",
 *     targetLanguages: ["en", "ja"],
 *     intent: "CUSTOMER_FACING_UI",
 *     resourceType: "notification.title",
 *   });
 *   // result = { translations:{en,ja}, statuses:{en,ja}, provider, errors }
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
      const { data } = await api.post("/api/ai/translate", {
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
