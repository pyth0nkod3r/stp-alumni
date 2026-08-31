'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

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
export function useDealRoomSocket(
  roomId,
  { onMessage, onTyping, onRead, onPresence } = {}
) {
  const ws = useWebSocketContext();

  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onReadRef = useRef(onRead);
  const onPresenceRef = useRef(onPresence);
  const typingTimerRef = useRef(null);

  // Keep callback refs fresh
  onMessageRef.current = onMessage;
  onTypingRef.current = onTyping;
  onReadRef.current = onRead;
  onPresenceRef.current = onPresence;

  // ── Register Deal Room Listeners ───────────────────────────────
  useEffect(() => {
    if (!ws || !roomId) return;

    const unsubRoom = ws.subscribeToDealRoom(roomId, (data) => {
      if (data.type === 'dealroom_message') {
        onMessageRef.current?.(data);
      } else if (data.type === 'dealroom_typing') {
        onTypingRef.current?.(data);
      } else if (data.type === 'dealroom_read') {
        onReadRef.current?.(data);
      }
    });

    return () => {
      unsubRoom?.();
    };
  }, [ws, roomId]);

  // ── Register Presence Listener ─────────────────────────────────
  useEffect(() => {
    if (!ws || !onPresence) return;

    const unsubPresence = ws.subscribeToPresence((data) => {
      onPresenceRef.current?.(data);
    });

    return () => {
      unsubPresence?.();
    };
  }, [ws, !!onPresence]);

  // ── Public API ─────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content) => {
      if (!roomId || !ws) return false;
      return ws.sendDealRoomMessage(roomId, content);
    },
    [roomId, ws]
  );

  const sendMediaMessage = useCallback(
    (messageId) => {
      if (!roomId || !ws) return false;
      return ws.sendDealRoomMedia(roomId, messageId);
    },
    [roomId, ws]
  );

  const sendTyping = useCallback(() => {
    if (!roomId || !ws) return false;
    ws.sendDealRoomTyping(roomId);
    // Debounce re-sending
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {}, 3000);
    return true;
  }, [roomId, ws]);

  const markRead = useCallback(() => {
    if (!roomId || !ws) return false;
    return ws.sendDealRoomRead(roomId);
  }, [roomId, ws]);

  return {
    isConnected: ws?.isConnected ?? false,
    sendMessage,
    sendMediaMessage,
    sendTyping,
    markRead,
  };
}