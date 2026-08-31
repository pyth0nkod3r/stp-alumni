// lib/hooks/useWebSocket.js
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

export function useWebSocket({
  onNewMessage,
  onTyping,
  onReadReceipt,
  onPresence,
} = {}) {
  const ws = useWebSocketContext();

  const onNewMessageRef = useRef(onNewMessage);
  const onTypingRef = useRef(onTyping);
  const onReadReceiptRef = useRef(onReadReceipt);
  const onPresenceRef = useRef(onPresence);

  // Keep callback refs fresh
  onNewMessageRef.current = onNewMessage;
  onTypingRef.current = onTyping;
  onReadReceiptRef.current = onReadReceipt;
  onPresenceRef.current = onPresence;

  useEffect(() => {
    if (!ws) return;

    const unsubs = [];

    if (onNewMessage) {
      unsubs.push(
        ws.subscribeToDirectMessage((data) => {
          onNewMessageRef.current?.(data);
        })
      );
    }

    if (onTyping) {
      unsubs.push(
        ws.subscribeToDirectTyping((data) => {
          onTypingRef.current?.(data);
        })
      );
    }

    if (onReadReceipt) {
      unsubs.push(
        ws.subscribeToDirectRead((data) => {
          onReadReceiptRef.current?.(data);
        })
      );
    }

    if (onPresence) {
      unsubs.push(
        ws.subscribeToPresence((data) => {
          onPresenceRef.current?.(data);
        })
      );
    }

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [ws, !!onNewMessage, !!onTyping, !!onReadReceipt, !!onPresence]);

  const sendMessage = useCallback(
    (conversationId, content) => {
      if (!ws) return false;
      return ws.sendDirectMessage(conversationId, content);
    },
    [ws]
  );

  const sendTyping = useCallback(
    (conversationId) => {
      if (!ws) return false;
      return ws.sendDirectTyping(conversationId);
    },
    [ws]
  );

  const sendReadReceipt = useCallback(
    (conversationId) => {
      if (!ws) return false;
      return ws.sendDirectRead(conversationId);
    },
    [ws]
  );

  return {
    isConnected: ws?.isConnected ?? false,
    sendMessage,
    sendTyping,
    sendReadReceipt,
  };
}