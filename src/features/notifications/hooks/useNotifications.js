import { useCallback, useEffect, useRef, useState } from "react";
import {
  getManagerNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications.api";

const PAGE_SIZE = 20;

/**
 * Hook quản lý danh sách thông báo cho trang Notifications.
 * - Không mở SSE (SSE đã có trong useUnreadCount ở DashboardLayout).
 * - unreadCount được tính từ danh sách local.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const isMountedRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Load initial ───────────────────────────────────────────────────────────

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    try {
      const listRes = await getManagerNotifications(0, PAGE_SIZE);
      if (!isMountedRef.current) return;

      const items = Array.isArray(listRes)
        ? listRes
        : (listRes?.content ?? listRes?.data ?? []);
      const totalPages = listRes?.totalPages ?? 1;

      setNotifications(items);
      setHasMore(totalPages > 1);
      setPage(0);
    } catch (err) {
      console.error("[Notifications] Failed to load:", err.message);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  // ── Load more ──────────────────────────────────────────────────────────────

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

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("[Notifications] markRead failed:", err.message);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("[Notifications] markAllRead failed:", err.message);
      loadInitial();
    }
  }, [loadInitial]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    loadInitial();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadInitial]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    refresh: loadInitial,
  };
}
