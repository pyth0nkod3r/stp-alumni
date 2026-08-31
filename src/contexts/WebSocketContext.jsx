"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/lib/store/useAuthStore";
import usePresenceStore from "@/lib/store/usePresenceStore";
import { dealroomKeys } from "@/lib/hooks/useDealroomQueries";

export const WebSocketContext = createContext(null);

const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
      .replace(/^http/, "ws")
      .replace(/\/api\/?$/, "/ws");
  }
  return "wss://api.blazingtorrent.org/ws";
};

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token || s.accessToken);

  // Subscriptions registries
  const directMessageSubscribers = useRef(new Set());
  const directTypingSubscribers = useRef(new Set());
  const directReadSubscribers = useRef(new Set());
  const dealRoomSubscribers = useRef(new Map()); // roomId -> Set<callback>
  const presenceSubscribers = useRef(new Set());

  // ── Stable Send Helper ─────────────────────────────────────────
  const sendRaw = useCallback((payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        typeof payload === "string" ? payload : JSON.stringify(payload)
      );
      return true;
    }
    return false;
  }, []);

  // ── Connection Logic ───────────────────────────────────────────
  const connect = useCallback(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retryCountRef.current = 0;
        try {
          ws.send(JSON.stringify({ type: "auth", token }));
        } catch {
          // ignore send error
        }
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!data || !data.type) return;

        switch (data.type) {
          case "authenticated":
          case "connected":
            setIsConnected(true);
            break;

          // ── Direct Messaging Events ──────────────────────────
          case "new_message":
            directMessageSubscribers.current.forEach((cb) => cb(data));
            break;

          case "typing":
            directTypingSubscribers.current.forEach((cb) => cb(data));
            break;

          case "read_receipt":
            directReadSubscribers.current.forEach((cb) => cb(data));
            break;

          // ── Deal Room Events ─────────────────────────────────
          case "dealroom_message":
            if (data.roomId) {
              queryClient.invalidateQueries({
                queryKey: dealroomKeys.messages(data.roomId),
              });
              const listeners = dealRoomSubscribers.current.get(data.roomId);
              listeners?.forEach((cb) => cb(data));
            }
            break;

          case "dealroom_typing":
          case "dealroom_read":
            if (data.roomId) {
              const listeners = dealRoomSubscribers.current.get(data.roomId);
              listeners?.forEach((cb) => cb(data));
            }
            break;

          // ── Presence Events ──────────────────────────────────
          case "presence":
            if (data.userId) {
              usePresenceStore.getState().setPresence(data.userId, data.status);
              presenceSubscribers.current.forEach((cb) => cb(data));
            }
            break;

          // ── Notification Push Events ─────────────────────────
          case "notification":
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
            break;

          default:
            break;
        }
      };

      ws.onerror = () => {
        // Fall back gracefully
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

        // Exponential backoff reconnect: 1s, 2s, 4s, 8s, up to 30s
        retryCountRef.current = Math.min(retryCountRef.current + 1, 5);
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      socketRef.current = ws;
    } catch {
      // Ignore initial connection failure
    }
  }, [token, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  // ── Subscription API ───────────────────────────────────────────
  const subscribeToDirectMessage = useCallback((cb) => {
    directMessageSubscribers.current.add(cb);
    return () => directMessageSubscribers.current.delete(cb);
  }, []);

  const subscribeToDirectTyping = useCallback((cb) => {
    directTypingSubscribers.current.add(cb);
    return () => directTypingSubscribers.current.delete(cb);
  }, []);

  const subscribeToDirectRead = useCallback((cb) => {
    directReadSubscribers.current.add(cb);
    return () => directReadSubscribers.current.delete(cb);
  }, []);

  const subscribeToDealRoom = useCallback((roomId, cb) => {
    if (!roomId) return () => {};
    if (!dealRoomSubscribers.current.has(roomId)) {
      dealRoomSubscribers.current.set(roomId, new Set());
    }
    dealRoomSubscribers.current.get(roomId).add(cb);

    return () => {
      dealRoomSubscribers.current.get(roomId)?.delete(cb);
      if (dealRoomSubscribers.current.get(roomId)?.size === 0) {
        dealRoomSubscribers.current.delete(roomId);
      }
    };
  }, []);

  const subscribeToPresence = useCallback((cb) => {
    presenceSubscribers.current.add(cb);
    return () => presenceSubscribers.current.delete(cb);
  }, []);

  // ── Domain-Specific Actions ────────────────────────────────────
  const sendDirectMessage = useCallback(
    (conversationId, content) => {
      return sendRaw({ type: "message", conversationId, content });
    },
    [sendRaw]
  );

  const sendDirectTyping = useCallback(
    (conversationId) => {
      return sendRaw({ type: "typing", conversationId });
    },
    [sendRaw]
  );

  const sendDirectRead = useCallback(
    (conversationId) => {
      return sendRaw({ type: "read", conversationId });
    },
    [sendRaw]
  );

  const sendDealRoomMessage = useCallback(
    (roomId, content) => {
      return sendRaw({ type: "dealroom_message", roomId, content });
    },
    [sendRaw]
  );

  const sendDealRoomMedia = useCallback(
    (roomId, messageId) => {
      return sendRaw({ type: "dealroom_media", roomId, messageId });
    },
    [sendRaw]
  );

  const sendDealRoomTyping = useCallback(
    (roomId) => {
      return sendRaw({ type: "dealroom_typing", roomId });
    },
    [sendRaw]
  );

  const sendDealRoomRead = useCallback(
    (roomId) => {
      return sendRaw({ type: "dealroom_read", roomId });
    },
    [sendRaw]
  );

  const value = {
    isConnected,
    sendRaw,
    // Direct Messaging
    sendDirectMessage,
    sendDirectTyping,
    sendDirectRead,
    subscribeToDirectMessage,
    subscribeToDirectTyping,
    subscribeToDirectRead,
    // Deal Room
    sendDealRoomMessage,
    sendDealRoomMedia,
    sendDealRoomTyping,
    sendDealRoomRead,
    subscribeToDealRoom,
    // Presence
    subscribeToPresence,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  return ctx;
}
