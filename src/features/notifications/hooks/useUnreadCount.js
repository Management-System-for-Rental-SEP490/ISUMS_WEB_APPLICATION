import { useCallback, useEffect, useRef, useState } from "react";
import keycloak from "../../../keycloak";
import { getManagerUnreadCount } from "../api/notifications.api";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "";

const INITIAL_RECONNECT_MS = 3_000;
const MAX_RECONNECT_MS = 60_000;
const MAX_LIVE_BUFFER = 20;

/**
 * Module-level singleton. Survives React 18 StrictMode double-mount,
 * Vite HMR remounts, and multiple NotificationDropdown consumers — so the
 * backend pool sees exactly one SSE connection per tab.
 */
// HMR-shared state: surviving across module replacements prevents Vite's
// hot-reload from leaving zombie SSE connections on the gateway's pool.
const HMR_KEY = "__isumsSseState__";
const hmrState =
  (typeof window !== "undefined" && window[HMR_KEY]) || { abortController: null };
if (typeof window !== "undefined") window[HMR_KEY] = hmrState;

const client = (() => {
  const listeners = new Set();
  let unreadCount = 0;
  let liveNotifs = [];
  let connStatus = "connecting";
  let reconnectTimer = null;
  let reconnectDelay = INITIAL_RECONNECT_MS;
  let started = false;

  const emit = () => {
    const snapshot = { unreadCount, liveNotifs, connStatus };
    listeners.forEach((fn) => fn(snapshot));
  };

  const setCount = (n) => {
    unreadCount = Math.max(0, n);
    emit();
  };

  const setStatus = (s) => {
    if (connStatus !== s) {
      connStatus = s;
      emit();
    }
  };

  const prependNotif = (data) => {
    if (!data?.id) return;
    if (liveNotifs.some((n) => n.id === data.id)) return;
    liveNotifs = [data, ...liveNotifs].slice(0, MAX_LIVE_BUFFER);
    emit();
  };

  const fetchCount = async () => {
    try {
      const count = await getManagerUnreadCount();
      const n = typeof count === "number" ? count : (count?.data ?? 0);
      setCount(n);
    } catch {
      // keep stale count
    }
  };

  const scheduleReconnect = () => {
    clearTimeout(reconnectTimer);
    const delay = reconnectDelay;
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_MS);
    setStatus("reconnecting");
    reconnectTimer = setTimeout(() => {
      fetchCount();
      connect();
    }, delay);
  };

  const connect = async () => {
    if (hmrState.abortController) hmrState.abortController.abort();
    const controller = new AbortController();
    hmrState.abortController = controller;
    const url = `${BASE_URL}${NOTIFICATIONS_ENDPOINTS.MANAGER_STREAM}`;

    setStatus("connecting");
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
        cache: "no-store",
      });

      if (!response.ok) {
        const err = new Error(`SSE HTTP ${response.status}`);
        err.httpStatus = response.status;
        throw err;
      }

      reconnectDelay = INITIAL_RECONNECT_MS;
      setStatus("connected");

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
            if (line.startsWith("event:")) eventType = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }

          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (eventType === "notification" || eventType === "message") {
              prependNotif(data);
              if (!data.read) setCount(unreadCount + 1);
            } else if (
              eventType === "unread_count" ||
              eventType === "unread-count"
            ) {
              setCount(typeof data === "number" ? data : (data?.count ?? 0));
            }
          } catch {
            // heartbeat / non-JSON
          }
        }
      }

      scheduleReconnect();
    } catch (err) {
      if (err.name === "AbortError") return;
      const status = err.httpStatus;
      if (status && status >= 400 && status < 500 && status !== 408) {
        setStatus("error");
        return;
      }
      scheduleReconnect();
    }
  };

  const start = () => {
    if (started) return;
    started = true;
    fetchCount();
    connect();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && connStatus !== "connected") {
          clearTimeout(reconnectTimer);
          reconnectDelay = INITIAL_RECONNECT_MS;
          fetchCount();
          connect();
        }
      });
    }
  };

  const stop = () => {
    started = false;
    clearTimeout(reconnectTimer);
    hmrState.abortController?.abort();
    hmrState.abortController = null;
    setStatus("disconnected");
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    fn({ unreadCount, liveNotifs, connStatus });
    start();
    return () => {
      listeners.delete(fn);
      if (listeners.size === 0) {
        // No consumers for a bit — disconnect to free server slot.
        setTimeout(() => {
          if (listeners.size === 0) stop();
        }, 5_000);
      }
    };
  };

  const decrement = (by = 1) => setCount(unreadCount - by);
  const reset = () => setCount(0);

  return { subscribe, decrement, reset };
})();

// HMR cleanup — without this, Vite hot-reload leaves zombie SSE connections
// that hold gateway pool slots until their read-timeout expires.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    hmrState.abortController?.abort();
    hmrState.abortController = null;
  });
}

export function useUnreadCount() {
  const [state, setState] = useState({
    unreadCount: 0,
    liveNotifs: [],
    connStatus: "connecting",
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const unsub = client.subscribe((snapshot) => {
      if (mountedRef.current) setState(snapshot);
    });
    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, []);

  const decrementCount = useCallback((by = 1) => client.decrement(by), []);
  const resetCount = useCallback(() => client.reset(), []);

  return {
    unreadCount: state.unreadCount,
    decrementCount,
    resetCount,
    liveNotifs: state.liveNotifs,
    connStatus: state.connStatus,
  };
}
