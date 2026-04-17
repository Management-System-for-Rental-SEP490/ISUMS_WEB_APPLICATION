import { useCallback, useEffect, useRef, useState } from "react";
import keycloak from "../../../keycloak";
import { getManagerUnreadCount } from "../api/notifications.api";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "";
const RECONNECT_DELAY_MS = 3000;

/**
 * Hook quản lý unread count + danh sách live notification qua SSE.
 * connStatus: "connecting" | "connected" | "reconnecting" | "disconnected" | "error"
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount]   = useState(0);
  const [liveNotifs, setLiveNotifs]     = useState([]);
  const [connStatus, setConnStatus]     = useState("connecting");
  const abortControllerRef              = useRef(null);
  const reconnectTimerRef               = useRef(null);
  const isMountedRef                    = useRef(true);

  const fetchCount = useCallback(async () => {
    try {
      const count = await getManagerUnreadCount();
      if (isMountedRef.current) {
        setUnreadCount(typeof count === "number" ? count : (count?.data ?? 0));
      }
    } catch {
      // Silent — badge giữ nguyên giá trị cũ
    }
  }, []);

  const prependNotif = useCallback((data) => {
    if (!data?.id) return;
    setLiveNotifs((prev) => {
      if (prev.some((n) => n.id === data.id)) return prev; // dedupe
      return [data, ...prev].slice(0, 20);
    });
  }, []);

  const connectSSE = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const url = `${BASE_URL}${NOTIFICATIONS_ENDPOINTS.MANAGER_STREAM}`;

    const run = async () => {
      if (isMountedRef.current) setConnStatus("connecting");
      try {
        if (keycloak?.authenticated) await keycloak.updateToken(30);
        const token = keycloak?.token;

        const response = await fetch(url, {
          headers: {
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "ngrok-skip-browser-warning": "true",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = new Error(`SSE HTTP ${response.status}`);
          err.httpStatus = response.status;
          throw err;
        }

        if (isMountedRef.current) {
          setConnStatus("connected");
          console.log("[SSE] Kết nối thành công:", url);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop();

          for (const part of parts) {
            const lines = part.trim().split("\n");
            let eventType = "message";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event:"))      eventType = line.slice(6).trim();
              else if (line.startsWith("data:")) dataStr  += line.slice(5).trim();
            }

            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (!isMountedRef.current) return;

              if (eventType === "notification" || eventType === "message") {
                prependNotif(data);
                if (!data.read) setUnreadCount((prev) => prev + 1);
              } else if (eventType === "unread_count" || eventType === "unread-count") {
                setUnreadCount(typeof data === "number" ? data : (data?.count ?? 0));
              }
            } catch {
              // heartbeat / non-JSON — ignore
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!isMountedRef.current) return;

        const status = err.httpStatus;
        if (status && status >= 400 && status < 500) {
          console.warn(`[SSE] Endpoint trả về ${status} — dừng retry.`);
          setConnStatus("error");
          return;
        }

        setConnStatus("reconnecting");
        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchCount(); // sync count sau khi reconnect
            connectSSE();
          }
        }, RECONNECT_DELAY_MS);
      }
    };

    run();
  }, [prependNotif, fetchCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMountedRef.current = true;
    fetchCount();
    connectSSE();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      clearTimeout(reconnectTimerRef.current);
      setConnStatus("disconnected");
    };
  }, [fetchCount, connectSSE]);

  const decrementCount = useCallback((by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  const resetCount = useCallback(() => setUnreadCount(0), []);

  return { unreadCount, decrementCount, resetCount, liveNotifs, connStatus };
}
