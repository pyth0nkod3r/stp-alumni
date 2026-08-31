'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dealroomKeys } from './useDealroomQueries';
import useAuthStore from '@/lib/store/useAuthStore';
import usePresenceStore from '@/lib/store/usePresenceStore';

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws')
    : 'wss://api.blazingtorrent.org/ws');
const RECONNECT_DELAY = 3000;
const MAX_RETRIES = 5;

/**
 * Singleton WebSocket manager so multiple hook instances share one connection.
 */
let socket = null;
let socketListeners = new Map(); // roomId → Set<handler>
let presenceListeners = new Set();
let retryCount = 0;
let retryTimer = null;

function getSocket(token, onOpen) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    onOpen?.();
    return socket;
  }
  if (socket && socket.readyState === WebSocket.CONNECTING) {
    socket.addEventListener('open', () => onOpen?.(), { once: true });
    return socket;
  }

  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', () => {
    retryCount = 0;
    socket.send(JSON.stringify({ type: 'auth', token }));
    onOpen?.();
  });

  socket.addEventListener('message', (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }

    // Route deal room events
    if (
      data.type === 'dealroom_message' ||
      data.type === 'dealroom_typing' ||
      data.type === 'dealroom_read'
    ) {
      const handlers = socketListeners.get(data.roomId);
      handlers?.forEach((fn) => fn(data));
    }

    // Route presence events to all
    if (data.type === 'presence') {
      usePresenceStore.getState().setPresence(data.userId, data.status);
      presenceListeners.forEach((fn) => fn(data));
    }
  });

  socket.addEventListener('close', () => {
    socket = null;
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      retryTimer = setTimeout(() => getSocket(token, null), RECONNECT_DELAY);
    }
  });

  return socket;
}

/**
 * useDealRoomSocket
 *
 * @param {string|null} roomId  - currently selected room (null = no room open)
 * @param {object} callbacks
 *   onMessage(msg)   - called for new dealroom_message events
 *   onTyping(event)  - called for dealroom_typing events
 *   onRead(event)    - called for dealroom_read events
 *   onPresence(evt)  - called for presence events
 */
export function useDealRoomSocket(roomId, { onMessage, onTyping, onRead, onPresence } = {}) {
  const token = useAuthStore((s) => s.token || s.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const sendRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Build a stable send helper ──────────────────────────────────
  const send = useCallback((payload) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  sendRef.current = send;

  // ── Connect & register listeners for the current room ──────────
  useEffect(() => {
    if (!token) return;

    const ws = getSocket(token, () => {
      // Subscribe to this room via WS after auth
    });
    socketRef.current = ws;

    if (!roomId) return;

    const handler = (data) => {
      if (data.type === 'dealroom_message') {
        // Optimistically invalidate messages so React Query re-fetches
        queryClient.invalidateQueries({ queryKey: dealroomKeys.messages(roomId) });
        onMessage?.(data);
      } else if (data.type === 'dealroom_typing') {
        onTyping?.(data);
      } else if (data.type === 'dealroom_read') {
        onRead?.(data);
      }
    };

    if (!socketListeners.has(roomId)) socketListeners.set(roomId, new Set());
    socketListeners.get(roomId).add(handler);

    return () => {
      socketListeners.get(roomId)?.delete(handler);
    };
  }, [token, roomId, queryClient, onMessage, onTyping, onRead]);

  // ── Presence listener ──────────────────────────────────────────
  useEffect(() => {
    if (!onPresence) return;
    presenceListeners.add(onPresence);
    return () => presenceListeners.delete(onPresence);
  }, [onPresence]);

  // ── Public API ─────────────────────────────────────────────────

  const sendMessage = useCallback((content) => {
    if (!roomId) return;
    sendRef.current({ type: 'dealroom_message', roomId, content });
  }, [roomId]);

  const sendMediaMessage = useCallback((messageId) => {
    if (!roomId) return;
    sendRef.current({ type: 'dealroom_media', roomId, messageId });
  }, [roomId]);

  const sendTyping = useCallback(() => {
    if (!roomId) return;
    sendRef.current({ type: 'dealroom_typing', roomId });
    // Debounce — stop re-sending for 3s
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {}, 3000);
  }, [roomId]);

  const markRead = useCallback(() => {
    if (!roomId) return;
    sendRef.current({ type: 'dealroom_read', roomId });
  }, [roomId]);

  return { sendMessage, sendMediaMessage, sendTyping, markRead };
}