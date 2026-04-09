import { useCallback, useEffect, useRef, useState } from "react";
import keycloak from "../../../keycloak";
import {
  getManagerNotifications,
  getManagerUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications.api";
import { NOTIFICATIONS_ENDPOINTS } from "../../../lib/api-endpoints";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || "";

const RECONNECT_DELAY_MS = 3000;
const PAGE_SIZE = 20;

/**
 * Hook quản lý thông báo realtime cho manager.
 *
 * - Tự động mở SSE connection khi mount, reconnect khi đứt.
 * - Load trang đầu khi khởi động, hỗ trợ load thêm (loadMore).
 * - Trả về unreadCount để hiển thị badge.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [sseStatus, setSseStatus] = useState("connecting"); // connecting | open | error

  const abortControllerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // ── Load initial data ──────────────────────────────────────────────────────

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, count] = await Promise.all([
        getManagerNotifications(0, PAGE_SIZE),
        getManagerUnreadCount(),
      ]);

      if (!isMountedRef.current) return;

      // Backend có thể trả về { content: [], totalPages } hoặc array thẳng
      const items = Array.isArray(listRes)
        ? listRes
        : (listRes?.content ?? listRes?.data ?? []);
      const totalPages = listRes?.totalPages ?? 1;

      setNotifications(items);
      setHasMore(totalPages > 1);
      setPage(0);
      setUnreadCount(typeof count === "number" ? count : (count?.data ?? 0));
    } catch (err) {
      console.error("[Notifications] Failed to load initial data:", err.message);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  // ── Load more (pagination) ─────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const listRes = await getManagerNotifications(nextPage, PAGE_SIZE);
      if (!isMountedRef.current) return;

      const items = Array.isArray(listRes)
        ? listRes
        : (listRes?.content ?? listRes?.data ?? []);
      const totalPages = listRes?.totalPages ?? nextPage + 1;

      setNotifications((prev) => [...prev, ...items]);
      setHasMore(nextPage + 1 < totalPages);
      setPage(nextPage);
    } catch (err) {
      console.error("[Notifications] Failed to load more:", err.message);
    } finally {
      if (isMountedRef.current) setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page]);

  // ── SSE connection ─────────────────────────────────────────────────────────

  const connectSSE = useCallback(() => {
    // Huỷ connection cũ nếu còn
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const url = `${BASE_URL}${NOTIFICATIONS_ENDPOINTS.MANAGER_STREAM}`;

    const run = async () => {
      try {
        // Refresh token trước khi mở SSE
        if (keycloak?.authenticated) {
          await keycloak.updateToken(30);
        }
        const token = keycloak?.token;

        setSseStatus("connecting");

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

        if (!isMountedRef.current) return;
        setSseStatus("open");
        console.log("[SSE] Connected to notification stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE format: mỗi event kết thúc bằng "\n\n"
          const parts = buffer.split("\n\n");
          buffer = parts.pop(); // phần chưa hoàn chỉnh

          for (const part of parts) {
            const lines = part.trim().split("\n");
            let eventType = "message";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataStr += line.slice(5).trim();
              }
            }

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (!isMountedRef.current) return;

              console.log("[SSE] Event received:", eventType, data);

              if (eventType === "notification" || eventType === "message") {
                // Thêm thông báo mới vào đầu danh sách
                setNotifications((prev) => [data, ...prev]);
                if (!data.read) {
                  setUnreadCount((prev) => prev + 1);
                }
              } else if (eventType === "unread-count") {
                setUnreadCount(typeof data === "number" ? data : (data?.count ?? data));
              }
            } catch {
              // data không phải JSON (ví dụ heartbeat) — bỏ qua
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return; // intentional close
        if (!isMountedRef.current) return;

        setSseStatus("error");

        // Không retry khi là lỗi HTTP cố định (4xx) — endpoint chưa tồn tại
        const status = err.httpStatus;
        if (status && status >= 400 && status < 500) {
          console.warn(`[SSE] Endpoint trả về ${status} — không retry. Backend chưa implement SSE.`);
          return;
        }

        console.warn("[SSE] Kết nối bị đứt, thử lại sau 3s...", err.message);
        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) connectSSE();
        }, RECONNECT_DELAY_MS);
      }
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("[Notifications] markRead failed:", err.message);
      // Rollback
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("[Notifications] markAllRead failed:", err.message);
      // Reload để đồng bộ lại
      loadInitial();
    }
  }, [loadInitial]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    loadInitial();
    connectSSE();

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      clearTimeout(reconnectTimerRef.current);
    };
  }, [loadInitial, connectSSE]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    sseStatus,
    loadMore,
    markRead,
    markAllRead,
    refresh: loadInitial,
  };
}
